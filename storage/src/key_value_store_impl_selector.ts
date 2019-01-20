/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreFactoryI } from "./key_value_store_i";
import { KeyValueStoreFactoryMem } from "./mem/key_value_store_mem";
import { KeyValueStoreFactoryPostgres } from "./postgres/key_value_store_postgres";

let KeyValueStoreFactory: KeyValueStoreFactoryI;

switch (process.env.KV_STORE) {
    case "MEM": {
        console.log("Using memory KV store");
        KeyValueStoreFactory = new KeyValueStoreFactoryMem();
        break;
    }
    case "PG": {
        console.log("Using PG KV store");
        KeyValueStoreFactory = new KeyValueStoreFactoryPostgres();
        break;
    }
    default: {
        console.log("Invalid KV store choice. Going with postgres");
        KeyValueStoreFactory = new KeyValueStoreFactoryPostgres();
        break;
    }
}

export default KeyValueStoreFactory;