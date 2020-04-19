/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import '../autocomplete/autocomplete.component';

import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { I18N } from '@fe/i18n.service';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { FrmdbLogger } from "@domain/frmdb-logger";
import { Entity, EntityProperty, Pn, ReferenceToProperty } from '@domain/metadata/entity';
import { CssWidth } from '@domain/uimetadata/css-classes';
import { elvis } from '@core/elvis';
import { FORM_SERVICE } from '@fe/form.service';
import { ImgEditorComponent } from '@fe/frmdb-editor/img-editor.component';
import { isNewDataObjId, DataObj, entityNameFromDataObjId } from '@domain/metadata/data_obj';
import { camelCaseProp2kebabCaseAttr, kebabCaseAttr2CamelCaseProp } from '@fe/frmdb-element-state';
const LOG = new FrmdbLogger('frmdb-form');

/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/form/form.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/form/form.component.scss').default;
export interface FormComponentAttr {
    fields: { [name: string]: { width: CssWidth } };
    rowId: string;
};
export interface FormComponentState extends FormComponentAttr {
    props: (EntityProperty & {
        name: string,
        isAutocomplete: boolean,
        isImage: boolean,
        nameI18n: string,
        disabled: boolean,
        cssWidth: CssWidth,
        required: boolean,
        inputType: "text" | "datetime-local" | "date" | "number",
    })[];
    dataObj: DataObj,
};

const defaultAttr = {
    rowId: '$Dictionary~~$AUTOID',
}
const defaultState = {
    ...defaultAttr,
};

export class FormComponent extends HTMLElement {
    state: Partial<FormComponentState> = defaultState;
    static observedAttributes = Object.keys(defaultAttr).map(k => camelCaseProp2kebabCaseAttr(k));
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        this.state[kebabCaseAttr2CamelCaseProp(name)] = newVal;
        this.debouncedRender();
    }

    public setState(rowId: string) {
        this.setAttribute('row-id', rowId);
    }
    set rowId(val: string) {
        this.setAttribute('row-id', val);
    }
    get rowId() { return this.state.rowId || defaultState.rowId }

    async setProps(entityId: string) {
        this.entity = await BACKEND_SERVICE().getEntity(entityId);
        let props: FormComponentState["props"] = [];
        for (let prop of Object.values(this.entity.props)) {
            if (['_owner', '_role', '_rev'].includes(prop.name)) continue;

            let inputType: "text" | "datetime-local" | "date" | "number" = "text";
            if (prop.propType_ === Pn.DATETIME) {
                inputType = prop.timeMandatory ? "datetime-local" : "date";
            } else if (prop.propType_ === Pn.NUMBER) {
                inputType = "number";
            }
            props.push({
                ...prop,
                isAutocomplete: prop.propType_ == Pn.REFERENCE_TO, 
                isImage: prop.propType_ == Pn.IMAGE, 
                nameI18n: I18N.tt(prop.name),
                disabled: this.getDisabled(this.entity, prop),
                required: (prop as any).required === true,
                inputType,
                cssWidth: elvis(elvis(this.state.fields)[prop.name]).width || "col-12",
            });
        }
        
        this.state.props = props;
    }

    entity: Entity;
    async render() {
        let dataObj = await BACKEND_SERVICE().getDataObjAcceptNull(this.state.rowId!);
        if (dataObj) {
            this.state.dataObj = dataObj;
        } else {
            this.state.dataObj = {
                _id: this.state.rowId!,
            }                
        }
        let entityId = entityNameFromDataObjId(this.state.rowId!);

        if (this.state.fields && this.state.props && this.state.props.length > 0) {
            let props = [...this.state.props];
            for (let prop of Object.values(props)) {
                prop.cssWidth = elvis(elvis(this.state.fields)[prop.name]).width || "col-12";
            }
            this.state.props = props;
        }

        await this.setProps(entityId);

        let html: string[] = [];

        html.push(`<form data-frmdb-record="${this.state.rowId}" data-frmdb-form-auto-save>`);
        for (let prop of this.state.props||[]) {
            html.push(`<div class="form-group row ${prop.cssWidth}">`);
            html.push(`    <label for="${prop.name}" class="col-form-label col-3">${prop.nameI18n}</label>`);
            html.push(`    <div class="col-9">`);
            html.push(`        <input class="form-control" `);
            html.push(`            value="${this.state.dataObj[prop.name]||''}" `);
            html.push(`            name="${prop.name}" `);
            html.push(`            ${prop.disabled ? 'disabled' : ''}"`);
            html.push(`            type="${prop.inputType}"`);
            html.push(`            data-frmdb-value="${prop.name}"`);
            html.push(`            />`);
            if (prop.isAutocomplete) {
                html.push(`    <frmdb-autocomplete `);
                html.push(`        ref_entity_name="${(prop as ReferenceToProperty).referencedEntityName}"`);
                // html.push(`        ref_property_name="${(prop as ReferenceToProperty).referencedPropertyName}"`);
                html.push(`        ></frmdb-autocomplete>`);
            }
            if (prop.isImage) {
                html.push(`    <frmdb-form-image`);
                html.push(`        img-src="${this.state.dataObj[prop.name]}"`);
                html.push(`        ></frmdb-form-image>`);
            }
            html.push(`    </div>`);
            html.push(`</div>`);
        }
        html.push(`</form>`);

        this.innerHTML = html.join("\n");
    }

    debouncedRender = _.debounce(() => this.render(), 150);

    private getDisabled(entity: Entity, prop: EntityProperty): boolean {
        return entity.isEditable != true || ('_id' == prop.name);
    }
}
customElements.define('frmdb-form', FormComponent);

// document.createElement('frmdb-form').setAttribute('rowid', "test-rowid");
// console.log((FormComponent as any).observedAttributes);

class FormImageComponent extends HTMLElement {
    imgEditor: ImgEditorComponent;
    connectedCallback() {
        this.imgEditor = this.ownerDocument?.querySelector('frmdb-img-editor') as ImgEditorComponent;
    }

    static observedAttributes = ["img-src"];
    attributeChangedCallback(attrName: string, oldVal, newVal) {
        if ('img-src' === attrName) {
            let inputEl: HTMLInputElement | undefined = this.parentElement!.querySelector('input') as HTMLInputElement | undefined;
            if (!inputEl) return;

            this.innerHTML = /*html*/ `
                <a href="javascript:void(0)">
                    <img src="${newVal}" style="width: 100%; border-radius: 5px; border: 1px solid grey;" />
                </a>
            `;
            let img: HTMLImageElement = this.querySelector('img') as HTMLImageElement;

            let setImgSrc = (src: string) => {
                if (!inputEl) return;
                inputEl.value = src;

                img.src = src;

                //Workaround for live-server which gets the image via rsync a bit later
                //TODO: remove this when we add ingress to local dev env
                setTimeout(() => img.src = src, 1500);
                setTimeout(() => img.src = src, 3000);

                inputEl.dispatchEvent(new Event('change', {bubbles: true}));
            };
            let setBlob = async (name: string, blob: Blob) => {
                if (!inputEl) return;
                let newSrc = await BACKEND_SERVICE().saveMedia(name, blob);
                setImgSrc(newSrc);
                return newSrc;
            };

            this.onclick = () => {
                this.imgEditor.start({setImgSrc, setBlob});
            }
        }
    }

}
customElements.define('frmdb-form-image', FormImageComponent);
