import * as ZaPouchDB from 'pouchdb';//use this when running on webpack in the browser
const PouchDB = ZaPouchDB['default'];
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);
PouchDB.debug.enable('*');

import { Injectable, InjectionToken, Inject } from '@angular/core';

import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { BaseObj } from "./common/domain/base_obj";
import { ChangeObj } from "./common/domain/change_obj";
import { DataObj } from "./common/domain/metadata/data_obj";
import { Entity } from "./common/domain/metadata/entity";
import { MwzEvents, MwzEvent } from "./common/domain/event";
import { Table, addIdsToTable } from "./common/domain/uimetadata/table";
import { Form, NodeElement, addIdsToForm } from "./common/domain/uimetadata/form";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { KeyValueStorePouchDB } from "./common/key_value_store_pouchdb";
import { FrmdbStore } from "./common/frmdb_store";

const USE_POUCHDB_REPLICATION: boolean = false;

export const TRANSACTIONS_KEY_VALUE_STORE = new InjectionToken<KeyValueStorePouchDB>('TransactionsKeyValueStore');
export const DATA_KEY_VALUE_STORE = new InjectionToken<KeyValueStorePouchDB>('DataKeyValueStore');

export function factoryTransactionsKeyValueStore(): KeyValueStorePouchDB {
    return new KeyValueStorePouchDB(new PouchDB("http://localhost:5984/mwztransactions"));
}

var localPouchDB: any = null;
const remoteDBUrl: string = 'http://localhost:5984/mwzhistory';

export function factoryDataKeyValueStore(): KeyValueStorePouchDB {
    if (USE_POUCHDB_REPLICATION) {
        localPouchDB = new PouchDB("dataDB");
        return new KeyValueStorePouchDB(localPouchDB);
    } else {
        return new KeyValueStorePouchDB(new PouchDB(remoteDBUrl));
    }
}

@Injectable()
export class BackendService extends FrmdbStore {

    private initCallback: () => void;
    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<BaseObj>) => void;


    constructor(private http: HttpClient, 
        @Inject(TRANSACTIONS_KEY_VALUE_STORE) protected transactionsDB: KeyValueStorePouchDB, 
        @Inject(DATA_KEY_VALUE_STORE) protected dataDB: KeyValueStorePouchDB) 
    {
        super(transactionsDB, dataDB);

        if (USE_POUCHDB_REPLICATION) {
            localPouchDB = new PouchDB("dataDB");
            this.dataDB = new KeyValueStorePouchDB(localPouchDB);
        } else {
            this.dataDB = new KeyValueStorePouchDB(new PouchDB(remoteDBUrl));
        }
    }

    public init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (docs: Array<BaseObj>) => void) {

        this.initCallback = initCallback;
        this.notifCallback = notifCallback;
        this.dataChangeCallback = dataChangeCallback;

        if (USE_POUCHDB_REPLICATION) {
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
        localPouchDB.replicate.from(remoteDBUrl)
            .on('complete', info => {
                console.log("%c ** INITIAL REPLICATION FINISHED **##$$",
                    "color: green; font-size: 150%; font-weight: bold; text-decoration: underline;");

                localPouchDB.getIndexes().then(res => {
                    if (!res || !res.indexes || ! (res.indexes instanceof Array) || res.indexes.find(x => x.name == 'index_on_type_') == null ) {
                        return localPouchDB.createIndex({
                            index: {name: 'index_on_type_', fields: ['type_'] }
                        });
                    }
                })
                .then(() => {
                    return localPouchDB.explain({
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
                    localPouchDB.replicate.from(remoteDBUrl, {
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
        if (!USE_POUCHDB_REPLICATION) {
            event.updatedIds_.forEach(id_ => {
                this.dataDB.get(id_)
                .then(obj => this.dataChangeCallback([obj as BaseObj]))
                .catch(err => console.error(err));
            });
        }

        this.notifCallback(event);
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
            addIdsToForm(fi.grid);
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
}
