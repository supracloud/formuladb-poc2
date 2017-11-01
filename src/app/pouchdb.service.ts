import { Injectable, EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';

import { environment } from '../environments/environment';

@Injectable()
export class PouchdbService {

    private isInstantiated: boolean;
    private database: any;
    private listener: EventEmitter<any> = new EventEmitter();

    public constructor() {
        if (!this.isInstantiated) {
            this.database = new PouchDB("mwz");
            this.isInstantiated = true;
        }
    }

    public fetch() {
        return this.database.allDocs({ include_docs: true });
    }

    public get(id: string) {
        return this.database.get(id);
    }

    public put(id: string, document: any) {
        document._id = id;
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.database.put(document);
        }, error => {
            if (error.status == "404") {
                return this.database.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    public sync(remote: string) {
        let remoteDatabase = new PouchDB(remote);
        this.database.sync(remoteDatabase, {
            live: true
        }).on('change', change => {
            this.listener.emit(change);
        }).on('error', error => {
            console.error(JSON.stringify(error));
        });
    }

    public getChangeListener() {
        return this.listener;
    }

    public destroy(): Promise<any> {
        let db = this.database;
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
