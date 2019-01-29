import { keyValueStoreSpecs, KeyValueStoreSpecObjType, KeyValueStoreSpecEntity } from "@core/key_value_store_i.spec";
import { KeyObjStorePostgres, KeyTableStorePostgres } from "./key_value_store_postgres";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


describe('KeyValueStorePostgres', () => {
    keyValueStoreSpecs({kvs: new KeyTableStorePostgres<KeyValueStoreSpecObjType>(KeyValueStoreSpecEntity)});
});
