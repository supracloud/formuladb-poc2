import { BaseObj } from '../base_obj';
import { Property } from "../metadata/property";
import { Label } from './label';

export class FormElementAttributes {
    [x: string]: any;
}
export class FormElement extends BaseObj {
    nodeName: string;
    property?: Property;
    attributes?: FormElementAttributes;
    childNodes?: FormElement[] = [];
}

export class Form extends FormElement {
}
