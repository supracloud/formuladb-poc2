import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
// import PouchDB from 'pouchdb';//use this when running on webpack in za browser
import PouchFind from 'pouchdb-find';

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

import { PersistenceService } from "./persistence.service";

@Injectable()
export class BackendService extends PersistenceService {

    private remoteDataDBUrl = 'http://localhost:5984/mwzdata';

    constructor(private http: HttpClient,
        private persistentService: PersistenceService) {
        super();
        this.persistentService.dataDB = new PouchDB("mwz");
    }

    public init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (change: { docs: Array<BaseObj> }) => void) {

        this.persistentService.dataDB.createIndex({
            index: { fields: ['mwzType'] }
        }).then(() => {
            let appStateS = this;

            this.persistentService.dataDB.explain({
                selector: {
                    mwzType: 'Entity_'
                }
            }).then(explanation => console.warn("Check index usage: ", explanation))
                .catch(err => console.error(err));

            //first catchup local PouchDB with what happened on the server while the application was stopped
            this.persistentService.dataDB.replicate.from(this.remoteDataDBUrl)
                .on('complete', info => {

                    //application specific initialization
                    initCallback();

                    //after initial replication from the server is finished, continue with live replication
                    this.persistentService.dataDB.replicate.from(this.remoteDataDBUrl, {
                        live: true,
                        retry: true,
                    })
                        .on('change', function (change) {
                            dataChangeCallback(change);
                        })
                        .on('error', err => console.error(err));
                })
                .on('error', err => console.error(err));
        });
    }

    public putEvent(event: MwzEvents): Observable<MwzEvents> {
        return this.http.post<MwzEvents>('/api/event', event);
    }

    public getTable(path: string): Promise<Table> {
        return super.getTable(path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                BackendService.addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public static addIdsToTable(input: Table): void {
        if (!input._id) { input._id = BaseObj.uuid(); }
        if (input.columns && input.columns.length > 0) {
            input.columns.forEach(c => c._id = BaseObj.uuid());
        }
    }

    public getForm(path: string): Promise<Form> {
        return super.getForm(path).then(fi => {
            BackendService.addIdsToForm(fi);
            return fi;
            // return new Promise((resolve, reject) => {
            //     PouchdbService.addIdsToForm(fi);
            //     resolve(fi);
            // })
        });
    }

    public static addIdsToForm(input: NodeElement): void {
        if (!input._id) { input._id = BaseObj.uuid(); }
        if (input.childNodes && input.childNodes.length > 0) {
            input.childNodes.forEach(c => this.addIdsToForm(c));
        }
    }

}
