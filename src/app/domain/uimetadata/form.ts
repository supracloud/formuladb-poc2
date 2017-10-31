import { BaseObj } from '../base_obj';
import { Property } from "../metadata/entity";
import { Label } from './label';

export enum NodeType { 
    FormGrid ,
    FormGridRow ,
    FormGridCol ,
    FormInput ,
    FormAutocomplete ,
    FormTabs ,
    FormTab ,
    FormTable ,
    FormDatepicker,
    FormTimepicker
}

export const NodeType2Str: Map<NodeType, string> = new Map([
    [NodeType.FormGrid, "form-grid"],
    [NodeType.FormGridRow, "form-grid-row"],
    [NodeType.FormGridCol, "form-grid-col"],
    [NodeType.FormInput, "form-input"],
    [NodeType.FormAutocomplete, "form-autocomplete"],
    [NodeType.FormTabs, "form-tabs"],
    [NodeType.FormTab, "form-tab"],
    [NodeType.FormTable, "form-table"],
    [NodeType.FormDatepicker, "form-datepicker"],
    [NodeType.FormTimepicker, "form-timepicker"],
]);

export const Str2NodeType: Map<string, NodeType> = new Map([
    ["form-grid", NodeType.FormGrid],
    ["form-grid-row", NodeType.FormGridRow],
    ["form-grid-col", NodeType.FormGridCol],
    ["form-input", NodeType.FormInput],
    ["form-autocomplete", NodeType.FormAutocomplete],
    ["form-tabs", NodeType.FormTabs],
    ["form-tab", NodeType.FormTab],
    ["form-table", NodeType.FormTable],
    ["form-datepicker", NodeType.FormDatepicker],
    ["form-timepicker", NodeType.FormTimepicker],
]);


export class NodeElementAttributes {
    copiedProperties?: string[];//this only applies to entities
    tabNameFormPath?: string;//used for form-tabs to select which field gives the name for the tab
    [x: string]: any;
}

export class NodeElement extends BaseObj {
    nodeType: NodeType;

    //this element is a property (formControl), in case this attribute is not null
    propertyName?: string;

    //this element is a table (formArray), in case this attribute is not null
    tableName?: string;

    //this element is an entity (formGroup), in case this attribute is not null
    entityName?: string;
    
    attributes?: NodeElementAttributes;
    
    childNodes?: NodeElement[] = [];
}

export class Form extends NodeElement {
    public _type = 'Form_';
    constructor() {
        super();
        this.nodeType = NodeType.FormGrid;
    }
}
