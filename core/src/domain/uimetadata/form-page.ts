/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Pn, Entity, EntityStateGraph } from "../metadata/entity";
import * as _ from 'lodash';
import { Page } from './page';


export interface FormPage extends Page {
    _id: string;
    _rev?: string;
    stateGraph?: EntityStateGraph;
    isEditable?: boolean;
}
export function isFormPage(param: KeyValueObj): param is FormPage {
    return param != null && typeof param === 'object' && param._id != null && param._id.indexOf('FormPage:') == 0;
}
