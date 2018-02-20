import config from "./config/config";

import * as PouchDB from 'pouchdb';
PouchDB.debug.enable('*');

import { Service } from 'typedi';
import { KeyValueStorePouchDB } from '../../src/app/common/key_value_store_pouchdb';
import { KeyValueStoreI } from "../../src/app/common/key_value_store_i";

@Service()
export class KeyValueStores {
    public transactionsDB: KeyValueStoreI = new KeyValueStorePouchDB(new PouchDB(config.transactionsDBUrl));
    public historyDB: KeyValueStoreI = new KeyValueStorePouchDB(new PouchDB(config.historyDBUrl));

    public init(): Promise<any> {
        return this.transactionsDB.info()
        .then(() => this.historyDB.info());
    }
}
