/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueError, KeyValueObj } from "@core/domain/key_value_obj";
import * as FormuladbCollate from './utils/collator';
import { Entity } from "./domain/metadata/entity";

type NumberFilterT = 'equals' | 'notEqual' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'inRange';
type TextFilterT = 'equals' | 'notEqual' | 'contains' | 'notContains' | 'startsWith' | 'endsWith';

export interface FilterItem {
    filterType: 'text' | 'number';
    type: NumberFilterT | TextFilterT;
    filter: string;
    filterTo?: string;
}

export interface SimpleAddHocQuery {
    startRow: number;
    endRow: number;
    rowGroupCols: {field: string}[];
    valueCols: ColumnParams[];
    pivotCols: ColumnParams[];
    pivotMode: boolean;
    groupKeys: string[];
    filterModel: {[x: string]: FilterItem};
    sortModel: any;
}
export type AggFunc = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'first' | 'last';
export interface ColumnParams {
    field: string;
    aggFunc: AggFunc;
}

export interface QueryRequest {
    startRow: number;
    endRow: number;
    rowGroupCols: ColumnParams[];
    valueCols: ColumnParams[];
    pivotCols: ColumnParams[];
    pivotMode: boolean;
    groupKeys: string[];
    filterModel: any;
    sortModel: SortModel[];
}

export interface SortModel {
    colId: string,
    sort: 'asc' | 'desc',
}

export interface KeyValueStoreI<VALUET> {
    get(_id: string): Promise<VALUET | null>;
    /** The resulting rows are sorted by _id */
    rangeQuery(opts: RangeQueryOptsBaseI<string>): Promise<VALUET[]>;
    /** The resulting rows are sorted by _id */
    rangeQueryWithKeys(opts: RangeQueryOptsBaseI<string>): Promise<{_id: string, val: VALUET}[]>;
    set(_id: string, val: VALUET): Promise<VALUET>;
    del(_id: string): Promise<VALUET>;
    clearDB(): Promise<any>;
    all(): Promise<VALUET[]>;
}

export interface KeyObjStoreI<OBJT extends KeyValueObj> extends KeyValueStoreI<OBJT> {
    findByPrefix(prefix: string): Promise<OBJT[]>;
    put(obj: OBJT): Promise<OBJT>;
    putBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]>;
    delBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]>;
}
export interface KeyTableStoreI<OBJT extends KeyValueObj> extends KeyObjStoreI<OBJT> {
    entity: Entity;
    /** filtering and grouping by any _id */
    simpleAdHocQuery(params: SimpleAddHocQuery): Promise<any[]>;
}

export function kvsKey2Str(_id: any): string {
    return FormuladbCollate.toIndexableString(_id);
}
export function kvsStr2Key(_id: string): any {
    return FormuladbCollate.parseIndexableString(_id);
}

class KeyValueStoreBase<KEYT, VALUET> {
    constructor(protected kvs: KeyValueStoreI<VALUET>) {
    }

    public id2str(_id: KEYT): string {
        return kvsKey2Str(_id);
    }

    public str2id(_id: string): KEYT {
        return kvsStr2Key(_id);
    }

    public get(_id: KEYT): Promise<VALUET | null> {
        return this.kvs.get(this.id2str(_id));
    }
    public rangeQuery(opts: RangeQueryOptsBaseI<KEYT>): Promise<VALUET[]> {
        return this.kvs.rangeQuery({
            ...opts,
            startkey: this.id2str(opts.startkey),
            endkey: this.id2str(opts.endkey),
        })
    }
    public rangeQueryWithKeys(opts: RangeQueryOptsBaseI<KEYT>): Promise<{_id: KEYT, val: VALUET}[]> {
        return this.kvs.rangeQueryWithKeys({
            ...opts,
            startkey: this.id2str(opts.startkey),
            endkey: this.id2str(opts.endkey),
        })
        .then(res => {
            return res.map(({_id, val}) => ({_id: this.str2id(_id), val: val}));
        });;
    }
    public set(_id: KEYT, val: VALUET): Promise<VALUET> {
        return this.kvs.set(this.id2str(_id), val);
    }
    public del(_id: KEYT): Promise<VALUET> {
        return this.kvs.del(this.id2str(_id));
    }
    public clearDB(): Promise<any> {
        return this.kvs.clearDB();
    }
}

export interface KeyValueStoreFactoryI {
    name: "KeyValueStoreFactoryMem" | "KeyValueStoreFactoryPostgres";
    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET>;
    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT>;
    createKeyTableS<OBJT extends KeyValueObj>(entity: Entity): KeyTableStoreI<OBJT>;
    clearAll(): Promise<void>;
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
    /** Include rows having a _id equal to the given options.endkey. */
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
//     /** Include rows having a _id equal to the given options.endkey. */
//     inclusive_start?: boolean;
//     inclusive_end?: boolean;
//     /** Maximum number of rows to return. */
//     limit?: number;
//     /** Number of rows to skip before returning (warning: poor performance on IndexedDB/LevelDB!). */
//     skip?: number;
//     /** Reverse the order of the output rows. */
//     descending?: boolean;
//     /** Only return rows matching this _id. */
//     _id?: any;
//     /** Array of keys to fetch in a single shot. */
//     keys?: any[];
//     /** True if you want the reduce function to group results by keys, rather than returning a single result. */
//     group?: boolean;
//     /**
//      * Number of elements in a _id to group by, assuming the keys are arrays.
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
