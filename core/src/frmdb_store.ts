/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Schema, isEntity } from "@domain/metadata/entity";
import { DataObj, parseDataObjId, parsePrefix } from "@domain/metadata/data_obj";
import { MwzEvents } from "@domain/event";
import { KeyObjStoreI, kvsKey2Str, KeyValueStoreFactoryI, KeyTableStoreI, RangeQueryOptsArrayKeysI } from "@storage/key_value_store_i";
import { KeyValueError } from "@domain/key_value_obj";
import { SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFun, ReduceFunDefaultValue } from "@domain/metadata/reduce_functions";
import { evalExpression } from "@functions/map_reduce_utils";
import * as _ from "lodash";
import { CircularJSON } from "@domain/json-stringify";

import { MapFunction, MapFunctionAndQueryT } from "@domain/metadata/execution_plan";
import { $User, $Dictionary } from "@domain/metadata/default-metadata";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { MetadataStoreI } from "@storage/metadata-store-i";

export class FrmdbStore {
    private transactionsDB: KeyObjStoreI<MwzEvents>;
    protected dataKVSMap: Map<string, KeyTableStoreI<DataObj>> = new Map();
    metadataStore: MetadataStoreI

    constructor(public tenantName: string, public appName: string, public kvsFactory: KeyValueStoreFactoryI, public schema: Schema) {

    }

    public async init(schema: Schema) {
        await this.putSchema(schema);
        let kvsList = await Promise.all(Object.keys(this.schema.entities).map(entityName => this.getDataKvs(entityName)));
        return Promise.all(kvsList.map(kvs => kvs.init()));
    }

    private async getTransactionsDB() {
        if (!this.transactionsDB) {
            this.transactionsDB = await this.kvsFactory.createKeyObjS<MwzEvents>('transaction');
        }
        return this.transactionsDB;
    }


    private async getDataKvs(entityName: string) {
        let ret = this.dataKVSMap.get(entityName);
        if (!ret) {
            let entity = this.getDefaultEntity(entityName) || this.schema.entities[entityName];
            if (!entity) {
                console.error("getDataKvs unknown entity " + entityName, this.schema.entities);
                throw new Error("getDataKvs unknown entity " + entityName);
            }

            ret = await this.kvsFactory.createKeyTableS<DataObj>(entity);
            this.dataKVSMap.set(entityName, ret);
        }
        return ret;
    }

    /**
     * UI Actions are Events, Events get sent to the Backend and become Transactions, the same domain model object is both Action/Event/Transaction
     * @param event 
     */
    public async putTransaction(event: MwzEvents): Promise<MwzEvents> {
        return (await this.getTransactionsDB()).put(event);
    }

    public async getSchema(schemaId: string): Promise<Schema | null> {
        return this.kvsFactory.metadataStore.getSchema(this.tenantName, this.appName);
    }
    public async putSchema(schema: Schema): Promise<Schema> {
        let ret: Schema = await this.kvsFactory.metadataStore.putSchema(this.tenantName, this.appName, schema);
        Object.assign(this.schema, ret);
        return ret;
    }
    public setSchema(schema: Schema) {
        Object.assign(this.schema, schema);
    }

    public getEntities(): Promise<Entity[]> {
        return this.getSchema(this.schema._id).then(s => s ? Object.values(s.entities) : []);
    }

    private getDefaultEntity(path: string): Entity | null {
        switch(path) {
            case $User._id:
                return $User;
            case $Dictionary._id:
                return $Dictionary;
            default:
                return null;
        }
    }

    public async getEntity(path: string): Promise<Entity | null> {
        let defaultEntity = this.getDefaultEntity(path);
        if (defaultEntity) return Promise.resolve(defaultEntity);

        let schema = await this.getSchema(this.schema._id);
        //the Entity's _id is the path
        return schema ? schema.entities[path] : null;
    }

    public async putEntity(entity: Entity): Promise<Entity> {
        let schema = await this.getSchema(this.schema._id);
        if (!schema) throw new Error("Attempt to put entity in an empty schema " + CircularJSON.stringify(entity));
        schema.entities[entity._id] = entity;
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => entity);
    }

    public async delEntity(entityId: string): Promise<Entity> {
        let schema = await this.getSchema(this.schema._id);
        if (!schema) throw new Error("Attempt to del entity " + entityId + " from empty schema");
        let ret = schema.entities[entityId];
        if (!ret) throw new Error("Attempt to del non existent entity " + entityId);
        delete schema.entities[entityId];
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => ret);
    }

    public async getDataObj(id: string): Promise<DataObj | null> {
        let entityName = parseDataObjId(id).entityName;
        return (await this.getDataKvs(entityName)).get(id);
    }

    public async getDataListByPrefix(prefix: string): Promise<DataObj[]> {
        let entityName = parsePrefix(prefix);
        return (await this.getDataKvs(entityName)).findByPrefix(prefix);
    }

    public async putDataObj(obj: DataObj): Promise<DataObj> {
        let entityName = parseDataObjId(obj._id).entityName;
        return (await this.getDataKvs(entityName)).put(obj);
    }

    public async patchDataObj(obj: DataObj): Promise<DataObj> {
        let existingObj = await this.getDataObj(obj._id) || {_id: obj._id};
        Object.assign(existingObj, obj);
        let entityName = parseDataObjId(obj._id).entityName;
        return (await this.getDataKvs(entityName)).put(existingObj);
    }

    public async putBulk(objs: DataObj[]): Promise<(DataObj | KeyValueError)[]> {
        let objsGroupedByEntity = _.groupBy(objs, (o) => parseDataObjId(o._id).entityName);
        let promises = Object.entries(objsGroupedByEntity).map(async ([entityName, objs]) => {
                let dataKvs = await this.getDataKvs(entityName);
                return dataKvs.putBulk(objs);
            })
        return Promise.all(promises)
            .then(results => _.flatMap(results));
    }

    public async delDataObj(id: string) {
        let entityName = parseDataObjId(id).entityName;
        return (await this.getDataKvs(entityName)).del(id);
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

    public async all(entityName: string): Promise<any[]> {
        return (await this.getDataKvs(entityName)).all();
    }

    public async simpleAdHocQuery(entityName: string, query: SimpleAddHocQuery): Promise<any[]> {
        return (await this.getDataKvs(entityName)).simpleAdHocQuery(query);
    }

    public async mapReduceAdHocQuery(obs: DataObj, map: MapFunctionAndQueryT, reduceFun: ReduceFun) {
        let start = kvsKey2Str(evalExpression({ $ROW$: obs }, map.query.startkeyExpr));
        let end = kvsKey2Str(evalExpression({ $ROW$: obs }, map.query.startkeyExpr));
        let kvs = await this.getDataKvs(map.entityName);
        return kvs.reduceQuery(map.keyExpr, {
            startkey: start,
            endkey: end,
            inclusive_start: map.query.inclusive_start,
            inclusive_end: map.query.inclusive_end,
        }, map.valueExpr, reduceFun);
    }
}
