/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { waitUntilNotNull, PickOmit, objKeysTyped } from '@domain/ts-utils';

import { FrmdbElementMixin, reflectProp2Attr, reflectAttr2Prop } from '@fe/live-dom-template/frmdb-element';
import { I18N } from '@fe/i18n.service';
import { on, emit } from '@fe/delegated-events';
import { BACKEND_SERVICE } from '@fe/backend.service';


/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/form/form.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/form/form.component.scss').default;
const ATTRS = {
    tableName: "str",
}


export class FormComponent extends HTMLElement implements FrmdbElementMixin {

    /** frmdb utilities for web components **********************************/
    on = on.bind(null, this);
    emit = emit.bind(null, this);
    render = FrmdbElementMixin.prototype.render.bind(this);

    /** Component attributes ************************************************/
    tableName: string;

    /** web components API **************************************************/
    static observedAttributes: (keyof FormComponent & keyof typeof ATTRS)[] = objKeysTyped(ATTRS);
    attributeChangedCallback(attrName: keyof FormComponent & keyof typeof ATTRS, oldVal, newVal) {
        (this[attrName] as any) = reflectAttr2Prop(newVal, ATTRS[attrName]) as any;

    }

    connectedCallback() {
        for (let attrName of FormComponent.observedAttributes) {
            (this[attrName] as any) = reflectAttr2Prop(this.getAttribute(attrName) || '', ATTRS[attrName]) as any;
        }

        this.initForm();
    }

    constructor() {
        super();

        this.innerHTML = /*html*/ `
            <style>${CSS}</style>
            ${HTML}
        `;
    }

    /** component internals *************************************************/

    private async initForm() {
        let entity = await BACKEND_SERVICE.getEntity(this.tableName);
        let form = this.querySelector('form');
        if (!form) throw new Error("Form elem not found");

        for (let prop of Object.values(entity.props)) {
            let formField = document.createElement('div');
            formField.classList.add("form-group");
            formField.innerHTML = /*html*/`
                <label for="${prop.name}">${I18N.tt(prop.name)}</label>
                <input type="text" class="form-control" id="${prop.name}">
            `;
            form.appendChild(formField);
        }
    }
}

window.customElements.define('frmdb-form', FormComponent);
