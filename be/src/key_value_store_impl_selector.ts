/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { KeyValueStoreFactoryPostgres } from "@storage/postgres/key_value_store_postgres";

let KeyValueStoreFactory: KeyValueStoreFactoryI;
KeyValueStoreFactory = new KeyValueStoreFactoryPostgres()
export default KeyValueStoreFactory;
