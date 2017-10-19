import { BaseObj } from '../base_obj';
import { Property } from "../metadata/property";
import { Label } from './label';

export class FormElementAttributes {
    [x: string]: any;
}

export class FormElement extends BaseObj {
    nodeName: string;
    propertyName?: string;
    tableName?: string;
    entityName?: string;
    attributes?: FormElementAttributes;
    childNodes?: FormElement[] = [];
    copiedProperties?: string[];
}

export class Form extends FormElement {
}
