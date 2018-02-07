import { BaseObj } from '../base_obj';
import { EntityProperty } from "../metadata/entity";
import { Label } from './label';

export class NodeElementAttributes {
    copiedProperties?: string[];//this only applies to entities
    tabNameFormPath?: string;//used for form_tabs to select which field gives the name for the tab
    [x: string]: any;
}

export enum NodeType { 
    form_grid              = "form_grid"        ,
    form_grid_row          = "form_grid_row"    ,
    form_grid_col          = "form_grid_col"    ,
    form_input             = "form_input"       ,
    form_autocomplete      = "form_autocomplete",
    form_tabs              = "form_tabs"        ,
    form_tab               = "form_tab"         ,
    form_table             = "form_table"       ,
    form_datepicker        = "form_datepicker"  ,
    form_timepicker        = "form_timepicker"  ,
}

export class FormGrid {
    readonly nodeType = NodeType.form_grid;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormGridRow {
    readonly nodeType = NodeType.form_grid_row;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormGridCol {
    readonly nodeType = NodeType.form_grid_col;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormInput {
    readonly nodeType = NodeType.form_input;
    _id?: string;
    propertyName: string;
}
export class FormAutocomplete {
    readonly nodeType = NodeType.form_autocomplete;
    _id?: string;
    entityName: string;
    copiedProperties?: string[];
}
export class FormTabs {
    readonly nodeType = NodeType.form_tabs;
    _id?: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export class FormTab {
    readonly nodeType = NodeType.form_tab;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormTable {
    readonly nodeType = NodeType.form_table;
    _id?: string;
    tableName: string;
    childNodes?: NodeElement[];
}
export class FormDatepicker {
    readonly nodeType = NodeType.form_datepicker;
    _id?: string;
    propertyName: string;
}
export class FormTimepicker {
    readonly nodeType = NodeType.form_timepicker;
    _id?: string;
    propertyName: string;
}

export class Form extends BaseObj {
    readonly type_ = 'Form_';
    grid: FormGrid;
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
    return nodeEl.nodeType  === NodeType.form_autocomplete;
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
