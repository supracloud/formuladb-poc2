import { KeyValueStore } from "../../src/app/common/key_value_store";
import { KeyValueObj } from "../../src/app/common/domain/key_value_obj";

export class KeyValueStoreSQL implements KeyValueStore {
    simpleQuery(query: any) {
        throw new Error("Method not implemented.");
    }
    mapReduceQuery() {
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
