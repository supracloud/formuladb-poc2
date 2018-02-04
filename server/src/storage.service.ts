import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
PouchDB.debug.enable('*');

import { BaseObj } from "../../src/app/domain/base_obj";
import { Entity, EntityProperty } from "../../src/app/domain/metadata/entity";
import { DataObj } from "../../src/app/domain/metadata/data_obj";
import { Form } from "../../src/app/domain/uimetadata/form";
import { Table } from "../../src/app/domain/uimetadata/table";

export class StorageService {

    public dataDB;
    public transactionsDB;
    public historyDB;

    constructor() {
        this.dataDB = new PouchDB("http://localhost:5984/mwzdata");
        this.transactionsDB = new PouchDB("http://localhost:5984/mwztransactions");
        this.historyDB = new PouchDB("http://localhost:5984/mwzhistory");
    }

    public findByMwzType<T extends BaseObj>(mwzType: string): Promise<T[]> {
        return this.dataDB.find({
            selector: {
                mwzType: mwzType
            }
        }).then((res: { docs: T[] }) => {
            return res.docs;
        }).catch(err => console.error(err));
    }

    public getEntity(path: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.dataDB.get(path);
    }

    public getTable(path: string): Promise<Table> {
        return this.dataDB.get('Table_:' + path);
    }

    public getForm(path: string): Promise<Form> {
        return this.dataDB.get('Form_:' + path);
    }

    public getDataObj(id: string): Promise<DataObj> {
        return this.dataDB.get(id);
    }
    
    public forcePut(id: string, document: BaseObj): Promise<any> {
        document._id = id;
        return this.dataDB.get(id).then(result => {
            document._rev = result._rev;
            return this.dataDB.put(document);
        }, error => {
            if (error.status == "404") {
                return this.dataDB.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }
}
