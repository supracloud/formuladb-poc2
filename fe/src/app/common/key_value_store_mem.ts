/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj } from "./domain/key_value_obj";
import { KeyValueStoreI, MapReduceQueryOptions, MapReduceResponseI } from "./key_value_store_i";
import * as _ from "lodash";
import { PickOmit } from "./ts-utils";

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem implements KeyValueStoreI {
    range<T extends KeyValueObj>(startkey: string, endkey: string, inclusive_end?: boolean | undefined): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    private db: {[x: string]: KeyValueObj} = {};

    constructor() {
    }

    public simpleJSONQuery(query: any) {
        throw new Error("simpleQuery not implemented.");
    }

    post<T extends KeyValueObj>(obj: PickOmit<T, '_id'>): Promise<T> {
        throw new Error("Method not implemented.");
    }
    mapReduceQuery(viewName: string, opts?: MapReduceQueryOptions | undefined): Promise<MapReduceResponseI> {
        throw new Error("Method not implemented.");
    }
    getMapReduceQueryMetadata(viewName: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    putMapReduceQuery(viewName: string, map: string | ((doc: KeyValueObj) => any), reduce?: string | ((keys: any, values: any, rereduce: any) => any) | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }
    putMapReduceQueryWithMetadata(viewId: string, metadata: any, map: string | ((doc: KeyValueObj) => any), reduce?: string | ((keys: any, values: any, rereduce: any) => any) | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public findByPrefix<T extends KeyValueObj>(type_: string): Promise<T[]> {
        let ret = _.values(this.db).filter(val =>  val._id.indexOf(type_) == 0);
        return Promise.resolve(ret as T[]);
    }

    public get<T extends KeyValueObj>(_id: string): Promise<T> {
        return Promise.resolve(this.db[_id] as T);
    }

    public put<T extends KeyValueObj>(obj: T): Promise<T> {
        this.db[obj._id] = obj;
        //TODO: return 409 in case _rev does not match
        return this.get(obj._id);
    }

    public putAll<T extends KeyValueObj>(objs: T[]): Promise<T[]> {
        objs.forEach(o => this.put(o));
        return Promise.resolve(objs);
    }

    public async removeAll() {
        this.db = {};
    }

    public forcePut<T extends KeyValueObj>(obj: T): Promise<T> {
        this.db[obj._id] = obj;
        return this.get(obj._id);
    }

    public info(): Promise<string> {
        return Promise.resolve("in memory test KVS");
    }
}
