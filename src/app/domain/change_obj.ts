import { BaseObj } from './base_obj';

export class ChangeObj<T extends BaseObj> {
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
export function applyChanges<T extends BaseObj>(existing: T[], changes: ChangeObj<T>[]): T[] {
    let ret = [] as T[];

    //sync existing objects
    existing.forEach(x => {
        let change = changes.find(y => y.obj._id === x._id);
        if (change.deleted) return;
        if (null == change) ret.push(x);
        else {
            ret.push(Object.assign({}, x, change.obj));
            change.synced = true;
        }
    });

    //add new objects
    changes.forEach(change => {
        if (change.deleted || change.synced) return;
        ret.push(change.obj);
    });
    
    return ret;
}
