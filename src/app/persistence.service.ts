import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
// import PouchDB from 'pouchdb';//use this when running on webpack in za browser

import { Injectable } from '@angular/core';

import { BaseObj } from "./domain/base_obj";
import { ChangeObj } from "./domain/change_obj";
import { DataObj } from "./domain/metadata/data_obj";
import { Entity } from "./domain/metadata/entity";
import { MwzEvents, MwzEvent } from "./domain/event";
import { Table } from "./domain/uimetadata/table";
import { Form, NodeElement } from "./domain/uimetadata/form";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

PouchDB.debug.enable('*');

@Injectable()
export class PersistenceService {

    public dataDB: any;

    constructor() {
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

    // private put(id: string, document: BaseObj): Promise<any> {
    //     document._id = id;
    //     return this.get(id).then(result => {
    //         document._rev = result._rev;
    //         return this.localDB.put(document);
    //     }, error => {
    //         if (error.status == "404") {
    //             return this.localDB.put(document);
    //         } else {
    //             return new Promise((resolve, reject) => {
    //                 reject(error);
    //             });
    //         }
    //     });
    // }    
}
