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
    private historyDB: KeyValueStore;

    private notifCallback: (event: MwzEvents) => void;
    private dataChangeCallback: (docs: Array<BaseObj>) => void;

    constructor(private http: HttpClient) {
        this.transactionsDB = new KeyValueStore(new PouchDB("http://localhost:5984/mwztransactions"));
        this.historyDB = new KeyValueStore(new PouchDB("http://localhost:5984/mwzhistory"));
    }

    public init(initCallback: () => void,
        notifCallback: (event: MwzEvents) => void,
        dataChangeCallback: (docs: Array<BaseObj>) => void) {

        this.notifCallback = notifCallback;
        this.dataChangeCallback = dataChangeCallback;

        initCallback();
    }

    public putEvent(event: MwzEvents) {
        return this.http.post<MwzEvents>('/api/event', event)
            .pipe(
                catchError(this.handleError<MwzEvents>('putEvent', event))
            ).subscribe(ev => this.handleNotif(ev));
    }

    private handleNotif(event: MwzEvents) {
        event.updatedIds_.forEach(id_ => {
            this.historyDB.get(id_)
            .then(obj => this.dataChangeCallback([obj]))
            .catch(err => console.error(err));
        });

        this.notifCallback(event);
    }

    public getTable(path: string): Promise<Table> {
        return this.historyDB.get<Table>('Table_:' + path).then(ti => {
            return new Promise<Table>((resolve, reject) => {
                addIdsToTable(ti);
                resolve(ti);
            })
        });
    }

    public getForm(path: string): Promise<Form> {
        return this.historyDB.get<Form>('Form_:' + path).then(fi => {
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

    public findByMwzType<T extends BaseObj>(mwzType: string): Promise<T[]> {
        return this.historyDB.findByMwzType(mwzType);
    }

    public getEntity(path: string): Promise<Entity> {
        //the Entity's _id is the path
        return this.historyDB.get(path);
    }

    public getDataObj(id: string): Promise<DataObj> {
        return this.historyDB.get(id);
    }
}
