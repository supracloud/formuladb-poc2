/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj } from "./key_value_obj";
import * as _ from "lodash";
import { isNumberES5 } from '../map_reduce_utils';
import { StringOmit } from "../ts-utils";

/**
 * SubObj(s) are nested objects of BaseObj(s)
 */
export interface SubObj {
    _id?: string;
}

/**
 * a RefObj is a SubObj that references a SubObj from another BaseObj
 */
export interface RefObj extends SubObj {
    ref_: string;
}

export type BaseObjPropTypes = string | number | boolean | Date | SubObj[] | string[] | SubObj |
    string[][] | string[][][] | string[][][][] | string[][][][][] | string[][][][][][];

/**
 * A Transaction is a modification done by an actor (User/Robot) on a BaseObj
 */
export interface Transaction extends SubObj {
    _id: string;
    diff: any;
    state: 'BEGIN' | 'PRE_COMMIT' | 'COMMIT';
}
export function isSubObj(obj: any): obj is SubObj {
    return typeof obj == 'object' && obj['_id'] != null;
}


/**
 * BaseObj(s) are the main data objects that get persisted into KeyValueStore
 */
export interface BaseObj extends KeyValueObj {
    valid_?: boolean;
    validMsg_?: string;
    created_?: string;
    updated_?: string;
    updated_by_?: string;
}

export function isReservedPropName(propName: string): boolean {
    if (propName.length == 0) return false;
    return propName.slice(-1) === '_' || propName.charAt(0) === '_';
}

export const RESERVED_PROP_NAMES = ['_id', '_rev', 'created_', 'updated_', 'updated_by_', 'rev_', 'trs_', 'id_',
    'type_', 'propType_', 'module_', 'executionPlan_'];
export type ReservedPropNames = '_id' | '_rev' | 'created_' | 'updated_' | 'updated_by_' | 'rev_' | 'trs_' | 'id_' |
    'type_' | 'propType_' | 'module_' | 'aliases_' | 'executionPlan_'
    | 'mapObserversImpactedByOneObservable__' | 'mapreduceAggsOfManyObservablesQueryableFromOneObs__';

export type ReservedPropNamesOf<T> = keyof T & ReservedPropNames;
export type NonReservedPropNamesOf<T> = StringOmit<keyof T, ReservedPropNames>;
export type PickNonReservedProperties<T> = {
    [P in NonReservedPropNamesOf<T>]: T[P];
}

function isNumber(s: string): boolean {
    return isNumberES5(s);
}



/**
 * Deep diff producing a patch that can be applied in both ways:
 *  - go from before to after
 *  - go back from after to before
 */
export function diffObj(before: any, after: any) {
    let o = Symbol('object'), a = Symbol('array'), s = Symbol('scalar');
    function getTypeOf(x) {
        if (typeof x === 'function') throw new Error('functions are not supported, just plain objects! x = ' + JSON.stringify(x) + '; before=' + JSON.stringify(before) + '; after=' + JSON.stringify(after));
        return _.isPlainObject(x) ? o : (_.isArray(x) ? a : s);
    }
    function changes(lhs, rhs) {
        let lhsType = getTypeOf(lhs), rhsType = getTypeOf(rhs);

        if (lhsType != rhsType) {
            return { lhs: lhs, rhs: rhs };
        } else if (lhsType === s && rhsType === s) {
            throw new Error('At least lhs' + JSON.stringify(lhs) + ' or rhs ' + JSON.stringify(rhs) + ' should be an object or array');
        } else {
            let ret = lhsType === a ? [] : {};
            _.forOwn(lhs, (lhsVal, key) => {
                let rhsVal = rhs[key];
                if (lhsVal !== rhsVal) {
                    if (_.isObject(lhsVal) && _.isObject(rhsVal)) {
                        ret[key] = changes(lhsVal, rhsVal);
                    } else {
                        ret[key] = { lhs: lhsVal || null, rhs: rhsVal || null };
                    }
                }
            });
            return ret;
        }
    }
    function additions(rhs, lhs, changes) {
        let rhsType = getTypeOf(rhs);
        let ret = rhsType === a ? [] : {};
        _.forOwn(rhs, (rhsVal, key) => {
            let lhsVal = lhs[key], chgVal = changes[key];
            if (null == lhsVal && null == chgVal) {
                ret[key] = { lhs: null, rhs: rhsVal };
            } else if (_.isObject(lhsVal) && _.isObject(rhsVal)) {
                ret[key] = additions(rhsVal, lhsVal, chgVal || {});
            }
        });
        return ret;
    }

    let chg = changes(before, after);
    let add = additions(after, before, chg);
    return _.merge(chg, add);
}

export function escPath(referencedEntityName: string) {
    return referencedEntityName.replace(/\//g, '--');
}
