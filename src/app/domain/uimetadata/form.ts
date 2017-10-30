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
    FormTable ,
}

export const NodeType2Str: Map<NodeType, string> = new Map([
    [NodeType.FormGrid, "form-grid"],
    [NodeType.FormGridRow, "form-grid-row"],
    [NodeType.FormGridCol, "form-grid-col"],
    [NodeType.FormInput, "form-input"],
    [NodeType.FormAutocomplete, "form-autocomplete"],
    [NodeType.FormTabs, "form-tabs"],
    [NodeType.FormTable, "form-table"],
]);

export const Str2NodeType: Map<string, NodeType> = new Map([
    ["form-grid", NodeType.FormGrid],
    ["form-grid-row", NodeType.FormGridRow],
    ["form-grid-col", NodeType.FormGridCol],
    ["form-input", NodeType.FormInput],
    ["form-autocomplete", NodeType.FormAutocomplete],
    ["form-tabs", NodeType.FormTabs],
    ["form-table", NodeType.FormTable],
]);


export class NodeElementAttributes {
    copiedProperties?: string[];//this only applies to entities
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
