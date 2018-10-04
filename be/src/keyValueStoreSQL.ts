/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreI, MapReduceQueryOptions, MapReduceResponseI } from "../../fe/src/app/common/key_value_store_i";
import { KeyValueObj } from "../../fe/src/app/common/domain/key_value_obj";
import { PickOmit } from "../../fe/src/app/common/ts-utils";

export class KeyValueStoreSQL implements KeyValueStoreI {
    range<T extends KeyValueObj>(startkey: string, endkey: string, inclusive_end: boolean): Promise<T[]> {
        throw new Error("Method not implemented.");
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
    simpleJSONQuery(query: any) {
        throw new Error("Method not implemented.");
    }
    findByPrefix<T extends KeyValueObj>(type_: string): Promise<T[]> {
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
