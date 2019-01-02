/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { BaseObj, SubObj } from '../base_obj';
import { EntityProperty, Pn, Entity, EntityStateGraph } from "../metadata/entity";
import { Label } from './label';
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { IdRevObj } from '../key_value_obj';

export enum NodeType {
    form_grid = "form_grid",
    form_grid_row = "form_grid_row",
    form_grid_col = "form_grid_col",
    form_input = "form_input",
    form_autocomplete = "form_autocomplete",
    form_tabs = "form_tabs",
    form_tab = "form_tab",
    form_table = "form_table",
    form_datepicker = "form_datepicker",
    form_timepicker = "form_timepicker",
}

export class FormGrid implements SubObj {
    readonly nodeType = NodeType.form_grid;
    _id: string;
    childNodes?: NodeElement[];
}
export class FormGridRow implements SubObj {
    readonly nodeType = NodeType.form_grid_row;
    _id: string;
    childNodes?: NodeElement[];
}
export class FormGridCol implements SubObj {
    readonly nodeType = NodeType.form_grid_col;
    _id: string;
    childNodes?: NodeElement[];
}
export class FormInput implements SubObj {
    readonly nodeType = NodeType.form_input;
    _id: string;
    propertyName: string;
    propertyType: Pn.TEXT | Pn.NUMBER | Pn.STRING;
}
export class FormAutocomplete implements SubObj {
    readonly nodeType = NodeType.form_autocomplete;
    _id: string;
    entityName: string;
    snapshotCurrentValueOfProperties?: string[];
}
export class FormTabs implements SubObj {
    readonly nodeType = NodeType.form_tabs;
    _id: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export class FormTab implements SubObj {
    readonly nodeType = NodeType.form_tab;
    _id: string;
    childNodes?: NodeElement[];
}
export class FormTable implements SubObj {
    readonly nodeType = NodeType.form_table;
    _id: string;
    tableName: string;
    childNodes?: NodeElement[];
}
export class FormDatepicker implements SubObj {
    readonly nodeType = NodeType.form_datepicker;
    _id: string;
    propertyName: string;
}
export class FormTimepicker implements SubObj {
    readonly nodeType = NodeType.form_timepicker;
    _id: string;
    propertyName: string;
}

export class Form implements BaseObj {
    _id: string;
    _rev?: string;
    grid: FormGrid;
    stateGraph?: EntityStateGraph;
}
export function isForm(param: IdRevObj): param is Form {
    return param != null && typeof param === 'object' && param._id.indexOf('Form_:') == 0;
}

export type NodeElement =
    | FormGrid
    | FormGridRow
    | FormGridCol
    | FormInput
    | FormAutocomplete
    | FormTabs
    | FormTab
    | FormTable
    | FormDatepicker
    | FormTimepicker
    ;

export type NodeElementWithChildren = FormGrid | FormGridRow | FormGridCol | FormTable | FormTabs | FormTab;
export function isNodeElementWithChildren(nodeEl: NodeElement): nodeEl is NodeElementWithChildren {
    return nodeEl.nodeType === NodeType.form_grid
        || nodeEl.nodeType === NodeType.form_grid_row
        || nodeEl.nodeType === NodeType.form_grid_col
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.form_tab
        ;
}

export type EntityNodeElement = FormAutocomplete;
export function isEntityNodeElement(nodeEl: NodeElement): nodeEl is EntityNodeElement {
    return nodeEl.nodeType === NodeType.form_autocomplete;
}

export type TableNodeElement = FormTable | FormTabs;
export function isTableNodeElement(nodeEl: NodeElement): nodeEl is TableNodeElement {
    return nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs;
}

export type PropertyNodeElement = FormInput | FormTimepicker | FormDatepicker;
export function isPropertyNodeElement(nodeEl: NodeElement): nodeEl is PropertyNodeElement {
    return nodeEl.nodeType === NodeType.form_input
        || nodeEl.nodeType === NodeType.form_timepicker
        || nodeEl.nodeType === NodeType.form_datepicker;
}

export function isKnownNodeElement(nodeType: string) {
    return Object.keys(NodeType).includes(nodeType);
}

export function getChildPath(nodeEl: NodeElement) {
    if (isPropertyNodeElement(nodeEl)) return nodeEl.propertyName;
    if (isEntityNodeElement(nodeEl)) return nodeEl.entityName;
    if (isTableNodeElement(nodeEl)) return nodeEl.tableName;
    return 'n/a-childPath-for' + nodeEl.nodeType;
}

export function getDefaultForm(entity: Entity, entitiesMap: _.Dictionary<Entity>): Form {
    let form = new Form();
    form._id = 'Form_:' + entity._id;
    form.stateGraph = entity.stateGraph;
    form.grid = new FormGrid();

    setFormElementChildren(form.grid, entity, entitiesMap);
    console.log('form:', JSON.stringify(form));
    addIdsToForm(form.grid);
    return form;
}

export function setFormElementChildren(parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child;
        if (pn.propType_ === Pn.CHILD_TABLE || pn.propType_ === Pn.SUB_TABLE) {
            child = pn.isLargeTable ? new FormTable() : new FormTabs();
            child.tableName = pn.name;
            if (pn.referencedEntityName) setFormElementChildren(child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
        } else if (pn.propType_ === Pn.REFERENCE_TO) {
            child = new FormAutocomplete();
            child.entityName = pn.name;
            child.snapshotCurrentValueOfProperties = pn.snapshotCurrentValueOfProperties;
        } else if (pn.propType_ === Pn.DATETIME) {
            child = new FormDatepicker();
            child.propertyName = pn.name;
            child.propertyType = pn.propType_;
        } else {
            child = new FormInput();
            child.propertyName = pn.name;
            child.propertyType = pn.propType_;
        }

        let ret;
        if (parentFormEl.nodeType === NodeType.form_table) {
            ret = child;
        } else {
            ret = new FormGridRow();
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
