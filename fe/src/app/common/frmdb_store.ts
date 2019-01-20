/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, EntityProperty, Schema } from "./domain/metadata/entity";
import { DataObj, DataObjDeepPath } from "./domain/metadata/data_obj";
import { Form } from "./domain/uimetadata/form";
import { Table } from "./domain/uimetadata/table";
import { MwzEvents } from "./domain/event";
import { KeyObjStoreI } from "@storage/key_value_store_i";
import { KeyValueError } from "@storage/domain/key_value_obj";

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

    public async putEntity(entity: Entity): Promise<Entity | null> {
        let schema = await this.getSchema();
        if (!schema) throw new Error("Attempt to put entity in an empty schema " + JSON.stringify(entity));
        schema.entities[entity._id] = entity;
        //the Entity's _id is the path
        return this.putSchema(schema)
            .then(x => x ? entity : null);
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

    public delObj(id: string) {
        return this.dataDB.del(id);
    }
}
