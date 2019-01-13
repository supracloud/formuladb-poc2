/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueError } from "./domain/key_value_obj";
import * as Collate from 'pouchdb-collate';

/**
 * Key Value Store with optimistic locking functionality
 */
abstract class KeyValueStoreBaseA<IDType> {
    public abstract get<T>(_id: IDType): Promise<T>;
    public abstract rangeQuery<T>(opts: RangeQueryOptsI<IDType>): Promise<T[]>;
    public abstract set<T>(_id: IDType, obj: T): Promise<T>;
    public abstract del<T>(_id: IDType): Promise<T>;
    public put<T extends {_id: IDType}>(obj: T): Promise<T> {
        return this.set(obj._id, obj);
    }
    public putBulk<T extends {_id: IDType}>(objs: T[]): Promise<(T|KeyValueError)[]> {
        //dummy implementation
        objs.forEach(o => this.set(o._id, o));
        return Promise.resolve(objs);
    }
    public delBulk<T extends {_id: IDType}>(objs: T[]): Promise<(T|KeyValueError)[]> {
        //dummy implementation
        objs.forEach(o => this.del(o._id));
        return Promise.resolve(objs);
    }
    public abstract clearDB(): Promise<any>;
}

export abstract class KeyValueStoreBase extends KeyValueStoreBaseA<string> {
    public findByPrefix<T>(prefix: string): Promise<T[]> {
        return this.rangeQuery({startkey: prefix, endkey: "\ufff0", inclusive_start: true, inclusive_end: false});
    }
    
}

export type KVSArrayKeyType = (string | number | boolean)[];
export class KeyValueStoreArrayKeys<KVS extends KeyValueStoreBase> extends KeyValueStoreBaseA<KVSArrayKeyType> {
    constructor(private kvs: KVS) {
        super();
    }

    protected id2str(_id: KVSArrayKeyType): string {
        return Collate.toIndexableString(_id);
    }

    public get<T>(_id: KVSArrayKeyType): Promise<T> {
        return this.kvs.get(this.id2str(_id));
    }
    public rangeQuery<T>(opts: RangeQueryOptsI<(string | number | boolean)[]>): Promise<T[]> {
        return this.kvs.rangeQuery({
            ...opts,
            startkey: this.id2str(opts.startkey),
            endkey: this.id2str(opts.endkey),
        });
    }
    public set<T>(_id: KVSArrayKeyType, obj: T): Promise<T> {
        return this.kvs.set(this.id2str(_id), obj);
    }
    public del<T>(_id: KVSArrayKeyType): Promise<T> {
        return this.kvs.del(this.id2str(_id));
    }
    public clearDB(): Promise<any> {
        return this.kvs.clearDB();
    }

}

export interface RangeQueryOptsI<IDType> {
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
