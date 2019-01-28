/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj } from "../key_value_obj";
import { parseDataObjIdES5 } from "../../map_reduce_utils";
export interface DataObj extends KeyValueObj {
    _id: string;
}
export interface DataObjId {
    entityName: string;
    id: string;
    uid: string;
}
export function parseDataObjId(_id: string): DataObjId {
    let ret = _parseDataObjId(_id);
    if (ret) return ret;
    else throw new Error("Expected id entityName:id but found " + _id);
}
export function isDataObj(param): param is DataObj {
    return param != null && typeof param === 'object' && null != _parseDataObjId(param._id);
}
function _parseDataObjId(_id: string | undefined): DataObjId | null {
    return parseDataObjIdES5(_id);
}
export function isNewDataObjId(_id: string): boolean {
    return _id.endsWith('~~');
}

export type DataObjDeepPath = string;
export type DataObjDeepPathTemplate = string;
export type DataObjRelativePath = string;
export type QueryDeepPath = string;
export type QueryDeepPathTemplate = string;
