/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";

export interface KeyValueObj {
    _id: string;
}

export interface SubObj extends KeyValueObj {

}

export interface KeyValueError {
    /**
     * HTTP Status Code during HTTP or HTTP-like operations
     */
    status?: number;
    name?: string;
    message?: string;
    reason?: string;
    error?: string | boolean;
    id?: string;
    rev?: string;
}
export function isKeyValueError(param): param is KeyValueError {
    return param != null && typeof param === 'object' && typeof param.status === 'number' && typeof param.name === 'string' && typeof param.message === 'string';
}

export interface Transaction extends KeyValueObj {
    _id: string;
    diff: any;
    state: 'BEGIN' | 'PRE_COMMIT' | 'COMMIT';
}

export function isReservedPropName(propName: string): boolean {
    if (propName.length == 0) return false;
    return propName.slice(-1) === '_' || propName.charAt(0) === '_';
}

export const RESERVED_PROP_NAMES = ['_id', '_rev', 'created_', 'updated_', 'updated_by_', 'rev_', 'trs_', 'id_',
    'type_', 'propType_', 'module_', 'executionPlan_'];


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
