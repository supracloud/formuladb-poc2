/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { waitUntilNotNull, PickOmit, objKeysTyped } from '@domain/ts-utils';

import { FrmdbElementBase, reflectProp2Attr, reflectAttr2Prop, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { I18N } from '@fe/i18n.service';
import { on, emit } from '@fe/delegated-events';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { FrmdbLogger } from "@domain/frmdb-logger";
import { Entity, EntityProperty } from '@domain/metadata/entity';
const LOG = new FrmdbLogger('frmdb-form');


/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/form/form.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/form/form.component.scss').default;
const ATTRS = {
    table_name: "str",
    rowid: "str"
};
const STATE = {
    props: [{
        name: "string",
        nameI18n: "string",
        value: "string",
        disabled: false,
        dataObjPath: "string",
    }],
    dataObj: {},
};

@FrmdbElementDecorator({
    tag: 'frmdb-form',
    attributeExamples: ATTRS,
    stateExample: STATE,
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class FormComponent extends FrmdbElementBase<typeof ATTRS, typeof STATE> {

    async updateStateWhenAttributesChange() {
        let entity = await BACKEND_SERVICE.getEntity(this.attr.table_name);
        let form = this.querySelector('form');
        if (!form) throw new Error("Form elem not found");

        for (let prop of Object.values(entity.props)) {
            this.state.props.push({
                name: "string",
                nameI18n: "string",
                value: "string",
                disabled: this.getDisabled(entity, prop),                
            });
        }

        let dataObj = await BACKEND_SERVICE.getDataObj(this.attr.rowid);
    }

    private getDisabled(entity: Entity, prop: EntityProperty): boolean {
        return entity.isEditable == true && '_id' != prop.name;
    }
}

document.createElement('frmdb-form').setAttribute('rowid', "test-rowid");
console.log((FormComponent as any).observedAttributes);
