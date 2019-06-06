/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Grid, GridOptions,
    GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellFocusedEvent, ColDef
} from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';
import * as _ from 'lodash';
import { waitUntilNotNull } from '@domain/ts-utils';

import { elvis } from '@core/elvis';
import { DataGridToolsComponent } from './data-grid-tools.component';
import { DataGrid, TableColumn } from '@domain/uimetadata/node-elements';
import { scalarFormulaEvaluate } from '@core/scalar_formula_evaluate';
import { DataObj } from '@domain/metadata/data_obj';
import { ExcelStyles } from './excel-styles';
import { FrmdbElementMixin } from '@live-dom-template/frmdb-element';
import { I18N } from '@web/i18n.service';
import { TABLE_SERVICE } from '@web/table.service';
import { Pn } from '@domain/metadata/entity';

const html: string = require('raw-loader!@data-grid/data-grid.component.html').default;
const css: string = require('raw-loader!sass-loader?sourceMap!@data-grid/data-grid.component.scss').default;

export class DataGridComponent extends HTMLElement implements FrmdbElementMixin {

    on = FrmdbElementMixin.prototype.on.bind(this);
    emit = FrmdbElementMixin.prototype.emit.bind(this);
    render = FrmdbElementMixin.prototype.render.bind(this);

    dataGrid: DataGrid;
    
    tableName: string;
    _gridColumns: TableColumn[];
    get gridColumns(): string { return JSON.stringify(this._gridColumns) };
    set gridColumns(val: string) { this._gridColumns = JSON.parse(val) }
    highlightColumns: { [tableName: string]: { [columnName: string]: string } } = {};
    static get observedAttributes(): (keyof DataGridComponent)[] {
        return ['tableName','gridColumns', 'highlightColumns'];
    }

    private gridApi: GridApi;
    private gridColumnApi;
    private columns: ColDef[] = [];
    private filters: any = {};
    private sort: any = {};

