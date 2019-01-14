/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreBase, RangeQueryOptsI, KeyValueStoreFactoryI } from "./key_value_store_i";
import * as _ from "lodash";
import { id } from "@swimlane/ngx-charts/release/utils";

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem extends KeyValueStoreBase {

    private db: {[x: string]: any} = {};

    constructor() {
        super();
    }

    public get<T>(_id: string): Promise<T> {
        return Promise.resolve(this.db[_id] as T);
    }

    public rangeQuery<T>(opts: RangeQueryOptsI): Promise<T[]> {
        let ret = _.entries(this.db).filter(([_id, val]) => 
            (opts.startkey < _id && _id < opts.endkey)
            || (opts.inclusive_start && _id === opts.startkey)
            || (opts.inclusive_end && _id === opts.endkey)
        ).map(([_id, val]) => val);
        return Promise.resolve(ret as T[]);
    }

    public set<T>(_id: string, obj: T): Promise<T> {
        this.db[_id] = obj;
        return this.get(_id);
    }

    public async del<T>(_id: string): Promise<T> {
        let ret = await this.get<T>(_id);
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
     createKVS(): KeyValueStoreBase {
         return new KeyValueStoreMem();
     }
 }