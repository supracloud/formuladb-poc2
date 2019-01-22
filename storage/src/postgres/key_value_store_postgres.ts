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

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db:pgPromise.IDatabase<any>|undefined = undefined;

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

    public get(_id: string): Promise<VALUET> {
        return new Promise(async (resolve) => {
            try {
                const res = await KeyValueStorePostgres.db!.oneOrNone<VALUET>('SELECT val FROM kvtable WHERE key = $1', [_id] );            
                resolve(res != null ? res : undefined);
            } catch ( err ) {
                console.log( err );
                throw err;
            }
        });
    }

    /** querying a map-reduce view must return the results ordered by key */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{key: string, val: VALUET}[]> {
        return new Promise(async (resolve) => {
            let sign1: string = opts.inclusive_start ? ">=" : ">";
            let sign2: string = opts.inclusive_end ? "<=" : "<";
            let start: string = opts.startkey;
            let end: string = opts.endkey;
            try {
                let query: string = 'SELECT key, val FROM kvtable WHERE key ' + sign1 + ' $1 and key ' + sign2 + ' $2' + ' ORDER BY key';
                const res = await KeyValueStorePostgres.db!.any<{key: string, val: VALUET}>(query, [ start, end ] );            
                resolve(res);
            } catch ( err ) {
                console.log( err );
                throw err;
            }
        });
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({key, val}) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        return new Promise(async (resolve) => {
            try {

                let object_as_json = JSON.stringify(obj);
                await KeyValueStorePostgres.db!.none("INSERT INTO kvtable VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET key=$1, val=$2", [_id, object_as_json]);
                resolve(obj);
            } catch ( err ) {
                console.log( err );
                throw err;
            }
        })
    }

    public async del(_id: string): Promise<VALUET> {

        try {
            let ret = await this.get(_id);
            await KeyValueStorePostgres.db!.none('DELETE FROM kvtable WHERE  key = $1', [ _id ]);
            return ret;
        } catch ( err ) {
            console.log( err );
            throw err;
        }

    }

    public async clearDB() {
        await KeyValueStorePostgres.db!.any(`TRUNCATE TABLE kvtable`);
    }

    public info(): Promise<string> {
        return new Promise(async (resolve) => {
            resolve("in memory test KVS");
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
