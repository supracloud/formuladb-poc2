/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Pn, Entity, EntityStateGraph } from "../metadata/entity";
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { Page } from './page';

export enum NodeType {
    form_grid = "form_grid",
    h_layout = "h_layout",
    v_layout = "v_layout",
    form_input = "form_input",
    form_autocomplete = "form_autocomplete",
    form_tabs = "form_tabs",
    form_tab = "form_tab",
    form_table = "form_table",
    form_data_grid = "form_data_grid",
    form_chart = "form_chart",
    form_datepicker = "form_datepicker",
    form_timepicker = "form_timepicker",
    form_text = "form_text",
    form_enum = "form_enum",
    form_state = "form_state",
    card = "card",
    list = "list",
    gallery = "gallery",
    calendar = "calendar",
    image = "image",
    icon = "icon",
    media = "media",
    v_nav = "v_nav",
    h_nav = "h_nav",
    timeline = "timeline",
    dropdown = "dropdown",
    v_filters = "v_filters",
    h_filters = "h_filters",
    button = "button",
    button_group = "button_group",
    card_container = "card_container"
}


export class Form implements KeyValueObj {
    _id: string;
    _rev?: string;
    page: Page;
    grid: FormGrid;
    stateGraph?: EntityStateGraph;
    isEditable?: boolean;
}
export function isForm(param: KeyValueObj): param is Form {
    return param != null && typeof param === 'object' && param._id.indexOf('Form_:') == 0;
}

export type NodeElement =
    | FormGrid
    | FormInput
    | FormAutocomplete
    | FormTabs
    | FormTab
    | FormTable
    | FormDatepicker
    | FormTimepicker
    | FormChart
    | FormText
    | Button
    | ButtonGroup
    | Calendar
    | Card
    | Dropdown
    | FormDataGrid
    | FormEnum
    | FormState
    | Gallery
    | HFilters
    | HLayout
    | HNav
    | Icon
    | Image
    | List
    | Media
    | Timeline
    | VFilters
    | VLayout
    | VNav
    | CardContainer
    ;

export type NodeElementWithChildren = FormGrid | HLayout | VLayout | FormTable | FormTabs | FormTab;
export function isNodeElementWithChildren(nodeEl: NodeElement): nodeEl is NodeElementWithChildren {
    return nodeEl.nodeType === NodeType.form_grid
        || nodeEl.nodeType === NodeType.h_layout
        || nodeEl.nodeType === NodeType.v_layout
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.form_tab
        ;
}

export type EntityNodeElement = FormAutocomplete;
export function isEntityNodeElement(nodeEl: NodeElement): nodeEl is EntityNodeElement {
    return nodeEl.nodeType === NodeType.form_autocomplete;
}

export type TableNodeElement = FormTable | FormTabs | FormChart;
export function isTableNodeElement(nodeEl: NodeElement): nodeEl is TableNodeElement {
    return nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs;
}

export type PropertyNodeElement = FormInput | FormTimepicker | FormDatepicker;
export function isPropertyNodeElement(nodeEl: NodeElement): nodeEl is PropertyNodeElement {
    return nodeEl.nodeType === NodeType.form_input
        || nodeEl.nodeType === NodeType.form_timepicker
        || nodeEl.nodeType === NodeType.form_datepicker
        || nodeEl.nodeType === NodeType.form_text
    ;
}

export function isKnownNodeElement(nodeType: string) {
    return Object.keys(NodeType).includes(nodeType);
}

export function getChildPath(nodeEl: NodeElement) {
    if (isPropertyNodeElement(nodeEl)) return nodeEl.propertyName;
    if (isEntityNodeElement(nodeEl)) return nodeEl.refEntityName;
    if (isTableNodeElement(nodeEl)) return nodeEl.tableName;
    return '';
    // return 'n/a-childPath-for' + nodeEl.nodeType;
}

export function getDefaultForm(entity: Entity, entitiesMap: _.Dictionary<Entity>): Form {
    let form = new Form();
    form._id = 'Form_:' + entity._id;
    form.isEditable = entity.isEditable;
    form.stateGraph = entity.stateGraph;
    form.grid = new FormGrid();
    form.page = {
        layout: "dashboard",
    }

    setFormElementChildren(form.grid, entity, entitiesMap);
    console.log('form:', form);
    addIdsToForm(form.grid);
    return form;
}

