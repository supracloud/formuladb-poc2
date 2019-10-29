/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Grid, GridOptions,
    GridApi, GridReadyEvent,
    RowDoubleClickedEvent, ColumnResizedEvent, ColumnMovedEvent,
    RowClickedEvent, CellFocusedEvent, ColDef, VanillaFrameworkOverrides, RefreshCellsParams, GetMainMenuItemsParams, MenuItemDef
} from 'ag-grid-community';
import * as _ from 'lodash';
import { waitUntil } from '@domain/ts-utils';

import { elvis } from '@core/elvis';
import { DataGridToolsComponent } from './data-grid-tools.component';
import { DataGrid, TableColumn } from '@domain/uimetadata/node-elements';
import { scalarFormulaEvaluate } from '@core/scalar_formula_evaluate';
import { DataObj } from '@domain/metadata/data_obj';
import { ExcelStyles } from './excel-styles';
import { I18N } from '@fe/i18n.service';
import { TABLE_SERVICE } from '@fe/table.service';
import { Pn } from '@domain/metadata/entity';
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from '@domain/constants';
import { setAgGridLicense } from '@fe/licenses';
import { DataGridComponentI } from './data-grid.component.i';
import { emit, getTarget } from '@fe/delegated-events';

/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/data-grid/data-grid.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/data-grid/data-grid.component.scss').default;

export class DataGridComponent extends HTMLElement implements DataGridComponentI {
    conditionalFormatting?: { tbdCssClassName: string };
    selectedRow: DataObj;
    selectedColumnName: string;

    get elem() {return this.shadowRoot!}

    private _highlightColumns: DataGridComponentI['highlightColumns'] = {};
    get highlightColumns() {return this._highlightColumns}
    set highlightColumns(hc: DataGridComponent['_highlightColumns']) {
        this._highlightColumns = hc;
        this.forceCellRefresh();
    }
    get noFloatingFilters() {
        return ('true' === (this.getAttribute("no-floating-filters")||'').toLowerCase());
    }
    get headerHeight() {
        return parseInt(this.getAttribute("header-height")||'') || 28;
    }
    get tableName() {
        return this.getAttribute("table-name") || undefined;
    }
    get expandRow() {
        return this.getAttribute("expand-row") || undefined;
    }

    constructor() {
        super();
        setAgGridLicense();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;
        new Grid(this.elem.querySelector("#myGrid") as HTMLElement, this.gridOptions);
    }

    /** web components API **************************************************/
    static observedAttributes = ["table-name", "header-height" , "expand-row", "no-floating-filters"];
    attributeChangedCallback(attrName: string, oldVal, newVal) {
        waitUntil(() => Promise.resolve(this.gridApi), 2500)
        .then(() => {
            if (!this.gridApi) throw new Error("Timeout during initialization");
            if (attrName == 'table-name') {
                this.initAgGrid();
            } else if ("TODOO how to pass in events from outside ServerDeletedFormData" == "TODOO how to pass in events from outside ServerDeletedFormData") {
                this.gridApi.purgeServerSideCache()
            }    
        });
    }

    connectedCallback() {
    }

    /** component internals *************************************************/

    public forceCellRefresh() {
        this.gridApi && this.gridApi.refreshView();
    }
    public forceReloadData() {
        if (this.gridApi) {
            this.gridApi.purgeServerSideCache();
        }
    }

    private gridApi: GridApi;
    private gridColumnApi;
    private agGridColumns: ColDef[] = [];
    private filters: any = {};
    private sort: any = {};
    private columns: TableColumn[] = [];
    private selectedRowIdx: number;

