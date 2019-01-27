/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreFactoryI } from "./key_value_store_i";
import { KeyValueStoreFactoryPostgres } from "./postgres/key_value_store_postgres";
import { KeyValueStoreFactoryMem } from "./mem/key_value_store_mem";

let KeyValueStoreFactory: KeyValueStoreFactoryI;
KeyValueStoreFactory = new KeyValueStoreFactoryPostgres()
export default KeyValueStoreFactory;
