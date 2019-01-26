/**
 * © 2019 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * https://github.com/vitaly-t/pg-promise/wiki/Common-Mistakes
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str } from "../key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "../domain/key_value_obj";
import * as pgPromise from "pg-promise";
import * as dotenv from "dotenv";
import { AddHocQuery, isExpressionColumn, isSubqueryColumn } from "../domain/metadata/ad_hoc_query";
import { evalExprES5 } from "../map_reduce_utils";
import { ReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFunDefaultValue } from "../domain/metadata/reduce_functions";
const calculateSlot = require('cluster-key-slot');

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db:pgPromise.IDatabase<any>|undefined = undefined;
    private initialized:boolean = false;
    private table_id:string|undefined = undefined;

    constructor(name: string) {
        dotenv.config();
        let config = {
            database: "postgres",
            host: "localhost",
            port: 5432,
            user: "postgres"
        };
        if (KeyValueStorePostgres.db == null) {
            KeyValueStorePostgres.db = pgPromise()( config );
        }

        this.table_id = `f_${calculateSlot(name)}`;
    }

    private async initialize() {
        if (this.initialized == false) {
            try {
                let query:string = 'CREATE TABLE IF NOT EXISTS ' + this.table_id +' (key VARCHAR NOT NULL PRIMARY KEY, val json)';
                await KeyValueStorePostgres.db!.any(query);
            } catch (err) {
                // When 2 or more workers are trying to create table on the same session
                console.log(err);
            }
            this.initialized = true;
        }
    }

    public get(_id: string): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let query: string = 'SELECT val FROM ' + this.table_id + ' WHERE key = $1' ;

                KeyValueStorePostgres.db!.oneOrNone<VALUET>(query, [_id] ).then((res) => {
                    resolve(res != null ? res['val'] : undefined);
                }).catch((err) => {
                    console.log(err);
                })

            })
        });
    }

    /** querying a map-reduce view must return the results ordered by key */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{key: string, val: VALUET}[]> {
        return new Promise((resolve, reject) => {
            this.initialize().then(() => {
                let sign1: string = opts.inclusive_start ? ">=" : ">";
                let sign2: string = opts.inclusive_end ? "<=" : "<";
                let start: string = opts.startkey;
                let end: string = opts.endkey;
                // ISSUE here: cannot handle unicode in select
                end = end.replace(/[\ufff0]/g,'\xff');
                start = start.replace(/[\u00000]/g,'\x01');

                let query: string = 'SELECT key, val FROM ' + this.table_id + ' WHERE key ' + sign1 + ' $1 AND key ' + sign2 + ' $2 ' + ' ORDER BY key';
                KeyValueStorePostgres.db!.any<{key: string, val: VALUET}>(query, [start, end]).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    console.log(err);
                })
            })
        })
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({key, val}) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let object_as_json = JSON.stringify(obj);
                let query: string = 'INSERT INTO ' + this.table_id + ' VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET key=$1, val=$2' ;
                KeyValueStorePostgres.db!.none(query, [_id, object_as_json]).then((res) => {
                    resolve(obj);
                })
            })
        })
    }

    public async del(_id: string): Promise<VALUET> {

        await this.initialize();
        try {
            let ret = await this.get(_id);
            let query: string = 'DELETE FROM ' + this.table_id + ' WHERE  key = $1' ;
            await KeyValueStorePostgres.db!.none(query, [_id ]);
            return ret;
        } catch ( err ) {
            console.log( err );
            throw err;
        }

    }

    public async clearDB() {
        await this.initialize();
        let query: string = 'TRUNCATE TABLE ' + this.table_id;
        await KeyValueStorePostgres.db!.any(query);
    }

    public info(): Promise<string> {
        return new Promise(async (resolve) => {
            resolve("Postgres based KVS");
        })
    }

    public async clearAll() {
        console.log("Droping all tables");
        let query: string = 'DROP SCHEMA public CASCADE;CREATE SCHEMA public;';
        await KeyValueStorePostgres.db!.any(query);
        console.log("Tables droped");
    }
}

export class KeyObjStorePostgres<OBJT extends KeyValueObj> extends KeyValueStorePostgres<OBJT> implements KeyObjStoreI<OBJT> {
    public findByPrefix(prefix: string): Promise<OBJT[]> {
        return this.rangeQuery({ startkey: prefix, endkey: "\ufff0", inclusive_start: true, inclusive_end: false });
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
export class KeyValueStoreFactoryPostgres implements KeyValueStoreFactoryI {
    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStorePostgres<VALUET>(name);
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStorePostgres<OBJT>(name);
    }

    async clearAll() {
        let forCleanup:KeyValueStorePostgres<void> = new KeyValueStorePostgres<void>("cleanup");
        await forCleanup.clearAll();
    }


}
