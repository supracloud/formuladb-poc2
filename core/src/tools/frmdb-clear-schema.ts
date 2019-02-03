require('module-alias/register');

import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';

async function clearSchemaFromKVS() {
    let frmdbEngine = await getFrmdbEngine({_id: "FRMDB_SCHEMA", entities: {}});
    //TODO if table already exists, do just delta
    return frmdbEngine.frmdbEngineStore.kvsFactory.clearAll();
}

clearSchemaFromKVS();
