/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str, KeyTableStoreI, ScalarType, kvsReduceValues } from "@storage/key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "@domain/key_value_obj";
import { ReduceFunDefaultValue, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFun } from "@domain/metadata/reduce_functions";
import { Entity, Schema } from "@domain/metadata/entity";
import { Expression } from "jsep";
import { evalExpression } from "@functions/map_reduce_utils";
import { SimpleAddHocQueryFilterItem, AggFunc, SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { MetadataStore } from "@storage/metadata-store";
import { GitStorageMem } from "@storage/git-storage-mem";
import { simpleAdHocQueryOnArrayOfOBjects } from "@core/simple-add-hoc-query";

function simulateIO<T>(x: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(x), Math.random() * 10));
}

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem<VALUET> implements KeyValueStoreI<VALUET> {

    protected db: { [x: string]: VALUET } = {};

    getDB() {return this.db}
    length() {return Object.keys(this.db).length}

    constructor() {
    }

    public async close() {}

    public get(_id: string): Promise<VALUET> {
        return simulateIO(_.cloneDeep(this.db[_id]));
    }

    /** querying a map-reduce view must return the results ordered by _id */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{ _id: string, val: VALUET }[]> {
        let ret = _.entries(this.db).filter(([_id, val]) =>
            (opts.startkey < _id && _id < opts.endkey)
            || (opts.inclusive_start && _id === opts.startkey)
            || (opts.inclusive_end && _id === opts.endkey)
        )
            .sort(([keyA, valA], [keyB, valB]) => {
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            .map(([_id, val]) => ({ _id: _id, val: val }));
        return simulateIO(ret);
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({ _id, val }) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        this.db[_id] = _.cloneDeep(obj);
        return this.get(_id);
    }

    public async del(_id: string): Promise<VALUET> {
        let ret = await this.get(_id);
        delete this.db[_id];
        return simulateIO(ret);
    }

    public async clearDB() {
        this.db = {};
    }

    all(): Promise<VALUET[]> {
        return simulateIO(Object.values(this.db));
    }


    public info(): Promise<string> {
        return simulateIO("in memory test KVS");
    }
}

export class KeyObjStoreMem<OBJT extends KeyValueObj> extends KeyValueStoreMem<OBJT> implements KeyObjStoreI<OBJT> {

    public findByPrefix(prefix: string): Promise<OBJT[]> {
        return this.rangeQuery({ startkey: prefix, endkey: prefix + "\ufff0", inclusive_start: true, inclusive_end: false });
    }
    public put(obj: OBJT): Promise<OBJT> {
        return this.set(obj._id, obj);
    }
    public putBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]> {
        //naive implementation, some databases have specific efficient ways to to bulk insert
        return Promise.all(objs.map(o => this.set(o._id, o)));
    }
    public delBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]> {
        //naive implementation, some databases have specific efficient ways to to bulk delete
        return Promise.all(objs.map(o => this.del(o._id)));
    }
}

export class KeyTableStoreMem<OBJT extends KeyValueObj> extends KeyObjStoreMem<OBJT> implements KeyTableStoreI<OBJT> {

    constructor(public entity: Entity) {
        super();
    }

    init(): Promise<any> {
        return Promise.resolve(); //no-op
    }

    async updateEntity(entity: Entity) {
    }

    public async simpleAdHocQuery(query: SimpleAddHocQuery): Promise<any[]> {
        let { rowGroupCols, groupKeys } = query;
        //First we filter the rows
        let objects: any[] = Object.values(this.db);
        let groupedFiltered = simpleAdHocQueryOnArrayOfOBjects(query, objects);
        return simulateIO(groupedFiltered);
    }

    mapQuery(keyExpr: Expression[], opts: RangeQueryOptsI): Promise<OBJT[]> {
        let ret = _.entries(this.db).map(([_id, x]) => {
            return [kvsKey2Str(evalExpression(x, keyExpr)), x];
        }).filter(([key, val]) =>
            (opts.startkey < key && key < opts.endkey)
            || (opts.inclusive_start && key === opts.startkey)
            || (opts.inclusive_end && key === opts.endkey)
        )
            .sort(([keyA, valA], [keyB, valB]) => {
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            .map(([_id, val]) => val as OBJT);

        return simulateIO(ret);
    }

    reduceQuery(keyExpr: Expression[], opts: RangeQueryOptsI, valueExpr: Expression, reduceFun: ReduceFun): Promise<ScalarType> {
        return this.mapQuery(keyExpr, opts)
            .then(rows => rows.map(r => evalExpression(r, valueExpr)))
            .then(values => kvsReduceValues(values, reduceFun, this.entity._id, false));
    }
}
export class KeyValueStoreFactoryMem implements KeyValueStoreFactoryI {
    readonly type = "KeyValueStoreFactoryMem";
    metadataStore = new MetadataStore('mem', this);

    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStoreMem<VALUET>();
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStoreMem<OBJT>();
    }

    createKeyTableS<OBJT extends KeyValueObj>(entity: Entity): KeyTableStoreI<OBJT> {
        return new KeyTableStoreMem<OBJT>(entity);
    }

    async clearAllForTestingPurposes() {
        // Mem KV store is ephemeral so nothing to clear
    };

    public async close() {}
    
}
