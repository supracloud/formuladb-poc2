import { BaseObj } from '../base_obj';
import { Property } from "../metadata/property";
import { Label } from './label';

export class FormElementAttributes {
    [x: string]: any;
}

export class FormElement extends BaseObj {
    nodeName: string;

    //this element is a property (formControl), in case this attribute is not null
    propertyName?: string;

    //this element is a table (formArray), in case this attribute is not null
    tableName?: string;

    //this element is an entity (formGroup), in case this attribute is not null
    entityName?: string;
    
    copiedProperties?: string[];//this only applies to entities
    
    attributes?: FormElementAttributes;
    
    childNodes?: FormElement[] = [];
}

export class Form extends FormElement {
    public _type = 'Form_';
    constructor() {
        super();
        this.nodeName = 'form-grid';
    }
}
