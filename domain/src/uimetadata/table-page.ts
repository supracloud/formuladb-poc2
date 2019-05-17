/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { NodeType } from './node-elements';
import { Page } from './page';


export interface TablePage extends Page {
    _id: string;
}
export function isTablePage(param): param is TablePage {
    return param != null && typeof param === 'object' && param._id != null && param._id.indexOf('TablePage:') === 0;
}
export function getTablePageEntityId(TablePage: TablePage) {
    return TablePage._id.replace(/^TablePage:.*\^\^/, '');
}
export function emptyTablePage(entityId: string, role?: string): TablePage {
    return { _id: "TablePage:ALL^^" + entityId, nodeType: NodeType.root_node };
}
