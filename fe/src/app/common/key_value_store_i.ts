/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueError, KeyValueObj } from "./domain/key_value_obj";
import * as Collate from 'pouchdb-collate';
import { ReduceFun } from "./domain/metadata/reduce_functions";
import { AddHocQuery } from "./domain/metadata/ad_hoc_query";

export interface KeyValueStoreI<VALUET> {
    get(key: string): Promise<VALUET | null>;
    /** The resulting rows are sorted by key */
    rangeQuery(opts: RangeQueryOptsBaseI<string>): Promise<VALUET[]>;
    /** The resulting rows are sorted by key */
    rangeQueryWithKeys(opts: RangeQueryOptsBaseI<string>): Promise<{key: string, val: VALUET}[]>;
    set(key: string, val: VALUET): Promise<VALUET>;
    del(key: string): Promise<VALUET>;
    clearDB(): Promise<any>;
}

export interface KeyObjStoreI<OBJT extends KeyValueObj> extends KeyValueStoreI<OBJT> {
    findByPrefix(prefix: string): Promise<OBJT[]>;
    put(obj: OBJT): Promise<OBJT>;
    putBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]>;
    delBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]>;
    /** filtering and grouping by any key */
    adHocQuery(params: AddHocQuery): Promise<any[]>;
}

export function kvsKey2Str(key: any): string {
    return Collate.toIndexableString(key);
}
export function kvsStr2Key(key: string): any {
    return Collate.parseIndexableString(key);
}

class KeyValueStoreBase<KEYT, VALUET> {
    constructor(protected kvs: KeyValueStoreI<VALUET>) {
    }

    public id2str(key: KEYT): string {
        return kvsKey2Str(key);
    }

    public str2id(key: string): KEYT {
        return kvsStr2Key(key);
    }

    public get(key: KEYT): Promise<VALUET | null> {
        return this.kvs.get(this.id2str(key));
    }
    public rangeQuery(opts: RangeQueryOptsBaseI<KEYT>): Promise<VALUET[]> {
        return this.kvs.rangeQuery({
            ...opts,
            startkey: this.id2str(opts.startkey),
            endkey: this.id2str(opts.endkey),
        })
    }
    public rangeQueryWithKeys(opts: RangeQueryOptsBaseI<KEYT>): Promise<{key: KEYT, val: VALUET}[]> {
        return this.kvs.rangeQueryWithKeys({
            ...opts,
            startkey: this.id2str(opts.startkey),
            endkey: this.id2str(opts.endkey),
        })
        .then(res => {
            return res.map(({key, val}) => ({key: this.str2id(key), val: val}));
        });;
    }
    public set(key: KEYT, val: VALUET): Promise<VALUET> {
        return this.kvs.set(this.id2str(key), val);
    }
    public del(key: KEYT): Promise<VALUET> {
        return this.kvs.del(this.id2str(key));
    }
    public clearDB(): Promise<any> {
        return this.kvs.clearDB();
    }
}

export interface KeyValueStoreFactoryI {
    createKeyValS<VALUET>(valueExample: VALUET): KeyValueStoreI<VALUET>;
    createKeyObjS<OBJT extends KeyValueObj>(): KeyObjStoreI<OBJT>;
}

export type KVSArrayKeyType = (string | number | boolean)[];
// export class KeyValueStoreArrayKeys<VALUET> extends KeyValueStoreBase<KVSArrayKeyType, VALUET> {
export class KeyValueStoreArrayKeys<VALUET> extends KeyValueStoreBase<KVSArrayKeyType, VALUET> {
}

interface RangeQueryOptsBaseI<IDType> {
    /** Get rows with keys in a certain range (inclusive/inclusive). */
    startkey: IDType;
    /** Get rows with keys in a certain range (inclusive/inclusive). */
    endkey: IDType;
    /** Include rows having a key equal to the given options.endkey. */
    inclusive_start?: boolean;
    inclusive_end?: boolean;
    // /** Maximum number of rows to return. */
    // limit?: number;
    // /** Number of rows to skip before returning (warning: poor performance on IndexedDB/LevelDB!). */
    // skip?: number;
    // /** Reverse the order of the output rows. */
    // descending?: boolean;
    // /** Array of keys to fetch in a single shot. */
    // keys?: any[];
}

export interface RangeQueryOptsI extends RangeQueryOptsBaseI<string> { };
export interface RangeQueryOptsArrayKeysI extends RangeQueryOptsBaseI<KVSArrayKeyType> { };

// export interface MapReduceQueryOptions {
//     /** Reduce function, or the string name of a built-in function: '_sum', '_count', or '_stats'. */
//     reduce?: boolean;

//     /** Include the document in each row in the doc field. */
//     include_docs?: boolean;

//     /** Get rows with keys in a certain range (inclusive/inclusive). */
//     startkey?: any;
//     /** Get rows with keys in a certain range (inclusive/inclusive). */
//     endkey?: any;
//     /** Include rows having a key equal to the given options.endkey. */
//     inclusive_start?: boolean;
//     inclusive_end?: boolean;
//     /** Maximum number of rows to return. */
//     limit?: number;
//     /** Number of rows to skip before returning (warning: poor performance on IndexedDB/LevelDB!). */
//     skip?: number;
//     /** Reverse the order of the output rows. */
//     descending?: boolean;
//     /** Only return rows matching this key. */
//     key?: any;
//     /** Array of keys to fetch in a single shot. */
//     keys?: any[];
//     /** True if you want the reduce function to group results by keys, rather than returning a single result. */
//     group?: boolean;
//     /**
//      * Number of elements in a key to group by, assuming the keys are arrays.
//      * Defaults to the full length of the array.
//      */
//     group_level?: number;
//     /**
//      * unspecified (default): Returns the latest results, waiting for the view to build if necessary.
//      * 'ok': Returns results immediately, even if they’re out-of-date.
//      * 'update_after': Returns results immediately, but kicks off a build afterwards.
//      */
//     stale?: 'ok' | 'update_after';
// }
