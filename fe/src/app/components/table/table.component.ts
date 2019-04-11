/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, OnDestroy, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import {
    GridOptions, GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellClickedEvent, CellFocusedEvent, ValueFormatterService, ColDef
} from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';
import * as _ from 'lodash';
import { TableHeaderComponent } from './table-header.component';
import { Entity } from "@core/domain/metadata/entity";
import { TableService } from '../../effects/table.service';
import { I18nPipe } from '../../crosscutting/i18n/i18n.pipe';
import { FrmdbStreamsService } from '../../state/frmdb-streams.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { waitUntilNotNull } from '@core/ts-utils';
import { Page, FrmdbLy } from '@core/domain/uimetadata/page';
import { TableFpatternRenderer } from './table-fpattern.component';
import { elvis } from '@core/elvis';
import { TableToolsComponent } from './table-tools.component';
import { Table, TableColumn } from '@core/domain/uimetadata/table';
import { scalarFormulaEvaluate } from '@core/scalar_formula_evaluate';
import { DataObj } from '@core/domain/metadata/data_obj';
import { tableInitialState } from '@fe/app/state/app.state';
import { ExcelStyles } from './excel-styles';

@Component({
    selector: 'frmdb-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

    @Input() tableObservable: Observable<Table>;

    @Output() onDataObjSelected: EventEmitter<DataObj> = new EventEmitter()
    @Output() onRowDblClicked: EventEmitter<DataObj> = new EventEmitter()

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
                id: "tableActions",
                labelDefault: "Table Actions",
                labelKey: "tableActions",
                iconKey: "table-actions",
                toolPanel: "tableActionsToolPanel"
            },            
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
        defaultToolPanel: 'tableActions'
    };

    excelStyles = ExcelStyles;
    private selectedRowIdx: number;
    private agGridOptions: GridOptions = {};
    private gridApi: GridApi;
    private gridColumnApi;
    private columns: ColDef[] = [];
    private filters: any = {};
    private sort: any = {};
    private subscriptions: Subscription[] = [];
    private highlightColumns: { [tableName: string]: { [columnName: string]: string } } = {};

    public frameworkComponents;
    public defaultColDef;
    headerHeight = 25;
    table: Table;

    constructor(public frmdbStreams: FrmdbStreamsService,
        private tableService: TableService,
        private i18npipe: I18nPipe) {
        // tslint:disable-next-line:max-line-length
        // LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_14_March_2019__MTU1MjUyMTYwMDAwMA==8917c155112df433b2b09086753e8903');
        LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_8_April_2020__MTU4NjMwMDQwMDAwMA==4c5e7874be87bd3e2fdc7dd53041fbf7');
        
        this.frameworkComponents = { 
            // agColumnHeader: TableHeaderComponent,
            tableFpatternRenderer: TableFpatternRenderer,
            tableActionsToolPanel: TableToolsComponent,
        };
        this.defaultColDef = {
            width: 100,
            headerComponentParams: { menuIcon: 'fa-bars' }
        };

    }

    entityId() {
        if (!this.table || !this.table._id) return undefined;
        return this.table._id.replace(/^Table_:\w+[^][^]/, '');
    }

    applyCellStyles(params) {
        let entityName = this.entityId();
        if (entityName && this.highlightColumns[entityName]
            && this.highlightColumns[entityName][params.colDef.field]) {
            return { backgroundColor: this.highlightColumns[entityName][params.colDef.field].replace(/^c_/, '#') };
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

    getRowHeight = () => {
        if (elvis(elvis(this.table).page).layout === FrmdbLy.ly_fpattern) {
            return 250;
        } else return 25;
    }
    
    ngOnInit(): void {
        console.debug("ngOnInit", this.table);

        this.tableObservable.subscribe(async (t) => {
            console.debug('new table ', t, this.gridApi);
            this.table = _.cloneDeep(t)
            await waitUntilNotNull(() => Promise.resolve(this.gridApi));
            this.gridApi.setServerSideDatasource(this.tableService.getDataSource(this.entityId()));
            console.debug('new table ', t);
            if (!t.columns) { return; }
            try {
                if (t.page.layout === FrmdbLy.ly_fpattern) {
                    this.headerHeight = 0;
                    this.columns = [{
                        headerName: "N/A",
                        field: "picture",
                        cellRenderer: "tableFpatternRenderer",
                        editable: true,
                        colId: "picture",
                        width: 800,
                    }];
                    this.gridApi.setColumnDefs(this.columns);
                    this.gridApi.setHeaderHeight(0);
                    this.gridApi.sizeColumnsToFit();
                    return;    
                }

                let cssClassRules: ColDef['cellClassRules'] = {};
                let conditionalFormatting = t.conditionalFormatting || {};
                for (let cssClassName of Object.keys(elvis(conditionalFormatting))) {
                    cssClassRules[cssClassName] = function(params) {
                        return scalarFormulaEvaluate(params.data || {}, conditionalFormatting[cssClassName]);
                    }
                }

                this.columns = t.columns.map(c => <ColDef>{
                    headerName: this.i18npipe.transform(c.name),
                    field: c.name,
                    width: c.width ? c.width : 100,
                    filter: this.agFilter(c.type),
                    filterParams: {
                        newRowsAction: 'keep',
                    },
                    enableRowGroup: true,
                    enableValue: true,
                    resizable: true,
                    valueFormatter: (params) => this.valueFormatter(params),
                    cellStyle: (cp: any) => this.applyCellStyles(cp),
                    cellClassRules: cssClassRules,
                });
          
                const fs = {};
                t.columns.filter(c => c.filter)
                    .forEach(c => {
                        if (c.filter) {
                            fs[c.name] = { type: c.filter.operator, filter: c.filter.value, filterType: 'text' };
                        }
                    });

                this.gridApi.setColumnDefs(this.columns);
                try {
                    this.gridApi.setFilterModel(fs);
                    this.gridApi.setSortModel(t.columns.filter(c => c.sort !== null)
                        .map(c => <any>{ colId: c.name, sort: c.sort }));
                } catch (err) {
                    console.error(err);
                }

            } catch (ex) {
                console.error(ex);
            }
        });
        this.subscriptions.push(this.frmdbStreams.formulaHighlightedColumns$
            .subscribe(h => {
                this.highlightColumns = h || {};
                if (this.gridApi) {
                    this.gridApi.refreshCells({ force: true });
                }
            })
        );

        this.subscriptions.push(this.frmdbStreams.serverEvents$.subscribe(serverEvent => {
            if (!this.gridApi) return;
            if (serverEvent.type === "ServerDeletedFormData") {
                this.gridApi.purgeServerSideCache()
            }
        }));
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    onGridSizeChanged() {
        if (!this.gridApi) return;
        // this.gridApi.sizeColumnsToFit();
    }
    onGridReady(params: GridReadyEvent) {
        if (!this.gridApi) {
            this.gridApi = params.api as GridApi;
            this.gridColumnApi = params.columnApi;
            this.gridApi.closeToolPanel();
        }
        console.debug("onGridReady", this.table, this.gridApi);
    }

    valueFormatter(params) {
        if (params.colDef.field === '_id') return (params.value||'').replace(/^.*~~/, '');
        else return params.value;
    }

    onCellFocused(event: CellFocusedEvent) {
        if (event.column && event.column.getColDef() && event.column.getColDef().field) {
            this.frmdbStreams.userEvents$.next({ type: "UserSelectedCell", columnName: event.column.getColDef().field! });
        }
    }

    onRowClicked(event: RowClickedEvent) {
        this.onDataObjSelected.emit(event.data);
    }

    onRowDoubleClicked(event: RowDoubleClickedEvent) {
        this.onRowDblClicked.emit(event.data);
    }

    columnMoving(event: any) {
        if (this.table) {
            const colx: number = this.table.columns.findIndex(c => c.name === event.column.colId);
            const col: TableColumn = this.table.columns.splice(colx, 1)[0];
            this.table.columns.splice(event.toIndex, 0, col);
        }
    }

    columnMoved(event: ColumnMovedEvent) {
        if (this.table) {
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    columnResized(event: ColumnResizedEvent) {
        if (event.finished && this.table !== null && event && event.column) {
            const col = (this.table.columns || [])
                .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
            if (col) { col.width = event.column.getActualWidth(); }
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    filterChanged(event: any) {
        if (!_.isEqual(this.filters, this.gridApi.getFilterModel())) {
            const fs = this.gridApi.getFilterModel();
            this.table.columns.forEach(c => {
                if (fs[c.name]) {
                    c.filter = { operator: fs[c.name].type, value: fs[c.name].filter };
                } else {
                    c.filter = undefined;
                }
            });
            this.frmdbStreams.userEvents$.next({ type: "UserModifiedTableUi", table: this.table });
        }
        this.filters = this.gridApi.getFilterModel();
    }

    sortChanged(event: any) {
        if (!_.isEqual(this.sort, this.gridApi.getSortModel())) {
            const srt = this.gridApi.getSortModel();
            this.table.columns.forEach(c => {
                const s = srt.find(i => i.colId === c.name);
                if (s) {
                    c.sort = s.sort;
                } else {
                    c.sort = undefined;
                }
            });
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
        this.sort = this.gridApi.getSortModel();
    }

    onFirstDataRendered($event) {
        var allColumnIds: any[] = [];
        (this.gridColumnApi.getAllColumns() || []).forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        this.gridColumnApi.autoSizeColumns(allColumnIds);
    }
}
