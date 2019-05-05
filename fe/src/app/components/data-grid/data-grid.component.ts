/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import {
    GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellFocusedEvent, ColDef
} from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';
import * as _ from 'lodash';
import { TableService } from '../../effects/table.service';
import { I18nPipe } from '../../crosscutting/i18n/i18n.pipe';
import { waitUntilNotNull } from '@core/ts-utils';
import { FrmdbLy } from '@core/domain/uimetadata/page';
import { TableFpatternRenderer } from './table-fpattern.component';
import { elvis } from '@core/elvis';
import { TableToolsComponent } from './table-tools.component';
import { DataGrid, TableColumn } from '@core/domain/uimetadata/node-elements';
import { scalarFormulaEvaluate } from '@core/scalar_formula_evaluate';
import { DataObj } from '@core/domain/metadata/data_obj';
import { tableInitialState } from '@fe/app/state/app.state';
import { ExcelStyles } from './excel-styles';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BaseNodeComponent } from '../base_node';
import { FormEditingService } from '../form-editing.service';

@Component({
    selector: 'frmdb-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent extends BaseNodeComponent {

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
                labelDefault: "Optiuni Tabel",
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

    excelStyles = _.cloneDeep(ExcelStyles);
    private gridApi: GridApi;
    private gridColumnApi;
    private columns: ColDef[] = [];
    private filters: any = {};
    private sort: any = {};
    private highlightColumns: { [tableName: string]: { [columnName: string]: string } } = {};

    public frameworkComponents;
    public defaultColDef;
    headerHeight = 50;
    dataGrid: DataGrid;

    constructor(public formEditingService: FormEditingService,
        private tableService: TableService,
        private i18npipe: I18nPipe,
        private router: Router,
        private route: ActivatedRoute,
        private _ngZone: NgZone        
    ){
            
        super(formEditingService);

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


    applyCellStyles(params) {
        let entityName = this.dataGrid.refEntityName;
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
        if (elvis(this.dataGrid).layout === FrmdbLy.ly_fpattern) {
            return 250;
        } else return 25;
    }

    ngOnInit(): void {
        console.debug(this.fullpath, this.nodel, this.formgrp);
        this.dataGrid = this.nodel as DataGrid;

        console.debug("ngOnInit", this.dataGrid, this.gridApi);
        this.intAgGrid();
    }

    async intAgGrid() {
        console.debug("ngOnInit", this.dataGrid, this.gridApi);

        this.headerHeight = this.dataGrid.headerHeight || 50;
        if (this.dataGrid.headerBackground) this.excelStyles.find(s => s.id === "header")!.interior = {
            //FIXME: setting header background does not seem to work
            color: this.dataGrid.headerBackground,
            pattern: "Solid",
        };
        await waitUntilNotNull(() => Promise.resolve(this.gridApi));
        this.gridApi.setServerSideDatasource(this.tableService.getDataSource(this.dataGrid.refEntityName));
        try {

            let cssClassRules: ColDef['cellClassRules'] = {};
            let conditionalFormatting = this.dataGrid.conditionalFormatting || {};
            for (let cssClassName of Object.keys(elvis(conditionalFormatting))) {
                cssClassRules[cssClassName] = function(params) {
                    return scalarFormulaEvaluate(params.data || {}, conditionalFormatting[cssClassName]);
                }
            }
            let cols = this.dataGrid.columns || [];

            this.columns = cols.map(c => <ColDef>{
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
            cols.filter(c => c.filter)
                .forEach(c => {
                    if (c.filter) {
                        fs[c.name] = { type: c.filter.operator, filter: c.filter.value, filterType: 'text' };
                    }
                });

            this.gridApi.setColumnDefs(this.columns);
            try {
                this.gridApi.setFilterModel(fs);
                this.gridApi.setSortModel(cols.filter(c => c.sort !== null)
                    .map(c => <any>{ colId: c.name, sort: c.sort }));
                this.gridApi.setHeaderHeight(this.headerHeight);
            } catch (err) {
                console.error(err);
            }

        } catch (ex) {
            console.error(ex);
        }

        this.frmdbStreams.formulaHighlightedColumns$.pipe(untilDestroyed(this))
        .subscribe(h => {
            this.highlightColumns = h || {};
            if (this.gridApi) {
                this.gridApi.refreshCells({ force: true });
            }
        });

        this.frmdbStreams.serverEvents$.pipe(untilDestroyed(this)).subscribe(serverEvent => {
            if (!this.gridApi) return;
            if (serverEvent.type === "ServerDeletedFormData") {
                this.gridApi.purgeServerSideCache()
            }
        });
    }
    ngOnDestroy(): void {
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
        console.debug("onGridReady", this.dataGrid, this.gridApi);
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
        if (this.dataGrid.clickAction == "autocomplete") {
            this.setAutocompleteProperties(event.data);
        } else if (this.dataGrid.clickAction == "select-table-row") {
            this.userSelectTableRow(event.data);
        } else {
            console.warn("Unknown clickAction " + this.dataGrid.clickAction);
        }
    }

    onRowDoubleClicked(event: RowDoubleClickedEvent) {
        if (this.dataGrid.dblClickAction === "edit-row") {
            this.navigateToFormPage(event.data);
        }
    }

    userSelectTableRow(dataObj: DataObj) {
        this.frmdbStreams.userEvents$.next({ type: "UserSelectedRow", dataObj });
    }

    navigateToFormPage(dataObj: DataObj) {
        if (dataObj._id) {
            this._ngZone.run(() => {
                this.router.navigate(['./' + dataObj._id], { relativeTo: this.route });
            })
        }
    }

    setAutocompleteProperties(dataObj: DataObj) {
        if (!this.dataGrid) return;
        for (let prop of this.dataGrid.autocompleteProperties || []) {
            let ctrl = this.formgrp.get(this.getPropPath(prop));
            if (ctrl) {
                ctrl.markAsDirty();
                ctrl.setValue(dataObj[prop.refPropertyName]);
            }
        }
    }

    getPropPath(prop: { propertyName: string }) {
        return (this.fullpath ? this.fullpath + '.' : '') + prop.propertyName;
    }

    columnMoving(event: any) {
        if (this.dataGrid) {
            const colx: number = (this.dataGrid.columns||[]).findIndex(c => c.name === event.column.colId);
            const col: TableColumn = (this.dataGrid.columns||[]).splice(colx, 1)[0];
            (this.dataGrid.columns||[]).splice(event.toIndex, 0, col);
        }
    }

    columnMoved(event: ColumnMovedEvent) {
        if (this.dataGrid) {
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    columnResized(event: ColumnResizedEvent) {
        if (event.finished && this.dataGrid !== null && event && event.column) {
            const col = (this.dataGrid.columns || [])
                .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
            if (col) { col.width = event.column.getActualWidth(); }
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        }
    }

    filterChanged(event: any) {
        if (!_.isEqual(this.filters, this.gridApi.getFilterModel())) {
            const fs = this.gridApi.getFilterModel();
            (this.dataGrid.columns||[]).forEach(c => {
                if (fs[c.name]) {
                    c.filter = { operator: fs[c.name].type, value: fs[c.name].filter };
                } else {
                    c.filter = undefined;
                }
            });
            this.frmdbStreams.userEvents$.next({ type: "UserModifiedTableUi", table: this.dataGrid });
        }
        this.filters = this.gridApi.getFilterModel();
    }

    sortChanged(event: any) {
        if (!_.isEqual(this.sort, this.gridApi.getSortModel())) {
            const srt = this.gridApi.getSortModel();
            (this.dataGrid.columns||[]).forEach(c => {
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
        // this.gridColumnApi.autoSizeColumns(allColumnIds);
    }
}
