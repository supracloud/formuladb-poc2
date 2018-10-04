/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueObj, KeyValueError } from "./domain/key_value_obj";
import { PickOmit } from "./ts-utils";

export interface MapReduceResponseI {
    total_rows?: number;
    offset?: number;
    rows: Array<{
        key: any;
        value: any;
        id?: any;
        doc?: any;
    }>;
}

export interface MapReduceI {
    mapReduceQuery(viewName: string, opts?: MapReduceQueryOptions): Promise<MapReduceResponseI>;
    getMapReduceQueryMetadata(viewName: string): Promise<any>;

    /**
     * Note: map/reduce functions must not have any external dependencies, they must be self contained
     * TODO: use https://github.com/acornjs/acorn parser and/or https://github.com/NeilFraser/JS-Interpreter to validate that map/reduce functions are self contained
     */
    putMapReduceQuery(viewName: string, map: ((doc: KeyValueObj) => any) | string, reduce?: ((keys, values, rereduce) => any) | string): Promise<any>;
    putMapReduceQueryWithMetadata(viewId: string, metadata, map: ((doc: KeyValueObj) => any) | string, reduce?: ((keys, values, rereduce) => any) | string): Promise<any>;
}

/**
 * Key Value Store with optimistic locking functionality
 */
export interface KeyValueStoreI extends MapReduceI {
    simpleJSONQuery(query: any);

    findByPrefix<T extends KeyValueObj>(type_: string): Promise<T[]>;
    get<T extends KeyValueObj>(_id: string): Promise<T>;
    range<T extends KeyValueObj>(startkey: string, endkey: string, inclusive_end: boolean): Promise<T[]>;
    put<T extends KeyValueObj>(obj: T): Promise<T>;
    post<T extends KeyValueObj>(obj: PickOmit<T, '_id'>): Promise<T>;
    putAll<T extends KeyValueObj>(objs: T[]): Promise<(T|KeyValueError)[]>;
    removeAll(): Promise<any>;
    forcePut<T extends KeyValueObj>(document: T): Promise<T>;
    info(): Promise<string>;
}

export interface MapReduceQueryOptions {
    /** Reduce function, or the string name of a built-in function: '_sum', '_count', or '_stats'. */
    reduce?: boolean;

    /** Include the document in each row in the doc field. */
    include_docs?: boolean;

    /** Get rows with keys in a certain range (inclusive/inclusive). */
    startkey?: any;
    /** Get rows with keys in a certain range (inclusive/inclusive). */
    endkey?: any;
    /** Include rows having a key equal to the given options.endkey. */
    inclusive_start?: boolean;
    inclusive_end?: boolean;
    /** Maximum number of rows to return. */
    limit?: number;
    /** Number of rows to skip before returning (warning: poor performance on IndexedDB/LevelDB!). */
    skip?: number;
    /** Reverse the order of the output rows. */
    descending?: boolean;
    /** Only return rows matching this key. */
    key?: any;
    /** Array of keys to fetch in a single shot. */
    keys?: any[];
    /** True if you want the reduce function to group results by keys, rather than returning a single result. */
    group?: boolean;
    /**
     * Number of elements in a key to group by, assuming the keys are arrays.
     * Defaults to the full length of the array.
     */
    group_level?: number;
    /**
     * unspecified (default): Returns the latest results, waiting for the view to build if necessary.
     * 'ok': Returns results immediately, even if they’re out-of-date.
     * 'update_after': Returns results immediately, but kicks off a build afterwards.
     */
    stale?: 'ok' | 'update_after';
}
