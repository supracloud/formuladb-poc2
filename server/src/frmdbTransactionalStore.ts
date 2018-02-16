import { Container } from "typedi";
import { v4 as uuid } from 'uuid';
import * as dateFormat from 'dateformat';

import { BaseObj } from "../../src/app/common/domain/base_obj";
import { Entity, EntityProperty } from "../../src/app/common/domain/metadata/entity";
import { DataObj } from "../../src/app/common/domain/metadata/data_obj";
import { Form } from "../../src/app/common/domain/uimetadata/form";
import { Table } from "../../src/app/common/domain/uimetadata/table";
import { MwzEvents } from "../../src/app/common/domain/event";

import { KeyValueStore } from "../../src/app/common/key_value_store";
import { FrmdbStore } from "../../src/app/common/frmdb_store";
import { KeyValueStores } from "./keyValueStores";

export type TransactionalCallback = (event: MwzEvents, store: FrmdbStoreAtTransaction, cache: Map<string, BaseObj>) => Promise<MwzEvents>;

export class FrmdbStoreAtTransaction extends FrmdbStore {
    constructor(private event: MwzEvents, protected transactionsDB: KeyValueStore, protected historyDB: KeyValueStore) {
        super(transactionsDB, historyDB);
    }
}

/**
 * The storage for the Formula Engine is a king of JSON version control system built on top of a Key Value Store
 * all operations are relative to a transaction id, when a transaction is evaluated the engine "sees" only data as it existed when the transaction started
 */
export class FrmdbTransactionalStore {

    private kvs: KeyValueStores;

    constructor() {
        this.kvs = Container.get(KeyValueStores);
    }

    public async withTransaction(event: MwzEvents, callback: TransactionalCallback): Promise<MwzEvents> {
        let keepGoing = false;

        do {
            try {
                event._id = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss-l') + '-' + uuid() + '=' + event.clientId_;
                return this.kvs.transactionsDB.put(event)
                    .then(ev => {
                        event.readObjs_ = [];
                        event.updatedIds_ = [];
                        return callback(ev, new FrmdbStoreAtTransaction(ev, this.kvs.transactionsDB, this.kvs.historyDB), new Map<string, BaseObj>());
                    });
        
            } catch (ex) {
                keepGoing = false;
            }
        } while (keepGoing);
    }

    public setTransaction(event: MwzEvents): Promise<MwzEvents> {
        return this.kvs.transactionsDB.put(event);
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
        return this.kvs.historyDB.get(id);
    }

    public setObjForTr<T extends BaseObj>(obj: T, trId: string): Promise<T> {
        //TODO: implement transaction pre-emptying ,transaction life-cycle, etc
        return this.kvs.historyDB.put(obj);
    }

    public forPutForTestingPurposes<T extends BaseObj>(obj): Promise<T> {
        return this.kvs.historyDB.forcePut(obj);
    }
}
