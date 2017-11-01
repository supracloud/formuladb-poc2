import { Injectable, EventEmitter } from '@angular/core';

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';

import { environment } from '../environments/environment';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { BaseObj } from './domain/base_obj';
import { Form, NodeElement, NodeType, NodeType2Str } from './domain/uimetadata/form';
import { Table } from './domain/uimetadata/table';
import { DataObj } from './domain/metadata/data_obj';
import { ChangeObj } from "./domain/change_obj";
import { Entity, Property } from './domain/metadata/entity';

@Injectable()
export class AppStateService {

    private currentlyEditedObjBeforeSave: BaseObj;
    public entities$: Subject<Entity[]> = new ReplaySubject<Entity[]>(1);
    public table$ = new ReplaySubject<Table>(1);
    public tableData$ = new ReplaySubject<ChangeObj<DataObj>[]>(1);
    public form$ = new ReplaySubject<Form>(1);
    public formData$ = new ReplaySubject<DataObj>(1);
    public formDataUpdatesFromServer$ = new ReplaySubject<DataObj>(1);

    private isInstantiated: boolean = false;
    private nodeId: string;
    private db: any;

    public constructor() {
        this.nodeId = BaseObj.uuid();
        PouchDB.plugin(PouchFind);
        // PouchDB.debug.enable('*');

        if (!this.isInstantiated) {
            this.db = new PouchDB("mwz");
            this.db.createIndex({
                index: { fields: ['mwzType'] }
            });
            this.isInstantiated = true;
        }
    }

    public init() {
        let appStateS = this;
        this.sync("http://localhost:5984/mwz");
        this.db.find({
            selector: {
                mwzType: 'Entity_'
            }
        }).then((res: { docs: Entity[] }) => {
            this.entities$.next(res.docs);
        });
    }

    private fetch() {
        return this.db.allDocs({ include_docs: true });
    }

    private get(id: string) {
        return this.db.get(id);
    }

    public put(id: string, document: BaseObj): Promise<any> {
        document._id = id;
        this.currentlyEditedObjBeforeSave = document;
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.db.put(document);
        }, error => {
            if (error.status == "404") {
                return this.db.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    private sync(remote: string) {
        let appStateS = this;
        let remoteDatabase = new PouchDB(remote);
        this.db.sync(remoteDatabase, {
            live: true
        }).on('change', change => {
            // change.id contains the doc id, change.doc contains the doc
            if (change.deleted) {
                // document was deleted
            } else {
                if (change.doc._id == appStateS.currentlyEditedObjBeforeSave._id) {
                    appStateS.formDataUpdatesFromServer$.next(change.doc);
                }
            }
        }).on('error', error => {
            console.error(error);
        });
    }

    public destroy(): Promise<any> {
        let db = this.db;
        if (!environment.production) {
            let ret = null;
            ret = db.allDocs().then(function (result) {
                // Promise isn't supported by all browsers; you may want to use bluebird
                return Promise.all(result.rows.map(function (row) {
                    return db.remove(row.id, row.value.rev);
                }));
            }).catch(function (err) {
                console.error(err);
            });
            return ret;
        } else {
            throw new Error("internal err, dst called in production!");
        }
    }
}
