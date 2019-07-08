import { IToolPanelParams, GridApi, IToolPanelComp } from "ag-grid-community";
import { onEvent, emit } from '@fe/delegated-events';

const html = require('raw-loader!@fe-assets/data-grid/data-grid-tools.component.html').default;
const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/data-grid/data-grid-tools.component.scss').default;

export class DataGridToolsComponent implements IToolPanelComp {
    private params: IToolPanelParams;
    private gridApi: GridApi;
    
    el = document.createElement('div');
    on = onEvent.bind(null, this.el);
    emit = emit.bind(null, this.el);

    init(params: IToolPanelParams): void {
        this.params = params;
        this.gridApi = this.params.api;
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
        this.on('click', '.excel-export', () => this.excel());
        this.on('click', '.add-row', () => this.emit({type: "UserAddRow", entityId: "TBD"}));
        this.on('click', '.delete-row', () => this.emit({type: "UserDeleteRow", dataObj: {_id: "TBD"}}));

        this.el.innerHTML = /*html*/ `
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
        return this.el;
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

window.customElements.define('frmdb-data-grid-tools', DataGridToolsComponent);
