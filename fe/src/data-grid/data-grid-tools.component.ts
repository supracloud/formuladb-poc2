/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { IToolPanelParams, GridApi, IToolPanelComp } from "ag-grid-community";
import { onEvent, emit } from '@fe/delegated-events';

import '@fe/graph-editor/graph-editor.component';

const html = require('raw-loader!@fe-assets/data-grid/data-grid-tools.component.html').default;
const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/data-grid/data-grid-tools.component.scss').default;

export class DataGridToolsComponent implements IToolPanelComp {
    private params: IToolPanelParams;
    private gridApi: GridApi;
    
    el = document.createElement('div');
    on = onEvent.bind(null, this.el);

    init(params: IToolPanelParams): void {
        this.params = params;
        this.gridApi = this.params.api;
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
        this.on('click', '.excel-export', (e) => {this.excel(); e.preventDefault()});
        this.on('click', '.add-column-to-table-btn', (e) => { 
            emit((this.el.getRootNode() as any).host, {type: "FrmdbAddColumn"}); //WTF: why I have to explicitly emit from the host element?
            e.preventDefault()
        });

        this.on('click', '.nav-link[role="tab"]', (e: MouseEvent) => {
            (e.target as HTMLElement).closest('.nav')!.querySelectorAll('.nav-link').forEach(e => e.classList.remove('active'));
            (e.target as HTMLElement).classList.add('active');
            (e.target as HTMLElement).closest('.data-grid-tools')!
                .querySelectorAll('.tab-pane').forEach(tabPane => {
                    if (tabPane.matches((e.target as any).hash)) tabPane.classList.add('show', 'active')
                    else tabPane.classList.remove('show', 'active')
                });
            e.preventDefault();
            return false;
        });

        this.el.style.width = "100%";
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
