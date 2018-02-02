import PouchDB from 'pouchdb';//use this when running on webpack in the browser
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);
PouchDB.debug.enable('*');

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

import { addIdsToForm, addIdsToTable } from "./domain.utils";
import { PersistenceService } from "./persistence.service";

@Injectable()
export class BackendService extends PersistenceService {

    private remoteDataDBUrl = 'http://localhost:5984/mwzdata';

    constructor() {
        super();
        this.dataDB = new PouchDB("mwz");
        this.eventsDB = new PouchDB('http://localhost:5984/mwzevents');
        this.notifsDB = new PouchDB('http://localhost:5984/mwznotifs');
    }

    public init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (change: { docs: Array<BaseObj> }) => void) {

        console.log("%c ** INITIAL REPLICATION STARTED **##$$",
            "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

        //first catchup local PouchDB with what happened on the server while the application was stopped
        this.dataDB.replicate.from(this.remoteDataDBUrl)
            .on('complete', info => {
                console.log("%c ** INITIAL REPLICATION FINISHED **##$$",
                    "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

                // this.dataDB.createIndex({
                //     index: { fields: ['mwzType'] }
                // }).then(() => {
                //     let appStateS = this;

                //     this.dataDB.explain({
                //         selector: {
                //             mwzType: 'Entity_'
                //         }
                //     }).then(explanation => console.warn("Check index usage: ", explanation))
                //         .catch(err => console.error(err));
                // })
                Promise.resolve()
                .then(() => {
                    //application specific initialization
                    initCallback();

                    //after initial replication from the server is finished, continue with live replication
                    this.dataDB.replicate.from(this.remoteDataDBUrl, {
                        live: true,
                        retry: true,
                    })
                        .on('change', function (change) {
                            dataChangeCallback(change);
                        })
                        .on('error', err => console.error(err));

                    //notifs will be handled by the effects service
                    this.notifsDB.changes({
                        since: 'now',
                        include_docs: true,
                        live: true
                    })
                        .on('change', function (change) {
                            notifCallback(change ? change.doc : null);
                        })
                        .on('error', err => console.error(err));

                });
            })
            .on('error', err => console.error(err));
    }

    public getTable(path: string): Promise<Table> {
        return super.getTable(path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public getForm(path: string): Promise<Form> {
        return super.getForm(path).then(fi => {
            addIdsToForm(fi);
            return fi;
            // return new Promise((resolve, reject) => {
            //     PouchdbService.addIdsToForm(fi);
            //     resolve(fi);
            // })
        });
    }

}
