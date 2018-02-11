import * as PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-adapter-memory'));
PouchDB.debug.enable('*');

import {Service} from 'typedi';
import { KeyValueStore } from '../../src/app/key_value_store';

@Service()
export class KeyValueStores {
    public transactionsDB: KeyValueStore = new KeyValueStore(new PouchDB("http://localhost:5984/mwztransactions"));
    public historyDB: KeyValueStore = new KeyValueStore(new PouchDB("http://localhost:5984/mwzhistory"));

    public init(): Promise<any> {
        return this.transactionsDB.info()
        .then(() => this.historyDB.info());
    }
}
