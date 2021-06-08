/**
 * © 2019 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * https://github.com/vitaly-t/pg-promise/wiki/Common-Mistakes
 */

import { RangeQueryOptsI, KeyValueStoreFactoryI, KeyValueStoreI, KeyObjStoreI, kvsKey2Str, KeyTableStoreI, ScalarType, kvsReduceValues } from "@storage/key_value_store_i";
import * as _ from "lodash";
import { KeyValueObj, KeyValueError, KeyValueObjIdType, _idAsStr } from "@domain/key_value_obj";
import * as pgPromise from "pg-promise";
import * as dotenv from "dotenv";
import { CreateSqlQuery } from "./create_sql_query";
import { Entity, EntityProperty, Pn, Schema } from "@domain/metadata/entity";
import { waitUntil } from "@domain/ts-utils";
import { ReduceFun } from "@domain/metadata/reduce_functions";
import { Expression } from "jsep";
import { evalExpression } from "@functions/map_reduce_utils";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { FrmdbLogger } from "@domain/frmdb-logger";
import { MetadataStore } from "@storage/metadata-store";
import { validateAndCovertObjPropertyType } from "@core/validate-schema-types";
import { getActualType } from "@core/formula_types_utils";
import { isNumericColumnTypes } from "@domain/metadata/types";
const calculateSlot = require('cluster-key-slot');
const logger = new FrmdbLogger("kvs:pg");

const TableMap: Map<string, "initial" | "initializing" | "initialized"> = new Map();

/**
 * Key Value Store with optimistic locking functionality
 */
export class KeyValueStorePostgres<VALUET> implements KeyValueStoreI<VALUET> {

    static db: pgPromise.IDatabase<any> | undefined = undefined;
    static pgp: pgPromise.IMain | undefined = undefined;
    private tableCreated: boolean | null = null
    protected table_id: string;
    protected isJSONTable: boolean = true;

    constructor(name: string, protected desc?: string) {
        dotenv.config();
        let config = {
            database: process.env.PGDATABASE || "postgres",
            host: process.env.PGHOST || "localhost",
            port: parseInt(process.env.PGPORT || "5432"),
            user: process.env.PGUSER || "postgres",
            password: process.env.PGPASSWORD || "postgres",
            max: (process.env.PG_MAX_CONNECTIONS||'').match(/^[0-9]+$/) ? 
                parseInt(process.env.PG_MAX_CONNECTIONS!) : 20
        };
        if (KeyValueStorePostgres.db == null) {
            console.info("Connecting to", config);
            KeyValueStorePostgres.pgp = pgPromise({ pgNative: false });
            KeyValueStorePostgres.db = KeyValueStorePostgres.pgp(config);
        }

        this.table_id = this.getTableName(name);
    }

    public async close() {
        if (KeyValueStorePostgres.pgp != undefined) {
            return KeyValueStorePostgres.pgp.end();
        }
    }

    protected getDB() {
        return KeyValueStorePostgres.db!;
    }

    private getTableName(inputName: string) {
        if (inputName.length >= 62) {
            let hash = (calculateSlot(inputName)).toString(16).padStart(4, '0');
            return `${inputName.substr(0, 58)}${hash}`;
        } else {
            return 't' + inputName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        }
    }

    protected async createTable() {
        try {
            let query: string = 'CREATE TABLE IF NOT EXISTS ' + this.table_id + ' (_id VARCHAR COLLATE "C" NOT NULL PRIMARY KEY, val json)';
            console.log(query);
            await this.getDB().any(query);

            if (this.desc) {
                query = `COMMENT ON TABLE ${this.table_id} IS '${this.desc.replace(/'/g, "''")}';`;
                await this.getDB().any(query);
            }
        } catch (err) {
            // When 2 or more workers are trying to create table on the same session
            console.log(err);
        }
    }
    protected async initialize() {
        let tableState = TableMap.get(this.table_id);
        if (tableState === "initialized") return;
        if (tableState === "initializing") {
            await waitUntil(() => Promise.resolve(TableMap.get(this.table_id) === "initialized"), 2000);
            if (TableMap.get(this.table_id) != "initialized") throw new Error(`Table ${this.table_id} creation timeout`);
        } else {
            TableMap.set(this.table_id, "initializing");
            await this.createTable();
            TableMap.set(this.table_id, "initialized");
        }
    }

    public async checkIfTableExists(): Promise<boolean> {
        let schema = 'public';//TODO: this must be the app name

        return this.getDB().any(`SELECT * FROM information_schema.tables
                WHERE table_name = '${this.table_id}' AND table_schema = '${schema}'`)
            .then((res) => {
                return res[0].table_name == this.table_id;
            }).catch((err) => {
                logger.error("%o", err);
                return false;
            });
    }

    protected getSQL() {
        return 'SELECT val FROM ' + this.table_id + ' WHERE _id = $1';
    }

