import { BaseObj, SubObj } from '../base_obj';
import { EntityProperty, propertiesWithNamesOf, Pn, Entity } from "../metadata/entity";
import { Label } from './label';
import { generateUUID } from '../uuid';

export class NodeElementAttributes {
    snapshotCurrentValueOfProperties?: string[];//this only applies to entities
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

export class FormGrid extends SubObj {
    readonly nodeType = NodeType.form_grid;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormGridRow extends SubObj {
    readonly nodeType = NodeType.form_grid_row;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormGridCol extends SubObj {
    readonly nodeType = NodeType.form_grid_col;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormInput extends SubObj {
    readonly nodeType = NodeType.form_input;
    _id?: string;
    propertyName: string;
}
export class FormAutocomplete extends SubObj {
    readonly nodeType = NodeType.form_autocomplete;
    _id?: string;
    entityName: string;
    snapshotCurrentValueOfProperties?: string[];
}
export class FormTabs extends SubObj {
    readonly nodeType = NodeType.form_tabs;
    _id?: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export class FormTab extends SubObj {
    readonly nodeType = NodeType.form_tab;
    _id?: string;
    childNodes?: NodeElement[];
}
export class FormTable extends SubObj {
    readonly nodeType = NodeType.form_table;
    _id?: string;
    tableName: string;
    childNodes?: NodeElement[];
}
export class FormDatepicker extends SubObj {
    readonly nodeType = NodeType.form_datepicker;
    _id?: string;
    propertyName: string;
}
export class FormTimepicker extends SubObj {
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

export function getDefaultForm(entity: Entity, entitiesMap: Map<string, Entity>): Form {
    let form = new Form();
    form._id = 'Form_:' + entity._id
    form.grid = new FormGrid();

    setFormElementChildren(form.grid, entity, entitiesMap);
    console.log('form:', JSON.stringify(form));
    addIdsToForm(form.grid);
    return form;
}

export function setFormElementChildren(parentFormEl: NodeElementWithChildren, entity: Entity, entitiesMap: Map<string, Entity>) {
    parentFormEl.childNodes = propertiesWithNamesOf(entity).map(pn => {
        let child = null;
        if (pn.prop.propType_ === Pn.SUB_TABLE) {
            child = pn.prop.isLargeTable ? new FormTable() : new FormTabs();
            child.tableName = pn.name;
            setFormElementChildren(child, entitiesMap.get(pn.prop.deepPath), entitiesMap);
        } else if (pn.prop.propType_ === Pn.BELONGS_TO) {
            child = new FormAutocomplete();
            child.entityName = pn.name;
            child.attributes = { snapshotCurrentValueOfProperties: pn.prop.snapshotCurrentValueOfProperties };
        } else {
            child = new FormInput();
            child.propertyName = pn.name;
        }

        let ret = new FormGridRow();
        ret.childNodes = [child];
        return ret;
    });
}

export function addIdsToForm(input: NodeElement): void {
    if (!input._id) { input._id = generateUUID(); }
    if (isNodeElementWithChildren(input) && input.childNodes.length > 0) {
        input.childNodes.forEach(c => addIdsToForm(c));
    }
}
