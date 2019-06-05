import { IToolPanelParams, GridApi, IToolPanelComp } from "ag-grid-community";
import { FrmdbElementBase } from "@live-dom-template/frmdb-element";

const html = require('raw-loader!@data-grid/table-tools.component.html').toString();
const css = require('raw-loader!sass-loader?sourceMap!@data-grid/table-tools.component.scss').default;

export class TableToolsComponent extends FrmdbElementBase implements IToolPanelComp {
    private params: IToolPanelParams;
    private gridApi: GridApi;
    
    init(params: IToolPanelParams): void {
        console.warn((params as any).context);
        this.params = params;
        this.gridApi = this.params.api;
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
        this.on('click', '.excel-export', () => this.excel());
        this.on('click', '.add-row', () => this.emit({type: "UserAddRow", entityId: "TBD"}));
        this.on('click', '.delete-row', () => this.emit({type: "UserDeleteRow", dataObj: {_id: "TBD"}}));

        this.innerHTML = /*html*/ `
            <style>${css}</style>
            ${html}
        `;
    }

    connectedCallback() {
    }
    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
    }
    observedAttributes: any;

    getGui(): HTMLElement {
        return this;
    }

    refresh(): void {
        console.error("Method not implemented.");
    }


    excel() {
        this.gridApi.exportDataAsExcel({
            headerRowHeight: 100,
            columnKeys: ((this.params as any).columns||[]).filter(c => !c.skipExportExcel).map(c => c.name)
        });
    }
}
