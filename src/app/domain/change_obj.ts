import { BaseObj } from './base_obj';

export class ChangeObj<T extends BaseObj> {
    deleted?: boolean;
    obj: T;
}

/**
 * TODO: investigate performance, perhaps we should use immutable.js here
 * @param existing 
 * @param changes 
 */
export function applyChanges<T extends BaseObj>(existing: T[], changes: ChangeObj<T>[]): T[] {
    let ret: T[] = [];

    existing.forEach(x => {
        let change = changes.find(y => y.obj._id === x._id);
        if (change.deleted) return;
        if (null == change) ret.push(x);
        else ret.push(Object.assign({}, x, change.obj));
    });

    return ret;
}
