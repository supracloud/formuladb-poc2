import { BaseObj, SubObj } from "./domain/base_obj";
import { Entity, EntityProperty, ReferencedEntity } from "./domain/metadata/entity";
import { DataObj } from "./domain/metadata/data_obj";
import { Form } from "./domain/uimetadata/form";
import { Table } from "./domain/uimetadata/table";
import { MwzEvents } from "./domain/event";
import { KeyValueStore } from "./key_value_store";

export class FrmdbStore {
    constructor(protected transactionsDB: KeyValueStore, protected historyDB: KeyValueStore) { }

    /**
     * UI Actions are Events, Events get sent to the Backend and become Transactions, the same domain model object is both Action/Event/Transaction
     * @param event 
     */
    public setTransaction(event: MwzEvents): Promise<MwzEvents> {
        return this.transactionsDB.put(event);
    }

    public queryWithDeepPath(deepPath: string): Promise<SubObj[]> {
        throw new Error('queryWithDeepPath not implemented yet!');
    }

    public findByType<T extends BaseObj>(type_: string): Promise<T[]> {
        return this.historyDB.findByType(type_);
    }

    public getEntity(path: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.getObj(path);
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

    public getObj<T extends BaseObj>(id: string): Promise<T> {
        return this.historyDB.get(id);
    }

    public setObj<T extends BaseObj>(obj: T): Promise<T> {
        //TODO: implement transaction pre-emptying ,transaction life-cycle, etc
        return this.historyDB.put(obj);
    }

    public forPutForTestingPurposes<T extends BaseObj>(obj): Promise<T> {
        return this.historyDB.forcePut(obj);
    }
}
