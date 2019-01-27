/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { KeyValueStoreFactoryMem } from "@storage/mem/key_value_store_mem";

let KeyValueStoreFactory: KeyValueStoreFactoryI;
KeyValueStoreFactory = new KeyValueStoreFactoryMem();
export default KeyValueStoreFactory;
