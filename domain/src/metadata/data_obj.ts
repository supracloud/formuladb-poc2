/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, KeyValueObjIdType, _idAsStr } from "../key_value_obj";

export interface DataObj extends KeyValueObj {
    _rev?: string;
    _owner?: string;
    _role?: string;
    _schema_rev?: string;
}

export interface DataObjId {
    entityId: string;
    id: string;
    uid: string;
}
export function parsePrefix(prefix: string): string {
    let idx = prefix.indexOf('~~');
    return prefix.substr(0, idx) || 'ZZZblabla';
}
export function entityNameFromDataObjId(_id: KeyValueObjIdType): string {
    let id = _idAsStr(_id);
    return id.substring(0, id.indexOf('~~'));
}
export function parseDataObjId(_id: KeyValueObjIdType): DataObjId {
    let ret = _parseDataObjId(_idAsStr(_id));
    if (ret) return ret;
    else throw new Error("Expected id entityId:id but found " + _id);
}
export function isDataObj(param): param is DataObj {
    return param != null && typeof param === 'object' && null != _parseDataObjId(param._id);
}
export function parseDataObjIdES5(_id) {
    if (!_id) return null;
    var m = _id.match(/^([$\w_]+)~~([^{}]+)$/);
    if (null != m) {
        return {
            entityId: m[1]!,
            id: m[0]!,
            uid: m[2],
        };
    } else return null;
}
function _parseDataObjId(_id: string | undefined): DataObjId | null {
    return parseDataObjIdES5(_id);
}
export function isNewDataObjId(_id: KeyValueObjIdType): boolean {
    let id = _idAsStr(_id);
    return id.endsWith('~~') || id.endsWith('__') || id.endsWith('$AUTOID');
}
export function isNewTopLevelDataObjId(_id: KeyValueObjIdType): boolean {
    let id = _idAsStr(_id);
    return id.endsWith('~~');
}

export function getChildrenPrefix(referencedEntityName: string, parentUID: string) {
    return referencedEntityName + '~~' + parentUID + '__';
}

export function entityNameToChildTableFieldName(entityId: string) {
    return entityId.replace(/([a-z])([A-Z0-9])/g, (m, $1, $2) => $1 + '_' + $2)
        .toLowerCase() + '_table';
}
export function childTableFieldNameToEntityName(childTableName: string) {
    return childTableName.replace('_table', '')
        .replace(/(^|_)([a-z0-9])/g, (m, $1, $2) => $2.toUpperCase());
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
            if (addChildObjToChildTable(parentObj[key], key, obj)) return true;
        }
    }
    return false;
}

function addChildObjToChildTable(parentChildTable: Array<DataObj>, childTableKeyName: string, childObj: DataObj): boolean {
    let {entityId, id, uid} = parseDataObjId(childObj._id);
    if (childTableKeyName === entityNameToChildTableFieldName(entityId)) {
        parentChildTable.push(childObj);
        return true;
    } else return false;

}

export type DataObjDeepPath = string;
export type DataObjDeepPathTemplate = string;
export type DataObjRelativePath = string;
export type QueryDeepPath = string;
export type QueryDeepPathTemplate = string;
