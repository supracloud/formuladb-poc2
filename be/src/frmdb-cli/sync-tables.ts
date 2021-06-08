import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { FrmdbEngine } from "@core/frmdb_engine";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { isMediaStoreMetadataEntity } from "@domain/metadata/default-metadata";

export async function syncTables(kvsFactory: KeyValueStoreFactoryI) {
    let apps = await kvsFactory.metadataStore.getApps();
    for (let app of apps) {
        let schema = await kvsFactory.metadataStore.getSchema(app.name);
        if (!schema) throw new Error("The app does not exist " + app.name);
        let engine = new FrmdbEngine(new FrmdbEngineStore(kvsFactory, schema));
        await engine.init();
        for (let [entityName, entity] of Object.entries(schema.entities)) {
            if (entityName !== entity._id) throw new Error(`Inconsitent definition ${entityName} != ${entity._id}`);
            if (isMediaStoreMetadataEntity(entity._id)) {
                console.log(`Entity ${entityName} saved in media store not in KVS, skipping...`);
                continue;
            }
            console.log(`Sync table for ${JSON.stringify(entity, null, 4)}`);
            await engine.frmdbEngineStore.putEntity(entity);
        }
    }
}
