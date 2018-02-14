import { KeyValueObj } from "./key_value_obj";
import * as _ from "lodash";

/**
 * SubObj(s) are nested objects of BaseObj(s)
 */
export class SubObj {
    _id?: string;
    [x: string]: BaseObjPropTypes;
}

/**
 * a RefObj is a SubObj that references a SubObj from another BaseObj
 */
export class RefObj extends SubObj {
    ref_: string;
}

export type BaseObjPropTypes = string | number | boolean | any[] | SubObj;

/**
 * A Transaction is a modification done by an actor (User/Robot) on a BaseObj
 */
export class Transaction extends SubObj {
    id_: string;
    diff: any;
    state: 'BEGIN' | 'PRE_COMMIT' | 'COMMIT';
}
export function isSubObj(obj: any): obj is SubObj {
    return typeof obj == 'object' && obj['_id'] != null;
}

/**
 * Transactions is the list of Transaction(s) done by actors to a certain BaseObj
 */
export class Transactions extends SubObj {
    log_: string[];
    [x: string]: Transaction | string[] | string;
}

/**
 * BaseObj(s) are the main data objects that get persisted into KeyValueStore
 */
export class BaseObj extends KeyValueObj {
    created_?: string;
    updated_?: string;
    updated_by_?: string;
    rev_?: string;
    trs_?: Transactions;

    [x: string]: BaseObjPropTypes;
}

export function isNonOverridableProperty(propName: string): boolean {
    if (propName.length == 0) return false;
    return propName.slice(-1) === '_' || propName.charAt(0) === '_';
}

export const RESERVED_PROP_NAMES = ['_id', '_rev', 'created_', 'updated_', 'updated_by_', 'rev_', 'trs_', 'id_',
    'type_', 'propType_', 'module_', 'executionPlan_'];
export type ReservedPropNames = '_id' | '_rev' | 'created_' | 'updated_' | 'updated_by_' | 'rev_' | 'trs_' | 'id_' |
    'type_' | 'propType_' | 'module_' | 'executionPlan_';
type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];

export type ReservedPropNamesOf<T> = keyof T & ReservedPropNames;
export type NonReservedPropNamesOf<T> = Diff<keyof T, ReservedPropNames>;

export function queryObjectWithDeepPath(obj: BaseObj, deepPath: string, pickProperties?: string[]): RefObj {
    let { path, relativePath } = parseDeepPath(deepPath);
    let objPath: Array<{ pathSegment: string, obj: BaseObj | SubObj }> = [{ pathSegment: path, obj: obj }];
    let currentObj: BaseObj | BaseObjPropTypes = obj;

    if (relativePath != null && relativePath != '') {
        relativePath.split(/\//).forEach(propName => {
            let o = currentObj[propName];
            if (isSubObj(o) || o instanceof Array) {
                objPath.push({ pathSegment: propName, obj: currentObj[propName] });
                currentObj = o;
            } else throw new Error('Path ' + deepPath + ' too deep; ' + JSON.stringify(o) + ' is not an SubObj, while looking for property ' + propName + '; root obj is ' + JSON.stringify(obj, null, 2));
        })
    }

    let ret = { ref_: objPath.map(x => x.pathSegment + '/' + x.obj._id).join('/') };
    let copiedProps = pickProperties != null ? pickProperties : _.difference(_.keys(objPath.slice(-1)[0].obj), RESERVED_PROP_NAMES);
    copiedProps.forEach(propName => {
        let idx = objPath.length - 1, targetVal = objPath[idx].obj, realPropName = null;
        propName.split(/\//).forEach(pName => {
            if ('..' == pName) {
                idx -= 1;
                targetVal = objPath[idx].obj;
            } else {
                if (typeof targetVal === 'object') {
                    targetVal = {[pName]: targetVal[pName]};
                } else throw new Error(propName + ' invalid property path for object path ' + JSON.stringify(objPath, null, 2));
            }
        });
        _.extend(ret, targetVal);
    });

    return ret;
}

export function parseDeepPath(deepPath: string): { path: string, relativePath: string } {
    let match = deepPath.match(/^(\/\w+\/\w+)\/?(.*)/);
    if (null == match || match.length < 2) throw new Error("Not a valid deepPath: " + deepPath);

    if (match.length >= 3 && match[2] != null && match[2] !== '') {
        return { path: match[1], relativePath: match[2] };
    } else return { path: match[1], relativePath: match[2] };
}
