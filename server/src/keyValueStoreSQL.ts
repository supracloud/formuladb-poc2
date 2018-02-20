import { KeyValueStoreI, MapReduceQueryOptions } from "../../src/app/common/key_value_store_i";
import { KeyValueObj } from "../../src/app/common/domain/key_value_obj";

export class KeyValueStoreSQL implements KeyValueStoreI {
    mapReduceQuery(viewId: string, opts: MapReduceQueryOptions): KeyValueObj[] {
        throw new Error("Method not implemented.");
    }
    putMapReduceQuery(viewId: string, map: (doc: KeyValueObj) => any, reduce?: (keys, values, rereduce) => any) {
        throw new Error("Method not implemented.");
    }
    simpleJSONQuery(query: any) {
        throw new Error("Method not implemented.");
    }
    findByType<T extends KeyValueObj>(type_: string): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    get<T extends KeyValueObj>(_id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
    put<T extends KeyValueObj>(obj: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    putAll<T extends KeyValueObj>(objs: T[]): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    removeAll(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    forcePut<T extends KeyValueObj>(document: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    info(): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
