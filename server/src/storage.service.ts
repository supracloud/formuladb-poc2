import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
PouchDB.debug.enable('*');

import { v4 as uuid } from 'uuid';
import * as dateFormat from 'dateformat';

import { BaseObj } from "../../src/app/domain/base_obj";
import { Entity, EntityProperty } from "../../src/app/domain/metadata/entity";
import { DataObj } from "../../src/app/domain/metadata/data_obj";
import { Form } from "../../src/app/domain/uimetadata/form";
import { Table } from "../../src/app/domain/uimetadata/table";
import { MwzEvents } from "../../src/app/domain/event";

import { KeyValueStore } from "../../src/app/keyValueStore";

/**
 * The storage for the Formula Engine is a king of JSON version control system built on top of a Key Value Store
 * all operations are relative to a transaction id, when a transaction is evaluated the engine "sees" only data as it existed when the transaction started
 */
export class StorageService {

    private transactionsDB: KeyValueStore;
    private historyDB: KeyValueStore;

    constructor() {
        this.transactionsDB = new KeyValueStore(new PouchDB("http://localhost:5984/mwztransactions"));
        this.historyDB = new KeyValueStore(new PouchDB("http://localhost:5984/mwzhistory"));
    }

    public startTransaction(event: MwzEvents): Promise<MwzEvents> {
        event._id = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss-l') + '-' + uuid() + '=' + event.clientId_;
        return this.transactionsDB.put(event);
    }

    public setTransaction(event: MwzEvents): Promise<MwzEvents> {
        return this.transactionsDB.put(event);
    }

    public getEntityForTr(path: string, trId: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.getObjForTr(path, trId);
    }

    public getTableForTr(path: string, trId: string): Promise<Table> {
        return this.getObjForTr('Table_:' + path, trId);
    }

    public getFormForTr(path: string, trId: string): Promise<Form> {
        return this.getObjForTr('Form_:' + path, trId);
    }

    public getDataObjForTr(id: string, trId: string): Promise<DataObj> {
        return this.getObjForTr(id, trId);
    }

    public getObjForTr<T extends BaseObj>(id: string, trId: string): Promise<T> {
        return this.historyDB.get(id);
    }

    public setObjForTr<T extends BaseObj>(obj: T, trId: string): Promise<T> {
        //TODO: implement transaction pre-emptying ,transaction life-cycle, etc
        return this.historyDB.put(obj);
    }

    public forPutForTestingPurposes<T extends BaseObj>(obj): Promise<T> {
        return this.historyDB.forcePut(obj);
    }
}
