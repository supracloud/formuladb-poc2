import { keyValueStoreSpecs } from "./key_value_store_i.spec";
import { KeyValueStoreMem } from "./key_value_store_mem";

/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */


describe('KeyValueStoreMem', () => {
    keyValueStoreSpecs({kvs: new KeyValueStoreMem()});
});
