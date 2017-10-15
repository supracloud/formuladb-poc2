import { BaseObj } from '../base_obj';
import { Label } from './label';

export class FormElementAttributes {
    [x: string]: any;
}
export class FormElement extends BaseObj {
    nodeName: string;
    formControlName?: string;
    formArrayName?: string;
    formGroupName?: string;
    attributes?: FormElementAttributes;
    childNodes?: FormElement[] = [];
}

export class MwzInputFormElement extends FormElement {
    attributes: {value: string};
}

export class Form extends FormElement {
}
