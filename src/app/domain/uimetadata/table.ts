import { BaseObj } from '../base_obj';

export class TableColumn {
    _id?: string;
    constructor(public name: string, public type: string) { };
}

export class Table extends BaseObj {
    mwzType = 'Table_';
    literal: string;
    columns: TableColumn[];
}
