/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj } from '@storage/domain/key_value_obj';

export class ChangeObj<T extends KeyValueObj> {
    deleted?: boolean;
    synced?: boolean;
    obj: T;

    constructor(e: T) {
        this.obj = e
    }
}

/**
 * TODO: investigate performance, perhaps we should use immutable.js here
 * @param existing 
 * @param changes 
 */
export function applyChanges<T extends KeyValueObj>(existing: T[], changes: ChangeObj<T>[]): T[] {
    let ret = [] as T[];

    //sync existing objects
    existing.forEach(x => {
        let change = changes.find(y => y.obj._id === x._id);
        if (null == change) {ret.push(x); return}
        if (change.deleted) return;
        ret.push(Object.assign({}, x, change.obj));
        change.synced = true;
    });

    //add new objects
    changes.forEach(change => {
        if (change.deleted) return;
        if (change.synced) {delete change.synced; return;}
        ret.push(change.obj);
    });
    
    return ret;
}
