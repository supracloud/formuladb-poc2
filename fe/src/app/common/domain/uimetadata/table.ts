/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { BaseObj, SubObj } from '../base_obj';
import { Entity } from '../metadata/entity';
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { IdRevObj } from '../key_value_obj';

export class TableColumn implements SubObj {
    _id: string;
    width?: number;
    sort?: string;
    filter?: ColumnFilter;
    constructor(public name: string, public type: string) {
    };
}

export class ColumnFilter {
    operator: string;
    value: string;
}

export class Table implements BaseObj {
    _id: string;
    _rev?: string;
    literal: string;
    columns: TableColumn[];
}
export function isTable(param: IdRevObj): param is Table {
    return param != null && typeof param === 'object' && param._id.indexOf('Table_:') == 0;    
}

export function getDefaultTable(entity: Entity): Table {
    let table = new Table();
    table.columns = _.values(entity.props).map(pn => new TableColumn(pn.name, pn.propType_));
    addIdsToTable(table);
    return table;
}

export function addIdsToTable(input: Table): void {
    if (!input._id) { input._id = generateUUID(); }
    if (input.columns && input.columns.length > 0) {
        input.columns.forEach(c => c._id = generateUUID());
    }
}
