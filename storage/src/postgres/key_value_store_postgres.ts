/**
 * © 2019 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * https://github.com/vitaly-t/pg-promise/wiki/Common-Mistakes
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI } from "../key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "../domain/key_value_obj";
import * as pgPromise from "pg-promise";
import * as dotenv from "dotenv";
// TO BE UPDATED: tables must be reused not recreated on each app restart
const { uniqueNamesGenerator } = require('unique-names-generator');

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db:pgPromise.IDatabase<any>|undefined = undefined;
    private table_id:string|undefined = undefined;

    constructor() {
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
    }

    private async initialize() {
        if (this.table_id == undefined) {
            this.table_id = uniqueNamesGenerator();

            let query: string = 'DROP TABLE ' + this.table_id;
            try {
                await KeyValueStorePostgres.db!.any(query);
            } catch(err) { }
            query = 'CREATE TABLE ' + this.table_id +' (key VARCHAR NOT NULL PRIMARY KEY, val json)';
            await KeyValueStorePostgres.db!.any(query);
        }
    }

    public get(_id: string): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                console.log("get ", _id);
                let query: string = 'SELECT val FROM ' + this.table_id + ' WHERE key = $1' ;

                KeyValueStorePostgres.db!.oneOrNone<VALUET>(query, [_id] ).then((res) => {
                    // Another issue here: res comes as JSON/object
                    resolve(res != null ? res : undefined);
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
                let query: string = 'SELECT key, val FROM ' + this.table_id + ' WHERE key ' + sign1 + ' $1 AND key ' + sign2 + ' $2 ' + ' ORDER BY key';
                KeyValueStorePostgres.db!.any<{key: string, val: VALUET}>(query, [start, end]).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    console.log(err.message);
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
        objs.forEach(o => this.set(o._id, o));
        return new Promise(async (resolve) => {
            resolve(objs);
        })
    }
    public delBulk(objs: OBJT[]): Promise<(OBJT | KeyValueError)[]> {
        //naive implementation, some databases have specific efficient ways to to bulk delete
        objs.forEach(o => this.del(o._id));
        return new Promise(async (resolve) => {
            resolve(objs);
        })
    }
}
export class KeyValueStoreFactoryPostgres implements KeyValueStoreFactoryI {
    createKeyValS<VALUET>(valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStorePostgres<VALUET>();
    }

    createKeyObjS<OBJT extends KeyValueObj>(): KeyObjStoreI<OBJT> {
        return new KeyObjStorePostgres<OBJT>();
    }
}
