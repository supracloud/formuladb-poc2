import { KeyValueObj } from "./domain/key_value_obj";
import { KeyValueStore } from "./key_value_store";
import * as _ from "lodash";

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem implements KeyValueStore {
    private db: {[x: string]: KeyValueObj} = {};

    constructor() {
    }

    public simpleQuery(query: any) {

    }

    public mapReduceQuery() {

    }

    public findByType<T extends KeyValueObj>(type_: string): Promise<T[]> {
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
