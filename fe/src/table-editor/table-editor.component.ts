/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { onEvent, emit, onEventChildren } from '@fe/delegated-events';

import '@fe/graph-editor/graph-editor.component';

const html = require('raw-loader!@fe-assets/table-editor/table-editor.component.html').default;
const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/table-editor/table-editor.component.scss').default;

export class TableEditorComponent extends HTMLElement {
    
    init(): void {
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
        onEventChildren(this, 'click', '.excel-export', (e) => {this.excel(); e.preventDefault()});
        onEventChildren(this, 'click', '.add-column-to-table-btn', (e) => { 
            emit(this, {type: "FrmdbAddColumn"}); //WTF: why I have to explicitly emit from the host element?
            e.preventDefault()
        });

        onEventChildren(this, 'click', '.nav-link[role="tab"]', (e: MouseEvent) => {
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

        this.innerHTML = /*html*/ `
            <style>${css}</style>
            ${html}
        `;
    }

    connectedCallback() {
        this.init();
    }
    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
    }
    observedAttributes: any;

    excel() {
        
    }
}

window.customElements.define('frmdb-table-editor', TableEditorComponent);
customElements.whenDefined('frmdb-table-editor').then(() => console.info('frmdb-table-editor is defined'));

export function queryTableEditor(el: Document | HTMLElement): TableEditorComponent {
    let tableEditor: TableEditorComponent =  el.querySelector('frmdb-table-editor') as TableEditorComponent;
    if (!tableEditor) throw new Error("formula table not found");
    return tableEditor;
}
