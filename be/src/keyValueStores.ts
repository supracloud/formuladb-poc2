/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import config from "./config/config";

import * as PouchDB from 'pouchdb';
PouchDB.debug.enable('*');

import { Service } from 'typedi';
import { KeyValueStorePouchDB } from '../../fe/src/app/common/key_value_store_pouchdb';
import { KeyValueStoreI } from "../../fe/src/app/common/key_value_store_i";

@Service()
export class KeyValueStores {
    public transactionsDB: KeyValueStorePouchDB = new KeyValueStorePouchDB(new PouchDB(config.transactionsDBUrl));
    public dataDB: KeyValueStorePouchDB = new KeyValueStorePouchDB(new PouchDB(config.historyDBUrl));
    public locksDB: KeyValueStorePouchDB = new KeyValueStorePouchDB(new PouchDB(config.historyDBUrl));

    public init(): Promise<any> {
        return this.transactionsDB.info()
        .then(() => this.dataDB.info())
        .then(() => this.locksDB.info());
    }
}
