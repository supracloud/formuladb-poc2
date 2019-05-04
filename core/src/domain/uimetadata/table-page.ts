/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Entity, Pn, FormulaExpression } from "../metadata/entity";
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { FrmdbLy, Page } from './page';


export interface TablePage extends Page {
    _id: string;
}
export function isTable(param: SubObj): param is TablePage {
    return param != null && typeof param === 'object' && param._id.indexOf('TablePage:') === 0;
}
