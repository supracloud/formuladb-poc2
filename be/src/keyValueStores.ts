/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import config from "./config/config";

import { Service } from 'typedi';
import { KeyObjStoreI } from '../../fe/src/app/common/key_value_store_i';
import { KeyValueStoreMem } from "../../fe/src/app/common/key_value_store_mem";

@Service()
export class KeyValueStores {
    public transactionsDB: KeyObjStoreI = new KeyValueStoreMem();
    public dataDB: KeyObjStoreI = new KeyValueStoreMem();
    public locksDB: KeyObjStoreI = new KeyValueStoreMem();

    public init(): Promise<any> {
        return this.transactionsDB.info()
        .then(() => this.dataDB.info())
        .then(() => this.locksDB.info());
    }
}
