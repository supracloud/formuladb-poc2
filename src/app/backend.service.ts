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
import { KeyValueStore } from "./keyValueStore";

@Injectable()
export class BackendService {
    private transactionsDB: KeyValueStore;
    private dataDB: KeyValueStore;
    private localPouchDB: any;
    private remoteDBUrl: string = 'http://localhost:5984/mwzhistory';

    private initCallback: () => void;
    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<BaseObj>) => void;

    private readonly usePouchDBReplication: boolean = false;

    constructor(private http: HttpClient) {
        this.transactionsDB = new KeyValueStore(new PouchDB("http://localhost:5984/mwztransactions"));
        if (this.usePouchDBReplication) {
            this.localPouchDB = new PouchDB("dataDB");
            this.dataDB = new KeyValueStore(this.localPouchDB);
        } else {
            this.dataDB = new KeyValueStore(new PouchDB(this.remoteDBUrl));
        }
    }

    public init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (docs: Array<BaseObj>) => void) {

        this.initCallback = initCallback;
        this.notifCallback = notifCallback;
        this.dataChangeCallback = dataChangeCallback;

        if (this.usePouchDBReplication) {
            this.setupPouchDBReplication();
        } else {
            initCallback();
        }

    }

    private setupPouchDBReplication() {
        let self = this;

        console.log("%c ** INITIAL REPLICATION STARTED **##$$",
        "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");
        
        //first catchup local PouchDB with what happened on the server while the application was stopped
        this.localPouchDB.replicate.from(this.remoteDBUrl)
            .on('complete', info => {
                console.log("%c ** INITIAL REPLICATION FINISHED **##$$",
                    "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

                this.localPouchDB.getIndexes().then(res => {
                    if (!res || !res.indexes || ! (res.indexes instanceof Array) || res.indexes.find(x => x.name == 'index_on_type_') == null ) {
                        return this.localPouchDB.createIndex({
                            index: {name: 'index_on_type_', fields: ['type_'] }
                        });
                    }
                })
                .then(() => {
                    return this.localPouchDB.explain({
                        selector: {
                            type_: 'Entity_'
                        }
                    }).then(explanation => console.warn("Check index usage: ", explanation))
                        .catch(err => console.error(err));
                })
                .then(() => {
                    //application specific initialization
                    self.initCallback();

                    //after initial replication from the server is finished, continue with live replication
                    this.localPouchDB.replicate.from(this.remoteDBUrl, {
                        live: true,
                        retry: true,
                    })
                        .on('change', function (change) {
                            self.dataChangeCallback(change);
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
            ).subscribe(ev => this.handleNotif(ev));
    }

    private handleNotif(event: MwzEvents) {
        if (!this.usePouchDBReplication) {
            event.updatedIds_.forEach(id_ => {
                this.dataDB.get(id_)
                .then(obj => this.dataChangeCallback([obj]))
                .catch(err => console.error(err));
            });
        }

        this.notifCallback(event);
    }

    public getTable(path: string): Promise<Table> {
        return this.dataDB.get<Table>('Table_:' + path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public getForm(path: string): Promise<Form> {
        return this.dataDB.get<Form>('Form_:' + path).then(fi => {
            addIdsToForm(fi);
            return fi;
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

    public findByType<T extends BaseObj>(type_: string): Promise<T[]> {
        return this.dataDB.findByType(type_);
    }

    public getEntity(path: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.dataDB.get(path);
    }

    public getDataObj(id: string): Promise<DataObj> {
        return this.dataDB.get(id);
    }
}
