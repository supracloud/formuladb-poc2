import { Entity, EntityProperty } from "@core/domain/metadata/entity";
import { Page, FrmdbLy } from "@core/domain/uimetadata/page";
import { NodeElementWithChildren, FormTable, FormTabs, FormAutocomplete, NodeType, FormDatepicker, FormText, FormInput, GridRow, NodeElement, isNodeElementWithChildren, Form, Button, CardContainer, ScalarNodeElement, FormDataGrid } from "@core/domain/uimetadata/form";

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

    if (retForm.page.layout == FrmdbLy.ly_admin) {
        autoLayoutChildrenForm(retForm.page.layout, retForm, entity, entitiesMap);
    } else if ([FrmdbLy.ly_cards,FrmdbLy.ly_grid, FrmdbLy.ly_fpattern].includes(retForm.page.layout!)) {
        autoLayoutChildrenCards(retForm.page.layout!, retForm, entity, entitiesMap);
    }
    console.log('form:', retForm);
    addIdsToForm(retForm);
    return retForm;
}

export function autoLayoutScalarForm(pn: EntityProperty, layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    let child: ScalarNodeElement;

    if (pn.propType_ === Pn.DATETIME) {
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

    return child;
}

export function autoLayoutChildrenForm(layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child: NodeElement;
        if (pn.propType_ === Pn.CHILD_TABLE) {
            child = pn.isLargeTable ? new FormTable() : new FormTabs();
            child.tableName = pn.name;
            if (pn.referencedEntityName) autoLayoutChildrenForm(layout, child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
        } else if (pn.propType_ === Pn.REFERENCE_TO) {
            child = new FormAutocomplete();
            if (parentFormEl.nodeType === NodeType.form_table) {
                child.noLabel = true;
            }
            child.refEntityName = pn.referencedEntityName;
            child.refPropertyName = pn.referencedPropertyName;
            child.propertyName = pn.name;
        } else {
            child = autoLayoutScalarForm(pn, layout, parentFormEl, entity, entitiesMap);
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

export function autoLayoutScalarCards(pn: EntityProperty, layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    let child: ScalarNodeElement;

    if (pn.propType_ === Pn.DATETIME) {
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

    return child;
}

export function autoLayoutChildrenCards(layout: FrmdbLy, parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    let referenceToDataGrids: Map<string, FormDataGrid> = new Map();
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child: NodeElement;
        if (pn.propType_ === Pn.CHILD_TABLE) {
            child = new CardContainer();
            if (FrmdbLy.ly_fpattern === layout) {
                child.horizontal = true;
            } else if (FrmdbLy.ly_cover === layout) {
                child = new CardContainer();
                child.style = "group";
            } else if (FrmdbLy.ly_mosaic === layout) {
                child = new CardContainer();
                child.style = "masonry";
            } else {
                child = pn.isLargeTable ? new FormTable() : new FormTabs();
            }
            child.tableName = pn.name;
            if (pn.referencedEntityName) autoLayoutChildrenForm(layout, child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
        } else if (pn.propType_ === Pn.REFERENCE_TO) {
            let dataGrid = referenceToDataGrids.get(pn.referencedEntityName);
            if (!dataGrid) {
                dataGrid = new FormDataGrid();
                dataGrid.layout = layout;
                dataGrid.properties = [];
                dataGrid.refEntityName = pn.referencedEntityName;
                referenceToDataGrids.set(pn.referencedEntityName, dataGrid);
            }
            child = dataGrid;
            child.properties.push({
                _id: generateUUID(),
                nodeType: NodeType.form_input,
                refPropertyName: pn.referencedPropertyName,
                propertyName: pn.name,
                propertyType: /**FIXME!!!!! hardcoded heuristic */
                    ["price"].includes(pn.referencedPropertyName) ? Pn.NUMBER : Pn.STRING,
            })
        } else {
            child = autoLayoutScalarCards(pn, layout, parentFormEl, entity, entitiesMap);
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
