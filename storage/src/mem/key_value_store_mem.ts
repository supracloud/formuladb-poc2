/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str } from "../key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "../domain/key_value_obj";
import { ReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFunDefaultValue } from "../domain/metadata/reduce_functions";
import { AddHocQuery, isExpressionColumn, isSubqueryColumn } from "../domain/metadata/ad_hoc_query";
import { isExpression } from "jsep";
import { evalExprES5 } from "../map_reduce_utils";

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
        return simulateIO(this.db[_id]);
    }

    /** querying a map-reduce view must return the results ordered by key */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{ key: string, val: VALUET }[]> {
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
            .map(([_id, val]) => ({ key: _id, val: val }));
        return simulateIO(ret);
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({ key, val }) => val));
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

    private evaluateAggregation(value: any, reduceFun: ReduceFun, aggValue: any) {
        switch (reduceFun.name) {
            case SumReduceFunN:
                return aggValue + value;
            case CountReduceFunN:
                return aggValue + 1;
            case TextjoinReduceFunN:
                return aggValue + reduceFun.delimiter + value;
        }

    }

    public async adHocQuery(query: AddHocQuery): Promise<any[]> {
        //First we filter the rows
        let filteredObjs: any[] = [];
        for (let obj of Object.values(this.db)) {
            let filteredObj: any = _.cloneDeep(obj);
            for (let col of query.extraColsBeforeGroup) {
                if (isSubqueryColumn(col)) {
                    let val = await this.adHocQuery(col.subquery);
                    //TODO: check that the return of the subquery is a scalar value: string | number | boolean
                    filteredObj[col.alias] = val[0][col.subquery.returnedColumns[0] + ''];
                }
            }

            for (let col of query.extraColsBeforeGroup) {
                if (isExpressionColumn(col)) {
                    filteredObj[col.alias] = evalExprES5(filteredObj, col.expr);
                }
            }

            let matchesFilter: boolean = true;
            for (let filter of query.filters) {
                if (!evalExprES5(filteredObj, filter)) {
                    matchesFilter = false;
                    break;
                }
            }
            if (matchesFilter) filteredObjs.push(filteredObj);
        }

        if (query.groupColumns && query.groupColumns.length > 0) {
            //Then we group them
            let grouped: any = {};
            for (let obj of filteredObjs) {
                let groupKey: string[] = [];
                let groupObj: any = {};
                for (let group of query.groupColumns) {
                    groupKey.push(obj[group]);
                    groupObj[group] = obj[group];
                }

                let key = kvsKey2Str(groupKey);
                if (grouped[key]) {
                    groupObj = grouped[key];
                } else {
                    grouped[key] = groupObj;
                }

                for (let groupAgg of query.groupAggs) {
                    groupObj[groupAgg.alias] = this.evaluateAggregation(obj[groupAgg.colName], groupAgg.reduceFun,
                        groupObj[groupAgg.alias] || ReduceFunDefaultValue[groupAgg.reduceFun.name]);
                }
            }

            //Then we filter the groups
            let groupedFiltered: any[] = [];
            for (let obj of Object.values(grouped)) {

                for (let col of query.returnedColumns) {
                    if (isExpressionColumn(col)) {
                        obj[col.alias] = evalExprES5(obj, col.expr);
                    }
                }

                let matchesFilter: boolean = true;
                for (let filter of query.groupFilters) {
                    if (!evalExprES5(obj, filter)) {
                        matchesFilter = false;
                        break;
                    }
                }
                if (matchesFilter) groupedFiltered.push(obj);
            }

            return simulateIO(groupedFiltered);
        } else return simulateIO(filteredObjs);

    }
}
export class KeyValueStoreFactoryMem implements KeyValueStoreFactoryI {
    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStoreMem<VALUET>();
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStoreMem<OBJT>();
    }

    async clearAll() {
        // Mem KV store is ephemeral so nothing to clear
    };
}
