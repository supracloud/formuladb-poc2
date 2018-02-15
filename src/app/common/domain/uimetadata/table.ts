import { BaseObj, SubObj } from '../base_obj';
import { Entity, propertiesWithNamesOf } from '../metadata/entity';
import { generateUUID } from '../uuid';

export class TableColumn extends SubObj {
    _id?: string;
    constructor(public name: string, public type: string) {
        super();
    };
}

export class Table extends BaseObj {
    type_ = 'Table_';
    literal: string;
    columns: TableColumn[];
}

export function getDefaultTable(entity: Entity): Table {
    if (null == entity) return null;

    let table = new Table();
    table.columns = propertiesWithNamesOf(entity).map(pn => new TableColumn(pn.name, pn.prop.propType_));
    addIdsToTable(table);
    return table;
}

export function addIdsToTable(input: Table): void {
    if (!input._id) { input._id = generateUUID(); }
    if (input.columns && input.columns.length > 0) {
        input.columns.forEach(c => c._id = generateUUID());
    }
}