    public async get(_id: KeyValueObjIdType): Promise<VALUET> {
        await this.initialize();
        try {
            let query: string = this.getSQL();
            let res = await this.getDB().oneOrNone<VALUET>(query, [this.pgSpecialChars(_idAsStr(_id))]);
            return res != null ? res['val'] : undefined;
        } catch (err) {
            console.error(err);
            throw err;
        }
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

    public async set(_id: KeyValueObjIdType, obj: VALUET): Promise<VALUET> {
        await this.initialize();
        try {
            let escapedId = this.pgSpecialChars(_idAsStr(_id));
            let object_as_json = JSON.stringify(obj);
            let query: string = 'INSERT INTO ' + this.table_id + ' VALUES($1, $2) ON CONFLICT (_id) DO UPDATE SET _id=$1, val=$2';
            await this.getDB().none(query, [escapedId, object_as_json]);
            return obj;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    public async del(_id: KeyValueObjIdType): Promise<VALUET> {

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
        return Promise.resolve("Postgres based KVS");
    }

    public async clearAllForTestingPurposes() {
        console.log("Droping all tables");
        let query: string = 'DROP SCHEMA public CASCADE;CREATE SCHEMA public;';
        await this.getDB().any(query);
        TableMap.clear();
        console.log("Tables droped");
    }

    protected allSQL() {
        return 'SELECT val FROM ' + this.table_id;
    }

    async all(): Promise<VALUET[]> {
        await this.initialize();
        let query: string = this.allSQL();
        let res = await this.getDB().any<VALUET>(query);
        return res.map(o => o['val']);
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

    constructor(private schema: Schema, public entity: Entity) {
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

    public async set(_id: KeyValueObjIdType, obj: OBJT): Promise<OBJT> {
        await this.initialize();
        try {
            let props = Object.values(this.entity.props);
            let query: string = `
                INSERT INTO ${this.table_id} (
                    ${props.map(p => p.name).join(", ")}
                ) VALUES (
                    ${props.map((p, i) => '$' + (1 + i))}
                ) ON CONFLICT (_id) DO  
                    ${this.propsNoId().length > 0 ?
                            ' UPDATE SET ' + this.propsNoId().map((p, i) => p.name + '=$' + (1 + props.length + i)).join(", ")
                            : ' NOTHING'
                        }
                `;
            let values = Object.values(this.entity.props)
                .map(p => p.name === '_id' ? this.pgSpecialChars(_idAsStr(obj[p.name])) : obj[p.name])
                .concat(this.propsNoId().map(p => obj[p.name]))
            ;
            await this.getDB().none(query, values)
            return obj;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    private prop2sqlCol(prop: EntityProperty): string {
        let type: string;
        switch (prop.propType_) {
            case Pn.INPUT:
                if (!prop.actualType) throw new Error(`prop ${this.entity._id}.${prop.name} does not have actualType`);
                switch(prop.actualType.name) {
                    case "TextType":
                        type = "varchar";
                        break;
                    case "NumberType":
                        type = "numeric(12,5)";
                        break;
                    case "BooleanType":
                        type = "boolean";
                        break;
                    default:
                        type = "varchar";
                        break;
                }
                break;
            case Pn.HLOOKUP: {
                let actualType = getActualType(this.schema, this.entity._id, prop.name);
                if (!actualType) throw new Error(`could not get actualType for prop ${this.entity._id}.${prop.name} HLOOKUP towards ${prop.referenceToPropertyName}->${prop.referencedPropertyName}`);
                if (actualType.name === "NumberType") {
                    type = "numeric(12,5)";
                } else {
                    type = "varchar";
                }
                break;
            }
            case Pn.SCALAR_FORMULA:
            case Pn.AGGREGATE_FORMULA:
                if (isNumericColumnTypes(prop.returnType_)) {
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
        console.log(query);
        await this.getDB().any(query);
    }

    async updateEntity(entity: Entity) {
        await this.createTable();
        for (let prop of Object.values(entity.props)) {
            if (!this.entity.props[prop.name]) {
                //FIXME: handle column type change not only new columns
                let query = `ALTER TABLE ${this.table_id} ADD COLUMN IF NOT EXISTS ${this.prop2sqlCol(prop)}`;
                await this.getDB().any(query);
            }
        }
        this.entity = entity;
    }

    public async simpleAdHocQuery(squery: SimpleAddHocQuery): Promise<any[]> {
        await this.initialize();
        let query = this.sqlQueryCreator.createSqlQuery(this.table_id!, squery);

        //FIXME: why ag-grid sends _id_1, or errors_1, invetigate why ?!?!
        let regex = new RegExp("\\b(" + Object.values(this.entity.props).map(p => p.name).join('|') + ")_1\\b", "g");
        let res = await this.getDB().any(query.replace(regex, (match, $1) => $1));
        for (let obj of res) {
            //TODO: numbers are returned as text, fix it from the pg driver
            for (let prop of Object.values(this.entity.props)) {
                validateAndCovertObjPropertyType(obj, this.entity, prop.name, obj[prop.name], this.schema);
            }
        }
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
    readonly type = "KeyValueStoreFactoryPostgres";
    metadataStore = new MetadataStore(process.env.FRMDB_ENV_NAME || 'env-not-known', this);

    createKeyValS<VALUET>(name: string, desc: string, valueExample: VALUET): KeyValueStoreI<VALUET> {
        return new KeyValueStorePostgres<VALUET>(name);
    }

    createKeyObjS<OBJT extends KeyValueObj>(name: string): KeyObjStoreI<OBJT> {
        return new KeyObjStorePostgres<OBJT>(name);
    }

    createKeyTableS<OBJT extends KeyValueObj>(schema: Schema, entity: Entity): KeyTableStoreI<OBJT> {
        return new KeyTableStorePostgres<OBJT>(schema, entity);
    }

    async executeBatch(callback: () => Promise<any>): Promise<void> {
        let db = KeyValueStorePostgres.db!;
        if (!db) throw new Error(`not connected to DB yet`);
        return db.tx(dbTransaction => {
            throw new Error(`Cannot use KVS here, because the KVS does not use dbTransaction, 
                it uses db and all operations will run outside the transaction`);
        })
    }

    async clearAllForTestingPurposes() {
        let forCleanup: KeyValueStorePostgres<void> = new KeyValueStorePostgres<void>("cleanup");
        await forCleanup.clearAllForTestingPurposes();
    }

    public async close() {
        let forCleanup: KeyValueStorePostgres<void> = new KeyValueStorePostgres<void>("cleanup");
        return forCleanup.close();
    }

}
