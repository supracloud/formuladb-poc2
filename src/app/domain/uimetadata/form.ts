import { BaseObj } from '../base_obj';
import { Label } from './label';

export class FormElementAttributes {
    [x: string]: any;
    formControlName?: string;
}
export class FormElement extends BaseObj {
    nodeName: string;
    attributes?: FormElementAttributes;
    childNodes?: FormElement[] = [];
}

export class MwzInputFormElement extends FormElement {
    attributes: {value: string, formControlName: string};
}

export class Form extends FormElement {
}