    private gridOptions: GridOptions = {

        headerHeight: 28,
        suppressContextMenu: true,
        getMainMenuItems: (params: GetMainMenuItemsParams) => {
            let defaults: (string | MenuItemDef)[] = params.defaultItems.slice(0);
            defaults.push('separator')
            defaults.push({
                name: 'Delete Column',
                action: () => {
                    emit(this, {
                        type: "UserDeleteColumn", 
                        tableName: this.tableName || 'n/a/tbl', 
                        columnName: params.column.getColDef().field || 'n/a/col',
                    });
                },
                icon: '<i class="la la-minus-circle"></i>'                
            });

            return defaults;
        },
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
            emit(this, { type: "UserDblClickRow", dataObj: event.data });
        },
        onRowClicked: (event: RowClickedEvent) => {
            this.selectedRow = event.data;
        },
        onCellFocused: (event: CellFocusedEvent) => {
            let newSelectedRowIdx = event.rowIndex;
            let newSelectedColumnName: string | null = null;
            if (event.column && event.column.getColDef() && event.column.getColDef().field) {
                newSelectedColumnName = event.column.getColDef().field!;
            }
            let refreshCellsParams: RefreshCellsParams | null = null;
            if (this.selectedRowIdx != newSelectedRowIdx || this.selectedColumnName != newSelectedColumnName) {
                refreshCellsParams = {
                    rowNodes: [
                        this.gridApi.getDisplayedRowAtIndex(this.selectedRowIdx || 0), 
                        this.gridApi.getDisplayedRowAtIndex(newSelectedRowIdx)
                    ],
                    columns: [this.selectedColumnName || '_id', newSelectedColumnName || '_id'],
                    force: true,
                };
            }
            this.selectedColumnName = newSelectedColumnName || this.selectedColumnName;
            this.selectedRowIdx = event.rowIndex;
            
            if (refreshCellsParams && this.gridApi) {
                // this.gridApi.refreshCells(refreshCellsParams);
                //FIXME: the targeted cell refresh does not call the applyCellStyles method
                this.gridApi.refreshCells({force: true});
            }
        },
        autoGroupColumnDef: { width: 150 },
        onGridReady: (params: GridReadyEvent) => {
            if (!this.gridApi) {
                this.gridApi = params.api as GridApi;
                this.gridColumnApi = params.columnApi;
                this.gridApi.closeToolPanel();
            }
            console.debug("onGridReady", this.columns, this.gridApi);
        },
        onColumnMoved: (event: ColumnMovedEvent) => {
            // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
        },
        onColumnResized: (event: ColumnResizedEvent) => {
            if (event.finished && event && event.column) {
                const col = (this.columns || [])
                    .find(c => c.name !== null && event !== null && event.column !== null && c.name === event.column.getId());
                if (col) { col.width = event.column.getActualWidth(); }
                // this.frmdbStreams.userEvents$.next({type: "UserModifiedTableUi", table: this.tableState});
            }
        },
        floatingFilter: true,   
        onFilterChanged: (event: any) => {
            if (!_.isEqual(this.filters, this.gridApi.getFilterModel())) {
                const fs = this.gridApi.getFilterModel();
                (this.columns || []).forEach(c => {
                    if (fs[c.name]) {
                        c.filter = { operator: fs[c.name].type, value: fs[c.name].filter };
                    } else {
                        c.filter = undefined;
                    }
                });
                // this.emit({ type: "UserModifiedTableUi", table: this.dataGrid });
            }
            this.filters = this.gridApi.getFilterModel();
        },
        onSortChanged: (event: any) => {
            if (!_.isEqual(this.sort, this.gridApi.getSortModel())) {
                const srt = this.gridApi.getSortModel();
                (this.columns || []).forEach(c => {
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
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' }
            ],
        },
        sideBar: {
            toolPanels: [
                {
                    id: "tableActions",
                    labelDefault: "",
                    labelKey: "tableActions",
                    iconKey: "menu",
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

    applyCellStyles(params) {
        let entityId = this.tableName;
        let hc = this._highlightColumns || {};

        let backgroundStyles: {[k: string]: string | null} = {
            backgroundColor: null,
            'background-image': null,
            'background-size': null,    
        };

        let borderStyles: {[k: string]: string | null} = {
            "border-color": null,
        }

        if (entityId && hc[entityId] && hc[entityId][params.colDef.field]) {
            let highightColor = hc[entityId][params.colDef.field];
            if (typeof highightColor === "string") {
                backgroundStyles = { 
                    ...backgroundStyles,
                    backgroundColor: highightColor.replace(/^c_/, '#'),
                };
            } else {
                backgroundStyles = {
                    ...backgroundStyles,
                    ...highightColor,
                };
            }
        }
        else if (params.node.rowIndex == this.selectedRowIdx && params.colDef.field == this.selectedColumnName) {
            borderStyles = { "border-color": "blue" };
        } else if (params.node.rowIndex != this.selectedRowIdx && params.colDef.field == this.selectedColumnName) {
            backgroundStyles = {
                ...CURRENT_COLUMN_HIGHLIGHT_STYLE,
                backgroundColor: null,
            };
    }
        return { ...backgroundStyles, ...borderStyles};
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

    public async initAgGrid() {
        console.debug("ngOnInit", this, this.gridApi);
        let tableName = this.tableName;
        if (!tableName) return;

        this.columns = await TABLE_SERVICE.getColumns(tableName);

        this.gridOptions.floatingFilter = !this.noFloatingFilters;
        this.gridOptions.context = this.columns;
        this.gridOptions.headerHeight = this.headerHeight;
        // if (this.dataGrid.headerBackground) this.gridOptions.excelStyles!.find(s => s.id === "header")!.interior = {
        //     //FIXME: setting header background does not seem to work
        //     color: this.dataGrid.headerBackground,
        //     pattern: "Solid",
        // };
        await waitUntil(() => Promise.resolve(this.gridApi));
        this.gridApi.setServerSideDatasource(TABLE_SERVICE.getDataSource(tableName));
        try {

            let cssClassRules: ColDef['cellClassRules'] = {};
            let conditionalFormatting = this.conditionalFormatting || {};
            for (let cssClassName of Object.keys(elvis(conditionalFormatting))) {
                cssClassRules[cssClassName] = function (params) {
                    return scalarFormulaEvaluate(params.data || {}, conditionalFormatting[cssClassName]);
                }
            }
            let cols = this.columns || [];

            this.agGridColumns = cols.map(c => <ColDef>{
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
                cellRenderer: this.getCellRenderer(c),
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

            this.gridApi.setColumnDefs(this.agGridColumns);
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
        if (params.colDef.field === '_id') return ((params.value || '')+'').replace(/^.*~~/, '');
        else return params.value;
    }

    userSelectTableRow(dataObj: DataObj) {
        emit(this, { type: "UserSelectedRow", dataObj });
    }

    getCellRenderer(col: TableColumn) {
        let entityId = this.tableName;
        let expandRowTarget = this.expandRow;
        if (expandRowTarget && col.name === '_id') {
            return (params) => {
                return `<a href="javascript:void(0)" onclick="m=this.ownerDocument.defaultView.$('${expandRowTarget}'); s=m.find('frmdb-form')[0].frmdbState; s.rowid='${params.value}'; s.table_name='${entityId}'; m.modal('toggle')">${this.valueFormatter(params)}</a>`;
            }
        } else return null;
    }

}

customElements.define('frmdb-data-grid', DataGridComponent);
