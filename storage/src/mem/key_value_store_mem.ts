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
import { App } from "@domain/app";
import { FilterItem, AggFunc, SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { Page } from "@domain/uimetadata/page";

function simulateIO<T>(x: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(x), Math.random() * 10));
}

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStoreMem<VALUET> implements KeyValueStoreI<VALUET> {

    protected db: { [x: string]: VALUET } = {};

    constructor() {
    }

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

    public evalNumberFilter(val, item: FilterItem): boolean {
        switch (item.type) {
            case 'equals':
                return val == item.filter;
            case 'notEqual':
                return val != item.filter;
            case 'greaterThan':
                return val > item.filter;
            case 'greaterThanOrEqual':
                return val >= item.filter;
            case 'lessThan':
                return val < item.filter;
            case 'lessThanOrEqual':
                return val <= item.filter;
            case 'inRange':
                return val >= item.filter && val <= item.filterTo!;
            default:
                throw new Error('unknown number filter type: ' + item.type);
        }
    }

    public evalTextFilter(val: string, item: FilterItem): boolean {
        switch (item.type) {
            case 'equals':
                return val == item.filter;
            case 'notEqual':
                return val != item.filter;
            case 'contains':
                return val.indexOf(item.filter) >= 0;
            case 'notContains':
                return val.indexOf(item.filter) < 0;
            case 'startsWith':
                return val.startsWith(item.filter);
            case 'endsWith':
                return val.endsWith(item.filter);
            default:
                throw new Error('unknown text filter type: ' + item.type);
        }
    }
    private evaluateFilter(value: any, filter: FilterItem): boolean {
        switch (filter.filterType) {
            case 'text': return this.evalTextFilter(value, filter);
            case 'number': return this.evalNumberFilter(value, filter);
            default: throw new Error('unknown filter type: ' + filter.filterType);
        }
    }

    private evaluateAggregation(value: any, aggFunc: AggFunc, aggValue: any) {
        switch (aggFunc) {
            case "sum":
                return aggValue + value;
            case "count":
                return aggValue + 1;
            default: throw new Error('unknown agg func: ' + aggFunc);
        }
    }

    public async simpleAdHocQuery(query: SimpleAddHocQuery): Promise<any[]> {
        let { rowGroupCols, groupKeys } = query;
        //First we filter the rows
        let objects: any[] = Object.values(this.db);
        if (objects.length == 0) return [];

        //Then we group them
        if (rowGroupCols.length > groupKeys.length) {
            let rowGroupCol = rowGroupCols[groupKeys.length];
            let grouped = _.groupBy(objects, rowGroupCol.field);

            objects = [];
            for (let [_id, objs] of Object.entries(grouped)) {
                let obj: any = { [rowGroupCol.field]: _id };
                for (let groupAgg of query.valueCols) {
                    obj[groupAgg.field.toLowerCase()] = objs.reduce((agg, currentObj) =>
                        ({
                            [groupAgg.field]: this.evaluateAggregation(currentObj[groupAgg.field], groupAgg.aggFunc, agg[groupAgg.field])
                        })
                    )[groupAgg.field];
                }
                objects.push(obj);
            }
        }

        //Then we filter the groups
        let groupedFiltered: any[] = [];
        for (let obj of objects) {
            let matchesFilter: boolean = true;
            for (let [_id, filter] of Object.entries(query.filterModel)) {
                if (!this.evaluateFilter(obj[_id], filter)) {
                    matchesFilter = false;
                    break;
                }
            }
            if (matchesFilter) groupedFiltered.push(obj);
        }

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

    apps: Map<string, App> = new Map();
    getAllApps(): Promise<App[]> {
        return simulateIO(Array.from(this.apps.values()));
    }

    putApp(app: App): Promise<App> {
        this.apps.set(app._id, app);
        return simulateIO(app);
    }

    schemas: Map<string, Schema> = new Map();
    getSchema(schemaId: string): Promise<Schema | null> {
        return simulateIO(this.schemas.get(schemaId) || null);
    }

    putSchema(schema: Schema): Promise<Schema> {
        this.schemas.set(schema._id, schema);
        return simulateIO(schema);
    }

    pages: Map<string, Page> = new Map();
    getPage(pageId: string): Promise<Page | null> {
        return simulateIO(this.pages.get(pageId) || null);
    }

    putPage(page: Page): Promise<Page> {
        this.pages.set(page._id, page);
        return simulateIO(page);
    }    
}
