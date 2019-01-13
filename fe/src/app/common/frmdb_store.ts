/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { BaseObj, SubObj } from "./domain/base_obj";
import { Entity, EntityProperty, Schema } from "./domain/metadata/entity";
import { DataObj, DataObjDeepPath } from "./domain/metadata/data_obj";
import { Form } from "./domain/uimetadata/form";
import { Table } from "./domain/uimetadata/table";
import { MwzEvents } from "./domain/event";
import { KeyValueStoreBase } from "./key_value_store_i";
import { KeyValueError, IdRevObj } from "./domain/key_value_obj";

export class FrmdbStore {
    constructor(protected transactionsDB: KeyValueStoreBase, protected dataDB: KeyValueStoreBase) { }

    /**
     * UI Actions are Events, Events get sent to the Backend and become Transactions, the same domain model object is both Action/Event/Transaction
     * @param event 
     */
    public putTransaction(event: MwzEvents): Promise<MwzEvents> {
        return this.transactionsDB.put(event);
    }

    public getSchema(): Promise<Schema> {
        return this.getObj('FRMDB_SCHEMA');
    }
    public setSchema(schema: Schema): Promise<Schema> {
        return this.setObj(schema);
    }

    public getEntities(): Promise<Entity[]> {
        return this.getSchema().then(s => Object.values(s.entities));
    }

    public async getEntity(path: string): Promise<Entity> {
        let schema = await this.getSchema();
        //the Entity's _id is the path
        return schema.entities[path];
    }

    public getTable(path: string): Promise<Table> {
        return this.getObj('Table_:' + path);
    }

    public getForm(path: string): Promise<Form> {
        return this.getObj('Form_:' + path);
    }

    public getDataObj(id: string): Promise<DataObj> {
        return this.getObj(id);
    }

    protected getObj<T extends BaseObj>(id: string): Promise<T> {
        return this.dataDB.get(id);
    }

    public setObj<T extends BaseObj>(obj: T): Promise<T> {
        return this.dataDB.put(obj);
    }
    
    public putAllObj<T extends BaseObj>(objs: T[]): Promise<(T | KeyValueError)[]> {
        return this.dataDB.putAll(objs);
    }

    public forcePutForTestingPurposes<T extends BaseObj>(obj): Promise<T> {
        return this.dataDB.forcePut(obj);
    }
}
