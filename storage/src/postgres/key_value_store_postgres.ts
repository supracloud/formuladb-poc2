/**
 * © 2019 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * https://github.com/vitaly-t/pg-promise/wiki/Common-Mistakes
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str, SimpleAddHocQuery } from "@core/key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "@core/domain/key_value_obj";
import * as pgPromise from "pg-promise";
import * as dotenv from "dotenv";
import { ReduceFun, SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, MinReduceFunN, MaxReduceFunN, AvgReduceFunN, FirstReduceFunN, LastReduceFunN } from "@core/domain/metadata/reduce_functions";
const calculateSlot = require('cluster-key-slot');

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db: pgPromise.IDatabase<any> | undefined = undefined;
    private initialized: boolean = false;
    protected table_id: string | undefined = undefined;

    constructor(name: string) {
        dotenv.config();
        let config = {
            database: "postgres",
            host: "localhost",
            port: 5432,
            user: "postgres"
        };
        if (KeyValueStorePostgres.db == null) {
            KeyValueStorePostgres.db = pgPromise()(config);
        }

        this.table_id = `f_${calculateSlot(name)}`;
    }

    private async initialize() {
        if (this.initialized == false) {
            try {
                let query: string = 'CREATE TABLE IF NOT EXISTS ' + this.table_id + ' (key VARCHAR NOT NULL PRIMARY KEY, val json)';
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
                let query: string = 'SELECT val FROM ' + this.table_id + ' WHERE key = $1';

                KeyValueStorePostgres.db!.oneOrNone<VALUET>(query, [_id]).then((res) => {
                    resolve(res != null ? res['val'] : undefined);
                }).catch((err) => {
                    console.log(err);
                })

            })
        });
    }

    /** querying a map-reduce view must return the results ordered by key */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{ key: string, val: VALUET }[]> {
        return new Promise((resolve, reject) => {
            this.initialize().then(() => {
                let sign1: string = opts.inclusive_start ? ">=" : ">";
                let sign2: string = opts.inclusive_end ? "<=" : "<";
                let start: string = opts.startkey;
                let end: string = opts.endkey;
                // ISSUE here: cannot handle unicode in select
                end = end.replace(/[\ufff0]/g, '\xff');
                start = start.replace(/[\u00000]/g, '\x01');

                let query: string = 'SELECT key, val FROM ' + this.table_id + ' WHERE key ' + sign1 + ' $1 AND key ' + sign2 + ' $2 ' + ' ORDER BY key';
                KeyValueStorePostgres.db!.any<{ key: string, val: VALUET }>(query, [start, end]).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    console.log(err);
                })
            })
        })
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({ key, val }) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let object_as_json = JSON.stringify(obj);
                let query: string = 'INSERT INTO ' + this.table_id + ' VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET key=$1, val=$2';
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
            let query: string = 'DELETE FROM ' + this.table_id + ' WHERE  key = $1';
            await KeyValueStorePostgres.db!.none(query, [_id]);
            return ret;
        } catch (err) {
            console.log(err);
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

    all(): Promise<VALUET[]> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let query: string = 'SELECT val FROM ' + this.table_id;

                KeyValueStorePostgres.db!.any<VALUET>(query).then((res) => {
                    resolve(res.map(o => o['val']));
                }).catch((err) => {
                    console.log(err);
                })

            })
        });
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

    private filter2sql(filter: { colName: string, op: string, value: string | number | boolean }): string {
        let colName = this.col2sql(filter.colName);
        let op = filter.op;
        switch (filter.op) {
            case '<':
                colName = '(' + colName + ')::int';
                break;
            case '<=':
                colName = '(' + colName + ')::int';
                break;
            case '>':
                colName = '(' + colName + ')::int';
                break;
            case '>=':
                colName = '(' + colName + ')::int';
                break;
            case '==':
                op = '=';
                break;
        }
        return '(' + colName + " " + op + " "
            + (typeof filter.value === 'string' ? `'${filter.value}'` : '' + filter.value) + ')'
            ;
    }

    private agg2sql(agg: { alias: string, reduceFun: ReduceFun, colName: string }): string {
        let col: string;
        switch (agg.reduceFun.name) {
            case SumReduceFunN:
                col = `SUM((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case CountReduceFunN:
                col = `COUNT((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case TextjoinReduceFunN:
                col = `COUNT((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case MinReduceFunN:
                col = `Min((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case MaxReduceFunN:
                col = `Max((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case AvgReduceFunN:
                col = `Avg((${this.col2sql(agg.colName)})::int)::int`;
                break;
            case FirstReduceFunN:
                col = `First((${this.col2sql(agg.colName)})::int)`;
                break;
            case LastReduceFunN:
                col = `Last((${this.col2sql(agg.colName)})::int)`;
                break;
            default:
                throw new Error('Unknown reduce func in agg2sql ' + JSON.stringify(agg.reduceFun));
        }

        return col + ` as ${agg.alias}`;
    }

    private col2sql(propName: string) {
        return `val->>'${propName}'`;
    }

    public simpleAdHocQuery2SQL(squery: SimpleAddHocQuery): string {
        let simpleCols = _.difference(squery.columns, squery.groupAggs.map(agg => agg.alias)).map(c => this.col2sql(c) + ' as ' + c);
        let sql = `
SELECT ${simpleCols.concat(squery.groupAggs.map(agg => this.agg2sql(agg))).join(', ')} 
FROM ${this.table_id}
WHERE ${squery.whereFilters.map(f => this.filter2sql(f)).join("\n    AND ")}`;

        if (squery.groupColumns.length > 0) {
            sql = sql + `\nGROUP BY ${squery.groupColumns.map(c => this.col2sql(c)).join(", ")}`;
        }

        if (squery.groupFilters.length > 0) {
            sql = sql + `\nHAVING ${squery.groupFilters.map(f => this.filter2sql(f)).join("\n    AND ")}`;
            //FIXME: column aliases cannot be used in HAVING
        }

        if (squery.sortColumns.length > 0) {
            sql = sql + `\nORDER BY ${squery.sortColumns.map(c => this.col2sql(c)).join(", ")}`;

        }

        return sql;
    }

    public async simpleAdHocQuery(squery: SimpleAddHocQuery): Promise<any[]> {
        let query: string = this.simpleAdHocQuery2SQL(squery);
        let res = await KeyValueStorePostgres.db!.any(query);
        return res;
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
        let forCleanup: KeyValueStorePostgres<void> = new KeyValueStorePostgres<void>("cleanup");
        await forCleanup.clearAll();
    }


}
