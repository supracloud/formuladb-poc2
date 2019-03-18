/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Entity, Pn } from "../metadata/entity";
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { Page } from './page';

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

export function getDefaultTable(entity: Entity): Table {
    const table = new Table();
    table.columns = _.values(entity.props).map(pn => new TableColumn(pn.name, pn.propType_));
    table.page = {
        layout: "frmdb-ly-admin",
    }
    addIdsToTable(table);
    return table;
}

export function addIdsToTable(input: Table): void {
    if (input) {
        if (!input._id) { input._id = generateUUID(); }
        if (input.columns && input.columns.length > 0) {
            input.columns.forEach(c => c._id = generateUUID());
        }
    }
}
