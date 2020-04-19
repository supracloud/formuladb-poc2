/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { FrmdbElementState, camelCaseProp2kebabCaseAttr, kebabCaseAttr2CamelCaseProp } from "@fe/frmdb-element-state";
import { ReferenceToProperty, Pn } from "@domain/metadata/entity";

const html = require('raw-loader!@fe-assets/col-reference-to/col-reference-to.component.html').default;
const css = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/col-reference-to/col-reference-to.component.scss').default;

const defaultAttr = {
};
const defaultState: Partial<ReferenceToProperty> = {
    propType_: Pn.REFERENCE_TO,
    ...defaultAttr,
};
export class ColumnEditorComponent extends HTMLElement {
    state = new FrmdbElementState(document.body, defaultState);
    static observedAttributes = Object.keys(defaultAttr).map(k => camelCaseProp2kebabCaseAttr(k));
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        this.state.emitChange({[kebabCaseAttr2CamelCaseProp(name)]: newVal});
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${css}</style> ${html}`;
    }
    
    connectedCallback() {
    }
}

window.customElements.define('frmdb-column-editor', ColumnEditorComponent);
customElements.whenDefined('frmdb-column-editor').then(() => console.info('frmdb-column-editor is defined'));
