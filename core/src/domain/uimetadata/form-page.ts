/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Pn, Entity, EntityStateGraph } from "../metadata/entity";
import * as _ from 'lodash';
import { Page } from './page';
import { NodeType } from './node-elements';


export interface FormPage extends Page {
    _id: string;
    stateGraph?: EntityStateGraph;
    isEditable?: boolean;
}
export function isFormPage(param: KeyValueObj): param is FormPage {
    return param != null && typeof param === 'object' && param._id != null && param._id.indexOf('FormPage:') == 0;
}
export function getFormPageEntityId(formPage: FormPage) {
    return formPage._id.replace(/^FormPage:.*\^\^/, '');
}
export function emptyFormPage(entityId: string): FormPage {
    return { _id: "FormPage:ALL^^" + entityId, nodeType: NodeType.root_node };
}
