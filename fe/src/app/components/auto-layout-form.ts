import { Entity } from "@core/domain/metadata/entity";
import { Page, FrmdbLy } from "@core/domain/uimetadata/page";
import { NodeElementWithChildren, FormTable, FormTabs, FormAutocomplete, NodeType, FormDatepicker, FormText, FormInput, GridRow, NodeElement, isNodeElementWithChildren, Form, Button, CardContainer } from "@core/domain/uimetadata/form";

import * as _ from "lodash";

import { Pn } from "@core/domain/metadata/entity";

import { generateUUID } from "@core/domain/uuid";
import { elvis } from "@core/elvis";

export function autoLayoutForm(form: Form | null, entity: Entity, entitiesMap: _.Dictionary<Entity>, pageOpts?: Partial<Page>): Form {
    let retForm = form || new Form();
    retForm._id = 'Form_:' + entity._id;
    retForm.isEditable = entity.isEditable;
    retForm.stateGraph = entity.stateGraph;
    retForm.page = retForm.page || pageOpts || {
        layout: FrmdbLy.ly_admin,
    };

    setFormElementChildren(retForm.page, retForm, entity, entitiesMap);
    console.log('form:', retForm);
    addIdsToForm(retForm);
    return retForm;
}

export function setFormElementChildren(pageOpts: Partial<Page>, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    if (!pageOpts.layout) throw new Error("No layout for auto-layout procedure" + entity._id);
    let layout: FrmdbLy = pageOpts.layout;
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child: NodeElement;
        if (pn.propType_ === Pn.CHILD_TABLE) {
            if ([FrmdbLy.ly_cards, FrmdbLy.ly_fpattern, FrmdbLy.ly_grid].includes(layout)) {
                child = new CardContainer();
                if (FrmdbLy.ly_fpattern === layout) {
                    child.horizontal = true;
                }
            } else if (FrmdbLy.ly_cover === layout) {
                child = new CardContainer();
                child.style = "group";
            } else {
                child = pn.isLargeTable ? new FormTable() : new FormTabs();
            }
            child.tableName = pn.name;
            if (pn.referencedEntityName) setFormElementChildren(pageOpts, child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
        } else if (pn.propType_ === Pn.REFERENCE_TO) {
            child = new FormAutocomplete();
            if (parentFormEl.nodeType === NodeType.form_table) {
                child.noLabel = true;
            }
            child.refEntityName = pn.referencedEntityName;
            child.refPropertyName = pn.referencedPropertyName;
            child.propertyName = pn.name;
        } else if (pn.propType_ === Pn.DATETIME) {
            child = new FormDatepicker();
            child.propertyName = pn.name;
        } else if (pn.propType_ === Pn.ACTION) {
            child = new Button();
            child.propertyName = pn.name;
        } else if (pn.propType_ === Pn.STRING && pn.name == '_id') {
            child = new FormText();
            child.propertyName = pn.name;
            child.representation = "_id";
        } else {
            child = [FrmdbLy.ly_admin, FrmdbLy.ly_form].includes(layout) ? new FormInput() : new FormText();
            if (parentFormEl.nodeType === NodeType.form_table) {
                child.noLabel = true;
            }
            child.propertyName = pn.name;
            child.propertyType = pn.propType_ as any;
        }

        let ret;
        if (parentFormEl.nodeType === NodeType.form_table) {
            ret = child;
        } else {
            ret = new GridRow();
            ret.childNodes = [child];
        }

        return ret;
    });
}


export function addIdsToForm(input: NodeElement): void {
    if (!input._id) { input._id = generateUUID(); }
    if (isNodeElementWithChildren(input) && input.childNodes && input.childNodes.length > 0) {
        input.childNodes.forEach(c => addIdsToForm(c));
    }
}
