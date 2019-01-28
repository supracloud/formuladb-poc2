/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str } from "@core/key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "@core/domain/key_value_obj";

function simulateIO<T>(x: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(x), Math.random() * 10));
}

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem<VALUET> implements KeyValueStoreI<VALUET> {

    protected db: { [x: string]: VALUET } = {};

    constructor() {
    }

    public get(_id: string): Promise<VALUET> {
        return simulateIO(this.db[_id]);
    }

    /** querying a map-reduce view must return the results ordered by key */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{ key: string, val: VALUET }[]> {
        let ret = _.entries(this.db).filter(([_id, val]) =>
            (opts.startkey < _id && _id < opts.endkey)
            || (opts.inclusive_start && _id === opts.startkey)
            || (opts.inclusive_end && _id === opts.endkey)
        )
            .sort(([keyA, valA], [keyB, valB]) => {
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            .map(([_id, val]) => ({ key: _id, val: val }));
        return simulateIO(ret);
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({ key, val }) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        this.db[_id] = _.cloneDeep(obj);
        return this.get(_id);
    }

    public async del(_id: string): Promise<VALUET> {
        let ret = await this.get(_id);
        delete this.db[_id];
        return simulateIO(ret);
    }

    public async clearDB() {
        this.db = {};
    }

    all(): Promise<VALUET[]> {
        return simulateIO(Object.values(this.db));
    }


    public info(): Promise<string> {
        return simulateIO("in memory test KVS");
    }
}

export class KeyObjStoreMem<OBJT extends KeyValueObj> extends KeyValueStoreMem<OBJT> implements KeyObjStoreI<OBJT> {
    public findByPrefix(prefix: string): Promise<OBJT[]> {
        return this.rangeQuery({ startkey: prefix, endkey: prefix + "\ufff0", inclusive_start: true, inclusive_end: false });
    }
    public put(obj: OBJT): Promise<OBJT> {
        return this.set(obj._id, obj);
    }
    public putBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]> {
        //naive implementation, some databases have specific efficient ways to to bulk insert
        return Promise.all(objs.map(o => this.set(o._id, o)));
    }
    public delBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]> {
        //naive implementation, some databases have specific efficient ways to to bulk delete
        return Promise.all(objs.map(o => this.del(o._id)));
    }

}
export class KeyValueStoreFactoryMem implements KeyValueStoreFactoryI {
    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStoreMem<VALUET>();
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStoreMem<OBJT>();
    }

    async clearAll() {
        // Mem KV store is ephemeral so nothing to clear
    };
}