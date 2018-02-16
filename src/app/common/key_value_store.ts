import { KeyValueObj } from "./domain/key_value_obj";

/**
 * Key Value Store with optimistic locking functionality
 */
export interface KeyValueStore {
    simpleQuery(query: any);
    mapReduceQuery();
    findByType<T extends KeyValueObj>(type_: string): Promise<T[]>;
    get<T extends KeyValueObj>(_id: string): Promise<T>;
    put<T extends KeyValueObj>(obj: T): Promise<T>;
    putAll<T extends KeyValueObj>(objs: T[]): Promise<T[]>;
    removeAll(): Promise<any>;
    forcePut<T extends KeyValueObj>(document: T): Promise<T>;
    info(): Promise<string>;
}
