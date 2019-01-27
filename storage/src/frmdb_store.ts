/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Schema } from "./domain/metadata/entity";
import { DataObj } from "./domain/metadata/data_obj";
import { Form } from "./domain/uimetadata/form";
import { Table } from "./domain/uimetadata/table";
import { MwzEvents } from "./domain/event";
import { KeyObjStoreI, kvsKey2Str } from "./key_value_store_i";
import { KeyValueError } from "./domain/key_value_obj";
import { AddHocQuery, isExpressionColumn, isSubqueryColumn } from "./domain/metadata/ad_hoc_query";
import { SumReduceFunN, CountReduceFunN, TextjoinReduceFunN, ReduceFun, ReduceFunDefaultValue } from "./domain/metadata/reduce_functions";
import { evalExprES5 } from "./map_reduce_utils";
import * as _ from "lodash";

export class FrmdbStore {
    constructor(protected transactionsDB: KeyObjStoreI<MwzEvents>, protected dataDB: KeyObjStoreI<DataObj | Schema | Form | Table>) { }

    /**
     * UI Actions are Events, Events get sent to the Backend and become Transactions, the same domain model object is both Action/Event/Transaction
     * @param event 
     */
    public putTransaction(event: MwzEvents): Promise<MwzEvents> {
        return this.transactionsDB.put(event);
    }

    public getSchema(): Promise<Schema | null> {
        return this.dataDB.get('FRMDB_SCHEMA') as Promise<Schema | null>;
    }
    public putSchema(schema: Schema): Promise<Schema> {
        return this.dataDB.put(schema) as Promise<Schema>;
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
        if (!schema) throw new Error("Attempt to del entity " + entityId +  " from empty schema");
        let ret = schema.entities[entityId];
        if (!ret) throw new Error("Attempt to del non existent entity " + entityId);
        delete schema.entities[entityId];
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => ret);
    }

    public getTable(path: string): Promise<Table | null> {
        return this.dataDB.get('Table_:' + path) as Promise<Table | null>;
    }

    public putTable(table: Table): Promise<Table | null> {
        return this.dataDB.put(table) as Promise<Table | null>;
    }

    public getForm(path: string): Promise<Form | null> {
        return this.dataDB.get('Form_:' + path) as Promise<Form | null>;
    }

    public putForm(form: Form): Promise<Form | null> {
        return this.dataDB.put(form) as Promise<Form | null>;
    }

    public getDataObj(id: string): Promise<DataObj | null> {
        return this.dataDB.get(id);
    }
    
    public getDataListByPrefix(prefix: string): Promise<DataObj[]> {
        return this.dataDB.findByPrefix(prefix);
    }

    public putDataObj(obj: DataObj): Promise<DataObj> {
        return this.dataDB.put(obj);
    }

    public putAllObj(objs: DataObj[]): Promise<(DataObj | KeyValueError)[]> {
        return this.dataDB.putBulk(objs);
    }

    public delDataObj(id: string) {
        return this.dataDB.del(id);
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
        let all = await this.dataDB.all();
        for (let obj of all) {
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
