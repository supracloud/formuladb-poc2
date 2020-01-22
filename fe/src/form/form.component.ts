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
import { Entity, EntityProperty, Pn } from '@domain/metadata/entity';
import { CssWidth } from '@domain/uimetadata/css-classes';
import { elvis } from '@core/elvis';
import { FORM_SERVICE } from '@fe/form.service';
import { ImgEditorComponent } from '@fe/frmdb-editor/img-editor.component';
const LOG = new FrmdbLogger('frmdb-form');

/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/form/form.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/form/form.component.scss').default;
export interface FormComponentAttr {
    table_name: string;
    fields: { [name: string]: { width: CssWidth } };
    rowid: string;
};
export interface FormComponentState extends FormComponentAttr {
    props: (EntityProperty & {
        name: string,
        isAutocomplete: boolean,
        isImage: boolean,
        nameI18n: string,
        disabled: boolean,
        cssWidth: CssWidth,
    })[];
    dataObj: {},
};

@FrmdbElementDecorator({
    tag: 'frmdb-form',
    observedAttributes: ['table_name', 'fields', 'rowid'],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class FormComponent extends FrmdbElementBase<FormComponentAttr, FormComponentState> {

    async frmdbPropertyChangedCallback<T extends keyof FormComponentState>(attrName: T, oldVal: FormComponentState[T], newVal: FormComponentState[T]) {
        if (attrName === "table_name") {
            let entityId = this.frmdbState.table_name || 'n/a';
            let entity = await BACKEND_SERVICE().getEntity(entityId);
            let props: FormComponentState["props"] = [];
            for (let prop of Object.values(entity.props)) {
                props.push({
                    ...prop,
                    isAutocomplete: prop.propType_ == Pn.REFERENCE_TO, 
                    isImage: prop.propType_ == Pn.IMAGE, 
                    nameI18n: I18N.tt(prop.name),
                    disabled: this.getDisabled(entity, prop),
                    cssWidth: elvis(elvis(this.frmdbState.fields)[prop.name]).width || "col-12",
                });
            }

            this.frmdbState.props = props;
        } else if (attrName === "rowid") {
            let dataObj = await BACKEND_SERVICE().getDataObj(this.frmdbState.rowid!);
            this.frmdbState.dataObj = dataObj;
            this.querySelector('form')?.setAttribute('data-frmdb-record', this.frmdbState.rowid!);
        } else if (attrName === "fields") {
            if (this.frmdbState.props && this.frmdbState.props.length > 0) {
                let props = [...this.frmdbState.props];
                for (let prop of Object.values(props)) {
                    prop.cssWidth = elvis(elvis(this.frmdbState.fields)[prop.name]).width || "col-12";
                }
                this.frmdbState.props = props;
            }
        }
    }

    private getDisabled(entity: Entity, prop: EntityProperty): boolean {
        return entity.isEditable != true || '_id' == prop.name;
    }
}

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
                    <img src="${inputEl.value}" style="width: 100%; border-radius: 5px; border: 1px solid grey;" />
                </a>
            `;
            let img: HTMLImageElement = this.querySelector('img') as HTMLImageElement;

            let setImgSrc = (src: string) => {
                if (!inputEl) return;
                inputEl.value = src;
                img.src = src;
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
