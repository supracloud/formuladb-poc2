/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI } from "./key_value_store_i";
import * as _ from "lodash";

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem<VALUET> implements KeyValueStoreI<VALUET> {

    private db: {[x: string]: VALUET} = {};

    constructor() {
    }

    public get(_id: string): Promise<VALUET> {
        return Promise.resolve(this.db[_id]);
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        let ret = _.entries(this.db).filter(([_id, val]) => 
            (opts.startkey < _id && _id < opts.endkey)
            || (opts.inclusive_start && _id === opts.startkey)
            || (opts.inclusive_end && _id === opts.endkey)
        ).map(([_id, val]) => val);
        return Promise.resolve(ret);
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        this.db[_id] = obj;
        return this.get(_id);
    }

    public async del(_id: string): Promise<VALUET> {
        let ret = await this.get(_id);
        delete this.db[_id];
        return Promise.resolve(ret);
    }

    public async clearDB() {
        this.db = {};
    }

    public info(): Promise<string> {
        return Promise.resolve("in memory test KVS");
    }
}
 export class KeyValueStoreFactoryMem implements KeyValueStoreFactoryI {
     createKVS<VALUET>(valueExample: VALUET): KeyValueStoreI<VALUET> {
         return new KeyValueStoreMem<VALUET>();
     }
 }
