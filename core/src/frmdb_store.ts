/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Schema, isEntity } from "@core/domain/metadata/entity";
import { DataObj, parseDataObjId, parsePrefix } from "@core/domain/metadata/data_obj";
import { Form } from "@core/domain/uimetadata/form";
import { Table } from "@core/domain/uimetadata/table";
import { MwzEvents } from "@core/domain/event";
import { KeyObjStoreI, kvsKey2Str, KeyValueStoreFactoryI, SimpleAddHocQuery, KeyTableStoreI } from "./key_value_store_i";
import { KeyValueError } from "@core/domain/key_value_obj";
import { AddHocQuery, isExpressionColumn, isSubqueryColumn } from "@core/domain/metadata/ad_hoc_query";
import { SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFun, ReduceFunDefaultValue } from "@core/domain/metadata/reduce_functions";
import { evalExprES5 } from "./map_reduce_utils";
import * as _ from "lodash";

export class FrmdbStore {
    private transactionsDB: KeyObjStoreI<MwzEvents>;
    protected metadataKvs: KeyObjStoreI<Schema | Form | Table>;
    protected dataKVSMap: Map<string, KeyTableStoreI<DataObj>> = new Map();

    constructor(public kvsFactory: KeyValueStoreFactoryI, public schema: Schema) {

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

    private async getMetadataKvs() {
        if (!this.metadataKvs) {
            this.metadataKvs = await this.kvsFactory.createKeyObjS<Schema | Form | Table>('metadata');
        }
        return this.metadataKvs;
    }

    private async getDataKvs(entityName: string) {
        let ret = this.dataKVSMap.get(entityName);
        if (!ret) {
            let entity = this.schema.entities[entityName];
            if (!entity) throw new Error("getDataKvs unknown entity " + entityName);

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

    public async getSchema(): Promise<Schema | null> {
        return (await this.getMetadataKvs()).get('FRMDB_SCHEMA') as Promise<Schema | null>;
    }
    public async putSchema(schema: Schema): Promise<Schema> {
        let ret: Schema = await (await this.getMetadataKvs()).put(schema) as Schema;
        this.schema = ret;
        return ret;
    }
    public setSchema(schema: Schema) {
        this.schema = schema;
    }

    public getEntities(): Promise<Entity[]> {
        return this.getSchema().then(s => s ? Object.values(s.entities) : []);
    }

    public async getEntity(path: string): Promise<Entity | null> {
        let schema = await this.getSchema();
        //the Entity's _id is the path
        return schema ? schema.entities[path] : null;
    }

    public async putEntity(entity: Entity): Promise<Entity> {
        let schema = await this.getSchema();
        if (!schema) throw new Error("Attempt to put entity in an empty schema " + JSON.stringify(entity));
        schema.entities[entity._id] = entity;
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => entity);
    }

    public async delEntity(entityId: string): Promise<Entity> {
        let schema = await this.getSchema();
        if (!schema) throw new Error("Attempt to del entity " + entityId + " from empty schema");
        let ret = schema.entities[entityId];
        if (!ret) throw new Error("Attempt to del non existent entity " + entityId);
        delete schema.entities[entityId];
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => ret);
    }

    public async getTable(path: string): Promise<Table | null> {
        return (await this.getMetadataKvs()).get('Table_:' + path) as Promise<Table | null>;
    }

    public async putTable(table: Table): Promise<Table | null> {
        return (await this.getMetadataKvs()).put(table) as Promise<Table | null>;
    }

    public async getForm(path: string): Promise<Form | null> {
        return (await this.getMetadataKvs()).get('Form_:' + path) as Promise<Form | null>;
    }

    public async putForm(form: Form): Promise<Form | null> {
        return (await this.getMetadataKvs()).put(form) as Promise<Form | null>;
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

    public async adHocQuery(entityName: string, query: AddHocQuery): Promise<any[]> {
        //First we filter the rows
        let filteredObjs: any[] = [];
        let all = await this.all(entityName);
        for (let obj of all) {
            let filteredObj: any = _.cloneDeep(obj);
            for (let col of query.extraColsBeforeGroup) {
                if (isSubqueryColumn(col)) {
                    let val = await this.adHocQuery(entityName, col.subquery);
                    //TODO: check that the return of the subquery is a scalar value: string | number | boolean
                    filteredObj[col.alias] = val[0][col.subquery.returnedColumns[0] + ''];
                }
            }

            for (let col of query.extraColsBeforeGroup) {
                if (isExpressionColumn(col)) {
                    let x = evalExprES5(filteredObj, col.expr);
                    filteredObj[col.alias] = col.expr instanceof Array ? kvsKey2Str(x) : x;
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

            return Promise.resolve(groupedFiltered);
        } else return Promise.resolve(filteredObjs);
    }
}
