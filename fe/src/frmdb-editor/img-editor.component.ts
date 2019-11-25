import { onEvent, onEventChildren, emit } from "@fe/delegated-events";
import { FrmdbSelectPageElement, FrmdbSelectPageElementAction } from "@fe/frmdb-user-events";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/img-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/img-editor.component.scss').default;

export class ImgEditorComponent extends HTMLElement {

    connectedCallback() {
        this.innerHTML = `<style>${CSS}</style> ${HTML}`;

        onEvent(this, 'FrmdbSelectPageElement', '*', (event: {detail: FrmdbSelectPageElement}) => {
            ($('#add-element-modal') as any).modal('hide');
        });
    }

    start(selectedEl: HTMLElement) {
        
        ($('#add-element-modal') as any).modal('show');
    }
}
customElements.define('frmdb-img-editor', ImgEditorComponent);
