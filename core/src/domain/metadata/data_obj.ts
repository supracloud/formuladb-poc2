/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
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
export function parsePrefix(prefix: string): string {
    let idx = prefix.indexOf('~~');
    return prefix.substr(0, idx) || 'ZZZblabla';
}
export function entityNameFromDataObjId(_id: string): string {
    return _id.replace(/[~][~].*/, '');
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
    return _id.endsWith('~~') || _id.endsWith('__');
}
export function isNewTopLevelDataObjId(_id: string): boolean {
    return _id.endsWith('~~');
}

export function getChildrenPrefix(referencedEntityName: string, parentUID: string) {
    return referencedEntityName + '~~' + parentUID + '__';
}

export function mergeSubObj(parentObj: DataObj | null, obj: DataObj): boolean {
    if (parentObj == null) return false;

    for (let key of Object.keys(parentObj)) {
        if (typeof parentObj[key] === 'object' && parentObj[key]._id === obj._id) {
            parentObj[key] = obj;
            return true;
        }
    }
    for (let key of Object.keys(parentObj)) {
        if (typeof parentObj[key] === 'object' && mergeSubObj(parentObj[key], obj)) {
            return true;
        } else if (parentObj[key] instanceof Array) {
            for (let childObj of parentObj[key]) {
                if (mergeSubObj(childObj, obj)) return true;
            }
        }
    }
    return false;
}

export type DataObjDeepPath = string;
export type DataObjDeepPathTemplate = string;
export type DataObjRelativePath = string;
export type QueryDeepPath = string;
export type QueryDeepPathTemplate = string;
