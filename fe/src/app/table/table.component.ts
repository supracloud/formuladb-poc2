/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';

import * as tableState from './table.state';
import { TableColumn } from "@core/domain/uimetadata/table";
import {
    GridOptions, GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellClickedEvent, CellFocusedEvent
} from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';
import * as fromTable from './table.state';
import * as _ from 'lodash';
import { TableHeaderComponent } from './table-header.component';
import { Entity } from "@core/domain/metadata/entity";
import { TableService } from './table.service';
import { I18nPipe } from '../crosscutting/i18n/i18n.pipe';
import { FrmdbStreamsService } from '../frmdb-streams/frmdb-streams.service';

export class TableComponent implements OnInit, OnDestroy {

    statusBar = {
        statusPanels: [
            { statusPanel: 'agTotalRowCountComponent', align: 'left' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' }
        ],
    };
    autoGroupColumnDef = { width: 150 };

    sideBar = {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                // toolPanelParams: {
                //     suppressPivots: true,
                //     suppressPivotMode: true
                // }
            }
        ],
        defaultToolPanel: 'columns'
    };


    private table$: Observable<tableState.Table>;
    private currentEntity: Entity | undefined;
    public currentRow: tableState.DataObj;
    private selectedRowIdx: number;
    private agGridOptions: GridOptions = {};
    private gridApi: GridApi;
    private columns: any[] = [];
    private filters: any = {};
    private sort: any = {};
    private subscriptions: Subscription[] = [];
    private highlightColumns: { [tableName: string]: { [columnName: string]: string } } = {};

    public frameworkComponents;
    public defaultColDef;

    private tableState: tableState.Table;

    constructor(public frmdbStreams: FrmdbStreamsService,
        private router: Router,
        private route: ActivatedRoute,
        private tableService: TableService,
        private i18npipe: I18nPipe) {
        // tslint:disable-next-line:max-line-length
        LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_14_March_2019__MTU1MjUyMTYwMDAwMA==8917c155112df433b2b09086753e8903');
        this.frameworkComponents = { agColumnHeader: TableHeaderComponent };
        this.defaultColDef = {
            width: 100,
            headerComponentParams: { menuIcon: 'fa-bars' }
        };
        this.table$ = frmdbStreams.table$;
    }

    applyCellStyles(params) {
        if (this.currentEntity && this.currentEntity._id && this.highlightColumns[this.currentEntity._id]
            && this.highlightColumns[this.currentEntity._id][params.colDef.field]) {
            return { backgroundColor: this.highlightColumns[this.currentEntity._id][params.colDef.field].replace(/^c_/, '#') };
        }
        return null;
    }

    agFilter(ctype: string) {
        switch (ctype) {
            case 'STRING':
                return 'agTextColumnFilter';
            case 'NUMBER':
                return 'agNumberColumnFilter';
            case 'DATE':
                return 'agDateColumnFilter';
            case 'FORMULA':
                return 'agTextColumnFilter';
            default:
                return null;
        }
    }

    ngOnInit(): void {

    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api as GridApi;
        this.subscriptions.push(this.frmdbStreams.entity$
            .subscribe(e => {
                if (e) {
                    this.currentEntity = e;
                    this.gridApi.setServerSideDatasource(this.tableService.getDataSource(e));
                }
            }));
        this.subscriptions.push(this.table$.subscribe(t => {
            console.log('new table ', t);
            if (!t.columns) { return; }
            try {
                this.tableState = _.cloneDeep(t);
                this.columns = t.columns.map(c => <GridOptions>{
                    headerName: this.i18npipe.transform(c.name),
                    field: c.name,
                    width: c.width ? c.width : 100,
                    filter: this.agFilter(c.type),
                    filterParams: {
                        newRowsAction: 'keep',
                    },
                    enableRowGroup: true,
                    enableValue: true,

                    cellStyle: (cp: any) => this.applyCellStyles(cp),
                });

                this.gridApi.setColumnDefs(this.columns);
                const fs = {};
                t.columns.filter(c => c.filter)
                    .forEach(c => {
                        if (c.filter) {
                            fs[c.name] = { type: c.filter.operator, filter: c.filter.value, filterType: 'text' };
                        }
                    });
                this.gridApi.setFilterModel(fs);
                this.gridApi.setSortModel(t.columns.filter(c => c.sort !== null)
                    .map(c => <any>{ colId: c.name, sort: c.sort }));

            } catch (ex) {
                console.error(ex);
            }
        }));
        this.subscriptions.push(this.frmdbStreams.formulaHighlightedColumns$
            .subscribe(h => {
                this.highlightColumns = h || {};
                if (this.gridApi) {
                    this.gridApi.refreshCells({ force: true });
                }
            })
        );

        this.gridApi.closeToolPanel();
    }

    refreshData() {

    }

    onCellFocused(event: CellFocusedEvent) {
        if (event.column && event.column.getColDef() && event.column.getColDef().field) {
            this.frmdbStreams.userEvents$.next({type: "UserSelectedCell", columnName: event.column.getColDef().field!});
        }
    }

    onRowClicked(event: RowClickedEvent) {
        this.frmdbStreams.userEvents$.next({type: "UserSelectedRow", dataObj: event.data});
    }

    onRowDoubleClicked(event: RowDoubleClickedEvent) {
        if (event.data._id && this.currentEntity && this.currentEntity.isEditable) {
            this.router.navigate(['./' + event.data._id], { relativeTo: this.route });
        }
    }

    columnMoving(event: any) {
        if (this.tableState) {
            const colx: number = this.tableState.columns.findIndex(c => c.name === event.column.colId);
            const col: TableColumn = this.tableState.columns.splice(colx, 1)[0];
            this.tableState.columns.splice(event.toIndex, 0, col);

        }
    }

    columnMoved(event: ColumnMovedEvent) {
        if (this.tableState) {
            this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    columnResized(event: ColumnResizedEvent) {
        if (event.finished && this.tableState !== null && event && event.column) {
            const col = (this.tableState.columns || [])
                .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
            if (col) { col.width = event.column.getActualWidth(); }
            this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    filterChanged(event: any) {
        if (!_.isEqual(this.filters, this.gridApi.getFilterModel())) {
            const fs = this.gridApi.getFilterModel();
            this.tableState.columns.forEach(c => {
                if (fs[c.name]) {
                    c.filter = { operator: fs[c.name].type, value: fs[c.name].filter };
                } else {
                    c.filter = undefined;
                }
            });
            this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
        this.filters = this.gridApi.getFilterModel();
    }

    sortChanged(event: any) {
        if (!_.isEqual(this.sort, this.gridApi.getSortModel())) {
            const srt = this.gridApi.getSortModel();
            this.tableState.columns.forEach(c => {
                const s = srt.find(i => i.colId === c.name);
                if (s) {
                    c.sort = s.sort;
                } else {
                    c.sort = undefined;
                }
            });
            this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
        this.sort = this.gridApi.getSortModel();
    }

    excel() {
        this.gridApi.exportDataAsExcel();
    }
}
