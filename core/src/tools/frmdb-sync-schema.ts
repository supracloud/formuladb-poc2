const fs = require('fs'),
    process = require('process');

import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { Schema } from '@core/domain/metadata/entity';

async function syncSchemaToKVS(schema: Schema) {
    let frmdbEngine = await getFrmdbEngine(schema);
    //TODO if table already exists, do just delta
    return frmdbEngine.frmdbEngineStore.init();
}

syncSchemaToKVS(JSON.parse(fs.readFileSync(process.argv[1], 'utf8')));
