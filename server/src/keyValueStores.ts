import config from "./config/config";

import * as PouchDB from 'pouchdb';
PouchDB.debug.enable('*');

export var ThePouchDB;

if (config.env === 'development' || config.env === 'test') {
    ThePouchDB = PouchDB.defaults({db: require('memdown')});
} else {
    ThePouchDB = PouchDB;
}

import {Service} from 'typedi';
import { KeyValueStore } from '../../src/app/key_value_store';

@Service()
export class KeyValueStores {
    public transactionsDB: KeyValueStore = new KeyValueStore(new ThePouchDB(config.transactionsDBUrl));
    public historyDB: KeyValueStore = new KeyValueStore(new ThePouchDB(config.historyDBUrl));

    public init(): Promise<any> {
        return this.transactionsDB.info()
        .then(() => this.historyDB.info());
    }
}
