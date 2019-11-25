import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";
import { ImageInput, IconInput } from "@fe/component-editor/inputs";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/icon-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/icon-editor.component.scss').default;

export class IconEditorComponent extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;

        onEvent(this, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            ($('#icon-editor-modal') as any).modal('hide');
        });
    }

    start(iconinputProperty: IconInput) {
        ($('#icon-editor-modal') as any).modal('show');
    }
}
customElements.define('frmdb-icon-editor', IconEditorComponent);
