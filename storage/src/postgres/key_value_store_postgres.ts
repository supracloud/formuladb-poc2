/**
 * © 2019 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * https://github.com/vitaly-t/pg-promise/wiki/Common-Mistakes
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str, KeyTableStoreI, ScalarType, kvsReduceValues } from "@core/key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError } from "@domain/key_value_obj";
import * as pgPromise from "pg-promise";
import * as dotenv from "dotenv";
import { CreateSqlQuery } from "./create_sql_query";
import { Entity, EntityProperty, Pn, Schema } from "@domain/metadata/entity";
import { waitUntilNotNull } from "@domain/ts-utils";
import { ReduceFun } from "@domain/metadata/reduce_functions";
import { Expression } from "jsep";
import { evalExpression } from "@functions/map_reduce_utils";
import { App } from "@domain/app";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { FrmdbLogger } from "@domain/frmdb-logger";
const calculateSlot = require('cluster-key-slot');
const logger = new FrmdbLogger("kvs:pg");

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db: pgPromise.IDatabase<any> | undefined = undefined;
    private initialized: boolean = false;
    private tableCreated: boolean | null = null
    protected table_id: string | undefined = undefined;
    protected isJSONTable: boolean = true;

    constructor(name: string) {
        dotenv.config();
        let config = {
            database: process.env.PGDATABASE || "postgres",
            host: process.env.PGHOST || "localhost",
            port: parseInt(process.env.PGPORT || "5432"),
            user: process.env.PGUSER || "postgres",
            password: process.env.PGPASSWORD || "postgres",
        
        };
        if (KeyValueStorePostgres.db == null) {
            console.info("Connecting to", config);
            KeyValueStorePostgres.db = pgPromise({pgNative: false})(config);
        }

        this.table_id = this.getTableName(name);
    }

    protected getDB() {
        return KeyValueStorePostgres.db!;
    }

    private getTableName(inputName: string) {
        if (inputName.length >= 62) {
            return `f_${calculateSlot(inputName)}`;
        } else {
            return 't' + inputName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        }
    }

    protected async createTable() {
        try {
            let query: string = 'CREATE TABLE IF NOT EXISTS ' + this.table_id + ' (_id VARCHAR COLLATE "C" NOT NULL PRIMARY KEY, val json)';
            await this.getDB().any(query);
        } catch (err) {
            // When 2 or more workers are trying to create table on the same session
            console.log(err);
        }
    }
    protected async initialize() {
        if (this.initialized == false) {
            this.initialized = true;
            await this.createTable();
            this.tableCreated = true;
        } else {
            await waitUntilNotNull(() => Promise.resolve(this.tableCreated), 50);
        }
    }

    protected getSQL() {
        return 'SELECT val FROM ' + this.table_id + ' WHERE _id = $1';
    }

    public get(_id: string): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let query: string = this.getSQL();

                this.getDB().oneOrNone<VALUET>(query, [this.pgSpecialChars(_id)]).then((res) => {
                    resolve(res != null ? res['val'] : undefined);
                }).catch((err) => {
                    logger.error("%o", err);
                })
            })
        });
    }

    protected rangeSQL(sign1: string, sign2: string) {
        return 'SELECT _id, val FROM ' + this.table_id + 
            ' WHERE _id COLLATE "C" ' + sign1 + ' $1 COLLATE "C" AND _id COLLATE "C" ' + sign2 + ' $2 COLLATE "C" ' + ' ORDER BY _id COLLATE "C"';
    }

    protected pgSpecialChars(str: string) {
        return str.replace(/\ufff0/g, "~~~~~~~~~~~~~");//FIXME: what can we use as +infinity in Postgres ?
    }

    /** querying a map-reduce view must return the results ordered by _id */
    public rangeQueryWithKeys(opts: RangeQueryOptsI): Promise<{ _id: string, val: VALUET }[]> {
        return new Promise((resolve, reject) => {
            this.initialize().then(() => {
                let sign1: string = opts.inclusive_start ? ">=" : ">";
                let sign2: string = opts.inclusive_end ? "<=" : "<";
                let start: string = this.pgSpecialChars(opts.startkey);
                let end: string = this.pgSpecialChars(opts.endkey);
                

                let query: string = this.rangeSQL(sign1, sign2);
                this.getDB().any<{ _id: string, val: VALUET }>(query, [start, end]).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    console.log(err);
                })
            })
        })
    }

    public rangeQuery(opts: RangeQueryOptsI): Promise<VALUET[]> {
        return this.rangeQueryWithKeys(opts)
            .then(res => res.map(({ _id, val }) => val));
    }

    public set(_id: string, obj: VALUET): Promise<VALUET> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let escapedId = this.pgSpecialChars(_id);
                let object_as_json = JSON.stringify(obj);
                let query: string = 'INSERT INTO ' + this.table_id + ' VALUES($1, $2) ON CONFLICT (_id) DO UPDATE SET _id=$1, val=$2';
                this.getDB().none(query, [escapedId, object_as_json]).then(() => {
                    resolve(obj);
                })
            })
        })
    }

    public async del(_id: string): Promise<VALUET> {

        await this.initialize();
        try {
            let ret = await this.get(_id);
            let query: string = 'DELETE FROM ' + this.table_id + ' WHERE  _id = $1';
            await this.getDB().none(query, [_id]);
            return ret;
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    public async clearDB() {
        await this.initialize();
        let query: string = 'TRUNCATE TABLE ' + this.table_id;
        await this.getDB().any(query);
    }

    public info(): Promise<string> {
        return new Promise(async (resolve) => {
            resolve("Postgres based KVS");
        })
    }

    public async clearAll() {
        console.log("Droping all tables");
        let query: string = 'DROP SCHEMA public CASCADE;CREATE SCHEMA public;';
        await this.getDB().any(query);
        console.log("Tables droped");
    }

    protected allSQL() {
        return 'SELECT val FROM ' + this.table_id;
    }

    all(): Promise<VALUET[]> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let query: string = this.allSQL();

                this.getDB().any<VALUET>(query).then((res) => {
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

export class KeyTableStorePostgres<OBJT extends KeyValueObj> extends KeyObjStorePostgres<OBJT> implements KeyTableStoreI<OBJT> {
    private sqlQueryCreator = new CreateSqlQuery();

    constructor(public entity: Entity) {
        super(entity._id);
    }

    init(): Promise<any> {
        return this.initialize();
    }

    protected getSQL() {
        return `SELECT json_strip_nulls(row_to_json(t)) as val FROM (SELECT * FROM ${this.table_id} WHERE _id = $1) t`;
    }

    protected allSQL() {
        return `SELECT json_strip_nulls(row_to_json(t)) as val FROM (SELECT * FROM ${this.table_id} ) t`;
    }

    protected rangeSQL(sign1: string, sign2: string) {
        return 'SELECT t._id as _id, json_strip_nulls(row_to_json(t)) as val FROM (SELECT * FROM ' + this.table_id + 
            ' WHERE _id COLLATE "C" ' + sign1 + ' $1 COLLATE "C" AND _id COLLATE "C" ' + sign2 + ' $2 COLLATE "C" ' + ') t ORDER BY _id COLLATE "C"';
    }

    propsNoId(): EntityProperty[] {
        return Object.values(this.entity.props).filter(p => p.name !== '_id');
    }

    public set(_id: string, obj: OBJT): Promise<OBJT> {
        return new Promise((resolve) => {
            this.initialize().then(() => {
                let props = Object.values(this.entity.props);
                let query: string = `INSERT INTO ${this.table_id} (
                    ${props.map(p => p.name).join(", ")}
                ) VALUES (
                    ${props.map((p, i) => '$' + (1+i))}
                ) ON CONFLICT (_id) DO UPDATE SET 
                    ${this.propsNoId().map((p, i) => p.name + '=$' + (1 + props.length + i)).join(", ")}
                `;
                let values = Object.values(this.entity.props)
                    .map(p => p.name === '_id' ? this.pgSpecialChars(obj[p.name]) : obj[p.name])
                    .concat(this.propsNoId().map(p => obj[p.name]))
                ;
                this.getDB().none(query, values).then((res) => {
                    resolve(obj);
                })
            })
        })
    }

    private prop2sqlCol(prop: EntityProperty): string {
        let type: string;
        switch (prop.propType_) {
            case Pn.STRING:
                type = "varchar";
                break;
            case Pn.NUMBER:
                type = "numeric(12,5)";
                break;
            case Pn.FORMULA:
                //FIXME: implement proper type system
                if (prop.formula.match(/SUM|COUNT|[-]|[+]/) != null) {
                    type = "numeric(12,5)";
                } else {
                    type = "varchar";
                }
                break;
            default: 
                type = "varchar";
        }
        if (prop.name === '_id') type = type + ' COLLATE "C" NOT NULL PRIMARY KEY';
        return prop.name + ' ' + type;
    }

    protected async createTable() {
        let entity = this.entity;
        let query: string = `
            CREATE TABLE IF NOT EXISTS ${this.table_id} (
                ${Object.values(entity.props).map(p => this.prop2sqlCol(p)).join(",\n")}
            )`;
        await this.getDB().any(query);
    }

    public async simpleAdHocQuery(squery: SimpleAddHocQuery): Promise<any[]> {
        await this.initialize();
        let query = this.sqlQueryCreator.createSqlQuery(this.table_id!, squery);

        //FIXME: why ag-grid sends _id_1, or errors_1, invetigate why ?!?!
        let regex = new RegExp("\\b(" + Object.values(this.entity.props).map(p => p.name).join('|') + ")_1\\b", "g");
        let res = await this.getDB().any(query.replace(regex, (match, $1) => $1));
        return res;
    }

    //TODO: implement using SQL and plv8
    async mapQuery(keyExpr: Expression[], opts: RangeQueryOptsI): Promise<OBJT[]> {
        let all = await this.all();
        let ret = all.map(x => {
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

        return Promise.resolve(ret);
    }

    //TODO: implement using SQL and plv8
    reduceQuery(keyExpr: Expression[], opts: RangeQueryOptsI, valueExpr: Expression, reduceFun: ReduceFun): Promise<ScalarType> {
        return this.mapQuery(keyExpr, opts)
            .then(rows => rows.map(r => evalExpression(r, valueExpr)))
            .then(values => kvsReduceValues(values, reduceFun, this.entity._id, false));
    }

}
export class KeyValueStoreFactoryPostgres implements KeyValueStoreFactoryI {
    readonly name = "KeyValueStoreFactoryPostgres";
    
    createKeyValS<VALUET>(name: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStorePostgres<VALUET>(name);
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStorePostgres<OBJT>(name);
    }

    createKeyTableS<OBJT extends KeyValueObj>(entity: Entity): KeyTableStoreI<OBJT> {
        return new KeyTableStorePostgres<OBJT>(entity);
    }

    async clearAll() {
        let forCleanup: KeyValueStorePostgres<void> = new KeyValueStorePostgres<void>("cleanup");
        await forCleanup.clearAll();
    }

    
    metadataKOS: KeyObjStoreI<App | Schema>;
    private getMetadataKOS() {
        if (!this.metadataKOS) {
            this.metadataKOS = new KeyObjStorePostgres<App | Schema>('metadata');
        }
        return this.metadataKOS;
    }
    async getAllApps(): Promise<App[]> {
        return this.getMetadataKOS().findByPrefix('App~~') as Promise<App[]>;
    }
    async putApp(app: App): Promise<App> {
        return this.getMetadataKOS().put(app) as Promise<App>;
    }
    async putSchema(schema: Schema): Promise<Schema> {
        return this.getMetadataKOS().put(schema) as Promise<Schema>;
    }
    async getSchema(schemaId: string): Promise<Schema> {
        return this.getMetadataKOS().get(schemaId) as Promise<Schema>;
    }
}
