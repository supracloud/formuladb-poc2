import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { syncTables } from "./sync-tables";

export async function autoUpgrade(kvsFactory: KeyValueStoreFactoryI) {
    await syncTables(kvsFactory);
}
