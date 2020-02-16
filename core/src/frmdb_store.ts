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
import { I18nStore } from "./i18n-store";

export class FrmdbStore {
    private transactionsDB: KeyObjStoreI<MwzEvents>;
    protected dataKVSMap: Map<string, KeyTableStoreI<DataObj>> = new Map();
    i18nStore: I18nStore;

    constructor(public tenantName: string, public appName: string, public kvsFactory: KeyValueStoreFactoryI, public schema: Schema) {
        this.i18nStore = new I18nStore(this);
    }

    public async init(schema: Schema) {
        let kvsList = await Promise.all(Object.keys(this.schema.entities).map(entityId => this.getDataKvs(entityId)));
        return Promise.all(kvsList.map(kvs => kvs.init()));
    }

    private async getTransactionsDB() {
        if (!this.transactionsDB) {
            this.transactionsDB = await this.kvsFactory.createKeyObjS<MwzEvents>('transaction');
        }
        return this.transactionsDB;
    }

    private async getDataKvs(entityId: string) {
        let ret = this.dataKVSMap.get(entityId);
        if (!ret) {
            let entity = this.kvsFactory.metadataStore.getDefaultEntity(this.tenantName, this.appName, entityId) 
                || this.schema.entities[entityId];
            if (!entity) {
                console.error("getDataKvs unknown entity " + entityId, this.schema.entities);
                throw new Error("getDataKvs unknown entity " + entityId);
            }

            ret = await this.kvsFactory.createKeyTableS<DataObj>(entity);
            this.dataKVSMap.set(entityId, ret);
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

    public async getDataObj(id: string): Promise<DataObj | null> {
        let entityId = parseDataObjId(id).entityId;
        return (await this.getDataKvs(entityId)).get(id);
    }

    public async getDataListByPrefix(prefix: string): Promise<DataObj[]> {
        let entityId = parsePrefix(prefix);
        return (await this.getDataKvs(entityId)).findByPrefix(prefix);
    }

    public async putDataObj(obj: DataObj): Promise<DataObj> {
        let entityId = parseDataObjId(obj._id).entityId;
        return (await this.getDataKvs(entityId)).put(obj);
    }

    public async patchDataObj(obj: DataObj): Promise<DataObj> {
        let existingObj = await this.getDataObj(obj._id) || {_id: obj._id};
        Object.assign(existingObj, obj);
        let entityId = parseDataObjId(obj._id).entityId;
        return (await this.getDataKvs(entityId)).put(existingObj);
    }

    public async putBulk(objs: DataObj[]): Promise<(DataObj | KeyValueError)[]> {
        let objsGroupedByEntity = _.groupBy(objs, (o) => parseDataObjId(o._id).entityId);
        let promises = Object.entries(objsGroupedByEntity).map(async ([entityId, objs]) => {
                let dataKvs = await this.getDataKvs(entityId);
                return dataKvs.putBulk(objs);
            })
        return Promise.all(promises)
            .then(results => _.flatMap(results));
    }

    public async delDataObj(id: string) {
        let entityId = parseDataObjId(id).entityId;
        return (await this.getDataKvs(entityId)).del(id);
    }

    public async getEntity(entityId: string): Promise<Entity | undefined> {
        return Object.values(this.schema.entities).find(e => e._id === entityId);
    }

    public async putEntity(entity: Entity): Promise<Entity> {
        let kvs = await this.getDataKvs(entity._id);
        await kvs.updateEntity(entity);
        let ret = await this.kvsFactory.metadataStore.putEntity(this.tenantName, this.appName, entity);
        this.schema.entities[entity._id] = entity;
        return ret;
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

    public async all(entityId: string): Promise<any[]> {
        return (await this.getDataKvs(entityId)).all();
    }

    public async simpleAdHocQuery(entityId: string, query: SimpleAddHocQuery): Promise<any[]> {
        return (await this.getDataKvs(entityId)).simpleAdHocQuery(query);
    }

    public async mapReduceAdHocQuery(obs: DataObj, map: MapFunctionAndQueryT, reduceFun: ReduceFun) {
        let start = kvsKey2Str(evalExpression({ $ROW$: obs }, map.query.startkeyExpr));
        let end = kvsKey2Str(evalExpression({ $ROW$: obs }, map.query.startkeyExpr));
        let kvs = await this.getDataKvs(map.entityId);
        return kvs.reduceQuery(map.keyExpr, {
            startkey: start,
            endkey: end,
            inclusive_start: map.query.inclusive_start,
            inclusive_end: map.query.inclusive_end,
        }, map.valueExpr, reduceFun);
    }
}