    private gridOptions: GridOptions = {

        headerHeight: 50,
        suppressContextMenu: true,
        onGridSizeChanged: this.onGridSizeChanged.bind(this),
        components: {
            // agColumnHeader: TableHeaderComponent,
            tableActionsToolPanel: DataGridToolsComponent,
        },
        defaultColDef: {
            width: 100,
            headerComponentParams: { menuIcon: 'fa-bars' }
        },
        onRowDoubleClicked: (event: RowDoubleClickedEvent) => {
            this.emit({ type: "UserDblClickRow", dataObj: event.data } );
        },
        onRowClicked: (event: RowClickedEvent) => {
            if (this.dataGrid.clickAction == "autocomplete") {
                this.emit({ type: "UserSelectedRow", dataObj: event.data} );
            } else if (this.dataGrid.clickAction == "select-table-row") {
                this.userSelectTableRow(event.data);
            } else {
                console.warn("Unknown clickAction " + this.dataGrid.clickAction);
            }
        },
        onCellFocused: (event: CellFocusedEvent) => {
            if (event.column && event.column.getColDef() && event.column.getColDef().field) {
                this.emit({ type: "UserSelectedCell", columnName: event.column.getColDef().field! });
            }
        },
        autoGroupColumnDef: { width: 150 },
        onGridReady: (params: GridReadyEvent) => {
            if (!this.gridApi) {
                this.gridApi = params.api as GridApi;
                this.gridColumnApi = params.columnApi;
                this.gridApi.closeToolPanel();
            }
            console.debug("onGridReady", this.dataGrid, this.gridApi);
        },
        onColumnMoved: (event: ColumnMovedEvent) => {
            if (this.dataGrid) {
                // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
            }
        },
        onColumnResized: (event: ColumnResizedEvent) => {
            if (event.finished && this.dataGrid !== null && event && event.column) {
                const col = (this._gridColumns || [])
                    .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
                if (col) { col.width = event.column.getActualWidth(); }
                // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
            }
        },
        onFilterChanged: (event: any) => {
            if (!_.isEqual(this.filters, this.gridApi.getFilterModel())) {
                const fs = this.gridApi.getFilterModel();
                (this._gridColumns || []).forEach(c => {
                    if (fs[c.name]) {
                        c.filter = { operator: fs[c.name].type, value: fs[c.name].filter };
                    } else {
                        c.filter = undefined;
                    }
                });
                this.emit({ type: "UserModifiedTableUi", table: this.dataGrid });
            }
            this.filters = this.gridApi.getFilterModel();
        },
        onSortChanged: (event: any) => {
            if (!_.isEqual(this.sort, this.gridApi.getSortModel())) {
                const srt = this.gridApi.getSortModel();
                (this._gridColumns || []).forEach(c => {
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
        },
        onFirstDataRendered: ($event) => {
            var allColumnIds: any[] = [];
            (this.gridColumnApi.getAllColumns() || []).forEach(function (column) {
                allColumnIds.push(column.colId);
            });
            // this.gridColumnApi.autoSizeColumns(allColumnIds);
        },
        suppressClipboardPaste: true,
        rowModelType: "serverSide",
        enableRangeSelection: true, 
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalRowCountComponent', align: 'left' },
                { statusPanel: 'agFilteredRowCountComponent' },
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' }
            ],
        },
        sideBar: {
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
        },
        excelStyles: _.cloneDeep(ExcelStyles),
    };

    _shadowRoot: ShadowRoot;
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });

        this.style.minWidth = "28vw";
        this.style.minHeight = "25vh";
        this.style.display = "block";

        this._shadowRoot.innerHTML = /*html*/ `
            <style>${css}</style>
            ${html}
        `;

        // tslint:disable-next-line:max-line-length
        // LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_14_March_2019__MTU1MjUyMTYwMDAwMA==8917c155112df433b2b09086753e8903');
        LicenseManager.setLicenseKey('Evaluation_License-_Not_For_Production_Valid_Until_8_April_2020__MTU4NjMwMDQwMDAwMA==4c5e7874be87bd3e2fdc7dd53041fbf7');
    }

    
    connectedCallback() {
        new Grid(this._shadowRoot.querySelector("#myGrid") as HTMLElement, this.gridOptions);
    }
    
    attributeChangedCallback(name: keyof DataGridComponent, oldVal, newVal) {
        if (!this.gridApi) return;
        if (name == 'highlightColumns') {
            if (this.gridApi) {
                this.gridApi.refreshCells({ force: true });
            }
        } else if (name == 'dataGrid') {
            this.initAgGrid();
        } else if ("TODOO how to pass in events from outside ServerDeletedFormData" == "TODOO how to pass in events from outside ServerDeletedFormData") {
            this.gridApi.purgeServerSideCache()
        }
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

    columnMoving(event: any) {
        if (this.dataGrid) {
            const colx: number = (this._gridColumns || []).findIndex(c => c.name === event.column.colId);
            const col: TableColumn = (this._gridColumns || []).splice(colx, 1)[0];
            (this._gridColumns || []).splice(event.toIndex, 0, col);
        }
    }

    async initAgGrid() {
        console.debug("ngOnInit", this.dataGrid, this.gridApi);

        this.gridOptions.context = this.dataGrid;
        this.gridOptions.headerHeight = this.dataGrid.headerHeight || 50;
        if (this.dataGrid.headerBackground) this.gridOptions.excelStyles!.find(s => s.id === "header")!.interior = {
            //FIXME: setting header background does not seem to work
            color: this.dataGrid.headerBackground,
            pattern: "Solid",
        };
        await waitUntilNotNull(() => Promise.resolve(this.gridApi));
        this.gridApi.setServerSideDatasource(TABLE_SERVICE.getDataSource(this.dataGrid.refEntityName));
        try {

            let cssClassRules: ColDef['cellClassRules'] = {};
            let conditionalFormatting = this.dataGrid.conditionalFormatting || {};
            for (let cssClassName of Object.keys(elvis(conditionalFormatting))) {
                cssClassRules[cssClassName] = function (params) {
                    return scalarFormulaEvaluate(params.data || {}, conditionalFormatting[cssClassName]);
                }
            }
            let cols = this._gridColumns || [];

            this.columns = cols.map(c => <ColDef>{
                headerName: I18N.tt(c.name),
                field: c.name,
                width: c.width ? c.width : 100,
                filter: this.agFilter(c.type || Pn.STRING),
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
                this.gridApi.setHeaderHeight(this.gridOptions.headerHeight);
            } catch (err) {
                console.error(err);
            }

        } catch (ex) {
            console.error(ex);
        }
    }
    ngOnDestroy(): void {
    }

    onGridSizeChanged() {
        if (!this.gridApi) return;
        // this.gridApi.sizeColumnsToFit();
    }

    valueFormatter(params) {
        if (params.colDef.field === '_id') return (params.value || '').replace(/^.*~~/, '');
        else return params.value;
    }

    userSelectTableRow(dataObj: DataObj) {
        this.emit({ type: "UserSelectedRow", dataObj } );
    }

}

window.customElements.define('frmdb-data-grid', DataGridComponent);
