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

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'mwz-table',
    templateUrl: 'table.component.html',
    styleUrls: ['table.component.scss']
})

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
    public data: tableState.DataObj[] = [];
    private selectedRowIdx: number;
    private highlighted: string;
    private agGridOptions: GridOptions = {};
    private gridApi: GridApi;
    private columns: any[] = [];
    private filters: any = {};
    private sort: any = {};
    private subscriptions: Subscription[] = [];
    private highlightColumns: { [tableName: string]: { [columnName: string]: string } } = {};

    private frameworkComponents;
    private defaultColDef;

    private tableState: tableState.Table;

    constructor(private store: Store<tableState.TableState>, private router: Router, private route: ActivatedRoute,
        private tableService: TableService) {
        // tslint:disable-next-line:max-line-length
        LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_14_March_2019__MTU1MjUyMTYwMDAwMA==8917c155112df433b2b09086753e8903');
        this.frameworkComponents = { agColumnHeader: TableHeaderComponent };
        this.defaultColDef = {
            width: 100,
            headerComponentParams: { menuIcon: 'fa-bars' }
        };
        this.table$ = store.select(tableState.getTableState);
    }

    applyCellStyles(params) {
        if (this.currentEntity && this.currentEntity._id && this.highlightColumns[this.currentEntity._id]
            && this.highlightColumns[this.currentEntity._id][params.colDef.field]) {
            return { backgroundColor: this.highlightColumns[this.currentEntity._id][params.colDef.field].replace(/^c_/, '#') };
        }
        return null;
    }

    ngOnInit(): void {

    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api as GridApi;
        this.subscriptions.push(this.store.select(tableState.getTableEntityState)
            .subscribe(e => {
                if (e) {
                    this.currentEntity = e;
                    this.gridApi.setServerSideDatasource(this.tableService.getDataSource(e._id));
                }
            }));
        this.subscriptions.push(this.table$.subscribe(t => {
            console.log('new table ', t);
            if (!t.columns) { return; }
            try {
                this.tableState = _.cloneDeep(t);
                this.columns = t.columns.map(c => <GridOptions>{
                    headerName: c.name,
                    field: c.name,
                    width: c.width ? c.width : 100,
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
        this.subscriptions.push(this.store.select(tableState.getTableHighlightColumns)
            .subscribe(h => {
                this.highlightColumns = h || {};
                if (this.gridApi) {
                    this.gridApi.refreshCells({ force: true });
                }
            })
        );
    }

    refreshData() {

    }

    onCellFocused(event: CellFocusedEvent) {
        if (!event.column) { return; }
        this.store.dispatch(new fromTable.UserSelectCell(event.column.getColDef().field));
    }

    onEditClicked(row: tableState.DataObj) {
        this.router.navigate(['./' + row._id], { relativeTo: this.route });
    }

    onRowDoubleClicked(event: RowDoubleClickedEvent) {
        if (event.data._id) {
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
            this.store.dispatch(new fromTable.ServerEventModifiedTable(this.tableState));
        }
    }

    columnResized(event: ColumnResizedEvent) {
        if (event.finished && this.tableState !== null && event && event.column) {
            const col = (this.tableState.columns || [])
                .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
            if (col) { col.width = event.column.getActualWidth(); }
            this.store.dispatch(new fromTable.ServerEventModifiedTable(this.tableState));
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
            this.store.dispatch(new fromTable.ServerEventModifiedTable(this.tableState));
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
            this.store.dispatch(new fromTable.ServerEventModifiedTable(this.tableState));
        }
        this.sort = this.gridApi.getSortModel();
    }

    excel() {
        this.gridApi.exportDataAsExcel();
    }
}