export function setFormElementChildren(parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {
    parentFormEl.childNodes = _.values(entity.props).map(pn => {
        let child;
        if (pn.propType_ === Pn.CHILD_TABLE) {
            child = pn.isLargeTable ? new FormTable() : new FormTabs();
            child.tableName = pn.name;
            if (pn.referencedEntityName) setFormElementChildren(child, entitiesMap[pn.referencedEntityName]!, entitiesMap);
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
            child.propertyType = pn.propType_;
        } else if (pn.propType_ === Pn.LINK) {
            child = new FormText();
            child.propertyName = pn.name;
            child.propertyType = pn.propType_;
            child.representation = "link";
        } else if (pn.propType_ === Pn.STRING && pn.name == '_id') {
            child = new FormText();
            child.propertyName = pn.name;
            child.propertyType = pn.propType_;
            child.representation = "_id";
        } else {
            child = new FormInput();
            if (parentFormEl.nodeType === NodeType.form_table) {
                child.noLabel = true;
            }
            child.propertyName = pn.name;
            child.propertyType = pn.propType_;
        }

        let ret;
        if (parentFormEl.nodeType === NodeType.form_table) {
            ret = child;
        } else {
            ret = new HLayout();
            ret.childNodes = [child];
        }

        return ret;
    });
}

function getFormElementForStaticPages(parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: _.Dictionary<Entity>) {

}

export function addIdsToForm(input: NodeElement): void {
    if (!input._id) { input._id = generateUUID(); }
    if (isNodeElementWithChildren(input) && input.childNodes && input.childNodes.length > 0) {
        input.childNodes.forEach(c => addIdsToForm(c));
    }
}

export class FormGrid implements SubObj {
    readonly nodeType = NodeType.form_grid;
    _id: string;
    childNodes?: NodeElement[];
}

export class FormInput implements SubObj {
    readonly nodeType = NodeType.form_input;
    _id: string;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING;
}
export class FormText implements SubObj {
    readonly nodeType = NodeType.form_text;
    _id: string;
    propertyName: string;
    representation: "title" | "h1" | "h2" | "h3" | "h4" | "paragraph" | "caption" | "jumbo" | "link" | "_id" | "string";
    uppercase?: boolean;
}
export class FormAutocomplete implements SubObj {
    readonly nodeType = NodeType.form_autocomplete;
    _id: string;
    noLabel?: boolean;
    refEntityAlias?: string;
    refEntityName: string;
    refPropertyName: string;
    propertyName: string;
}
export class FormTabs implements SubObj {
    readonly nodeType = NodeType.form_tabs;
    _id: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export class FormCard implements SubObj {
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

export class CardContainer implements SubObj {
    readonly nodeType = NodeType.card_container;
    _id: string;
    tableName: string;
    tabNameFormPath: string;
    cardNode: NodeElement;
}

export class FormDataGrid implements SubObj {
    readonly nodeType = NodeType.form_data_grid;
    _id: string;
    refEntityName: string;
    displayedRefEntityProperties?: string[];
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

export class FormChart implements SubObj {
    readonly nodeType = NodeType.form_chart;
    _id: string;
    tableName: string;
    chartType: string;
    width: number;
    height: number;
    xPropertyName: string;
    yPropertyName: string;
    groupByPropertyName?: string;
}

export class Button implements SubObj {
    readonly nodeType = NodeType.button;
    _id: string;
}


export class ButtonGroup implements SubObj {
    readonly nodeType = NodeType.button_group;
    _id: string;
}


export class Calendar implements SubObj {
    readonly nodeType = NodeType.calendar;
    _id: string;
}


export class Card implements SubObj {
    readonly nodeType = NodeType.card;
    _id: string;
}


export class Dropdown implements SubObj {
    readonly nodeType = NodeType.dropdown;
    _id: string;
}


export class FormEnum implements SubObj {
    readonly nodeType = NodeType.form_enum;
    _id: string;
}


export class FormState implements SubObj {
    readonly nodeType = NodeType.form_state;
    _id: string;
}


export class Gallery implements SubObj {
    readonly nodeType = NodeType.gallery;
    _id: string;
}


export class HFilters implements SubObj {
    readonly nodeType = NodeType.h_filters;
    _id: string;
}


export class HLayout implements SubObj {
    readonly nodeType = NodeType.h_layout;
    _id: string;
    childNodes: NodeElement[];
}


export class HNav implements SubObj {
    readonly nodeType = NodeType.h_nav;
    _id: string;
}


export class Icon implements SubObj {
    readonly nodeType = NodeType.icon;
    _id: string;
}


export class Image implements SubObj {
    readonly nodeType = NodeType.image;
    _id: string;
}


export class List implements SubObj {
    readonly nodeType = NodeType.list;
    _id: string;
}


export class Media implements SubObj {
    readonly nodeType = NodeType.media;
    _id: string;
}


export class Timeline implements SubObj {
    readonly nodeType = NodeType.timeline;
    _id: string;
}


export class VFilters implements SubObj {
    readonly nodeType = NodeType.v_filters;
    _id: string;
}


export class VLayout implements SubObj {
    readonly nodeType = NodeType.v_layout;
    _id: string;
    childNodes?: NodeElement[];
}


export class VNav implements SubObj {
    readonly nodeType = NodeType.v_nav;
    _id: string;
}

