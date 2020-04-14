/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { onEvent, emit, onEventChildren } from '@fe/delegated-events';

import '@fe/graph-editor/graph-editor.component';
import { DataObj } from '@domain/metadata/data_obj';
import { raiseNotification } from '@fe/notifications.service';
import { ThemeColors } from '@domain/uimetadata/theme';
import { ServerEventModifiedFormData, ServerEventDeletedFormData } from '@domain/event';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { FormComponent } from '@fe/form/form.component';
import { $FRMDB_MODAL } from '@fe/directives/data-toggle-modal.directive';

const html = require('raw-loader!@fe-assets/table-editor/table-editor.component.html').default;
const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/table-editor/table-editor.component.scss').default;

export class TableEditorComponent extends HTMLElement {

    selectedRecord: DataObj;
    tableName: string;

    init(): void {
        // calculate stats when new rows loaded, i.e. onModelUpdated
        // this.params.api.addEventListener('modelUpdated', this.updateTotals.bind(this));
        onEventChildren(this, 'click', '.excel-export', (e) => { this.excel(); e.preventDefault() });
        onEventChildren(this, 'click', '#add-column-to-table-btn', (e) => {
            emit(this, { type: "FrmdbAddColumn" }); //WTF: why I have to explicitly emit from the host element?
            e.preventDefault()
        });
        onEventChildren(this, 'click', '#delete-row-btn', async (e) => {
            if (!this.selectedRecord) { raiseNotification(ThemeColors.info, "Cannot delete row.", "Please select row first."); return }
            if (confirm(`Delete record ${this.selectedRecord._id}? Please confirm !`)) {
                let event: ServerEventDeletedFormData = await BACKEND_SERVICE().putEvent(
                    new ServerEventDeletedFormData(this.selectedRecord)) as ServerEventDeletedFormData;
            }
        });
        onEventChildren(this, 'click', '#add-row-btn', async (e) => {
            if (!this.tableName) { raiseNotification(ThemeColors.info, "Cannot add row.", "Please select table first."); return }
            let modalEl = this.ownerDocument?.querySelector('#edit-record-modal');
            if (!modalEl) { raiseNotification(ThemeColors.warning, "Cannot add row.", "internal problem, modal not found"); return }
            let formEl = modalEl?.querySelector('frmdb-form') as FormComponent;
            if (!formEl) { raiseNotification(ThemeColors.warning, "Cannot add row.", "internal problem, form not found"); return }
            formEl.setState(`${this.tableName}~~$AUTO_GENERATE_ID_FOR_NEW_RECORD`);
            $FRMDB_MODAL(modalEl as HTMLElement);
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

    static observedAttributes = ["table-name"];
    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        if (name == "table-name") this.tableName = newVal;
    }
    observedAttributes: any;

    excel() {

    }
}

window.customElements.define('frmdb-table-editor', TableEditorComponent);
customElements.whenDefined('frmdb-table-editor').then(() => console.info('frmdb-table-editor is defined'));

export function queryTableEditor(el: Document | HTMLElement): TableEditorComponent {
    let tableEditor: TableEditorComponent = el.querySelector('frmdb-table-editor') as TableEditorComponent;
    if (!tableEditor) throw new Error("formula table not found");
    return tableEditor;
}
