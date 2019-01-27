import { keyValueStoreSpecs, KeyValueStoreSpecObjType } from "../key_value_store_i.spec";
import { KeyValueStorePostgres, KeyObjStorePostgres } from "./key_value_store_postgres";

/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */


describe('KeyValueStorePostgres', () => {
    keyValueStoreSpecs({kvs: new KeyObjStorePostgres<KeyValueStoreSpecObjType>('unit-test')});
});
