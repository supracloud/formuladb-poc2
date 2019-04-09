/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Entity, Pn } from "../metadata/entity";
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { FrmdbLy, Page } from './page';

export class TableColumn implements SubObj {
    _id: string;
    width?: number;
    sort?: string;
    filter?: ColumnFilter;

    constructor(public name: string, public type: Pn) {
    }
}

export class ColumnFilter {
    operator: string;
    value: string;
}

export class Table implements KeyValueObj {
    _id: string;
    _rev?: string;
    page: Partial<Page>;
    columns: TableColumn[];
}
export function isTable(param: SubObj): param is Table {
    return param != null && typeof param === 'object' && param._id.indexOf('Table_:') === 0;
}
