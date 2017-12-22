import { Injectable } from '@angular/core';

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';

import { BaseObj } from "./domain/base_obj";
import { ChangeObj } from "./domain/change_obj";
import { DataObj } from "./domain/metadata/data_obj";
import { Entity } from "./domain/metadata/entity";
import { MwzEvents } from "./domain/event";
import { Table } from "./domain/uimetadata/table";
import { Form, NodeElement } from "./domain/uimetadata/form";

@Injectable()
export class PouchdbService {

    private localDB: any;
    private remoteEventsDB: any;
    private remoteNotifsDB: any;
    private remoteDataDBUrl = 'http://localhost:5984/mwzdata';
    private remoteEventsDBUrl = 'http://localhost:5984/mwzevents';
    private remoteNotifsDBUrl = 'http://localhost:5984/mwznotifs';

    constructor() {
        PouchDB.plugin(PouchFind);
        this.localDB = new PouchDB("mwz");
    }

    public init(initCallback: () => void,
        notifCallback: (change: { doc: MwzEvents }) => void,
        dataChangeCallback: (change: { docs: Array<BaseObj> }) => void) {
        this.remoteEventsDB = new PouchDB(this.remoteEventsDBUrl);
        this.remoteNotifsDB = new PouchDB(this.remoteNotifsDBUrl);

        this.localDB.createIndex({
            index: { fields: ['mwzType'] }
        }).then(() => {
            let appStateS = this;

            //first catchup local PouchDB with what happened on the server while the application was stopped
            this.localDB.replicate.from(this.remoteDataDBUrl)
                .on('complete', info => {

                    //application specific initialization
                    initCallback();

                    //after initial replication from the server is finished, continue with live replication
                    this.localDB.replicate.from(this.remoteDataDBUrl, {
                        live: true,
                        retry: true,
                    })
                        .on('change', function (change) {
                            dataChangeCallback(change);
                        })
                        .on('error', err => console.error(err));

                    //notifs will be handled by the effects service
                    this.remoteNotifsDB.changes({
                        since: 'now',
                        include_docs: true,
                        live: true
                    })
                        .on('change', function (change) {
                            notifCallback(change);
                        })
                        .on('error', err => console.error(err));

                })
                .on('error', err => console.error(err));
        });
    }

    public findByMwzType<T extends BaseObj>(mwzType: string): Promise<T[]> {
        return this.localDB.find({
            selector: {
                mwzType: mwzType
            }
        }).then((res: { docs: T[] }) => {
            return res.docs;
        }).catch(err => console.error(err));
    }

    public putEvent(event: MwzEvents) {
        this.remoteEventsDB.put(event)
            .catch(err => console.error(err))
            .then(() => console.log("%c * Event **##$$",
                "color: blue; font-size: 115%; font-weight: bold; text-decoration: underline;", event));
    }

    public getEntity(path: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.localDB.get(path);
    }

    public getTable(path: string): Promise<Table> {
        return this.localDB.get('Table_:' + path).then(ti => { this.addIdsToTable(ti); return ti; });
    }

    private addIdsToTable(input: Table): void {
        if (!input._id) { input._id = BaseObj.uuid(); }
        if (input.columns && input.columns.length > 0) {
            input.columns.forEach(c => c._id = BaseObj.uuid());
        }
    }

    public getForm(path: string): Promise<Form> {
        return this.localDB.get('Form_:' + path).then(fi => { this.addIdsToForm(fi); return fi; });
    }

    private addIdsToForm(input: NodeElement): void {
        if (!input._id) { input._id = BaseObj.uuid(); }
        if (input.childNodes && input.childNodes.length > 0) {
            input.childNodes.forEach(c => this.addIdsToForm(c));
        }
    }

    public getDataObj(id: string): Promise<DataObj> {
        return this.localDB.get(id);
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
