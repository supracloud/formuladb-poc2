import { BaseObj } from '../base_obj';

export class TableColumn {
    _id?: string;
    constructor(public name: string, public type: string) { };
}

export class Table extends BaseObj {
    type_ = 'Table_';
    literal: string;
    columns: TableColumn[];
}
