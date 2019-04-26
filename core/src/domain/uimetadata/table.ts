/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Entity, Pn, FormulaExpression } from "../metadata/entity";
import { generateUUID } from '../uuid';
import * as _ from 'lodash';
import { FrmdbLy, Page } from './page';
import { Expression } from 'jsep';

export class TableColumn implements SubObj {
    _id: string;
    width?: number;
    sort?: string;
    filter?: ColumnFilter;
    skipExportExcel?: boolean;
    constructor(public name: string, public type: Pn) {
    }
}

export class CellCssRule {
    className: string;
    formula: Expression;
}

export class ColumnFilter {
    operator: string;
    value: string;
}

export class Table implements KeyValueObj {
    _id: string;
    _rev?: string;
    page: Partial<Page>;
    conditionalFormatting?: {[cssClassName: string]: FormulaExpression};
    headerHeight?: number;
    headerBackground?: string;
    columns: TableColumn[];
}
export function isTable(param: SubObj): param is Table {
    return param != null && typeof param === 'object' && param._id.indexOf('Table_:') === 0;
}
