import PouchDB from 'pouchdb';//use this when running on webpack in the browser
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);
PouchDB.debug.enable('*');

import { Injectable } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

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

@Injectable()
export class BackendService {
    private dataDB: any;
    private remoteDataDB: any;
    private transactionsDB: any;
    private historyDB: any;
    private remoteDataDBUrl: string = 'http://localhost:5984/mwzdata';

    constructor(private http: HttpClient) {
        this.dataDB = new PouchDB("mwz");
        this.remoteDataDB = new PouchDB("http://localhost:5984/mwzdata");
        this.transactionsDB = new PouchDB("http://localhost:5984/mwztransactions");
        this.historyDB = new PouchDB("http://localhost:5984/mwzhistory");
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
                        this.transactionsDB.changes({
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

    public putEvent(event: MwzEvents) {
        return this.http.post<MwzEvents>('/api/event', event)
            .pipe(
                catchError(this.handleError<MwzEvents>('putEvent', event))
            ).subscribe(x => console.log(x));
    }

    public getTable(path: string): Promise<Table> {
        return this.dataDB.get('Table_:' + path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public getForm(path: string): Promise<Form> {
        return this.dataDB.get('Form_:' + path).then(fi => {
            addIdsToForm(fi);
            return fi;
            // return new Promise((resolve, reject) => {
            //     PouchdbService.addIdsToForm(fi);
            //     resolve(fi);
            // })
        });
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
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

    public getDataObj(id: string): Promise<DataObj> {
        return this.dataDB.get(id);
    }
    
}
