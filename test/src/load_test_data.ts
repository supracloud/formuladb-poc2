/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('module-alias/register');

import { getKeyValueStoreFactory } from "@storage/key_value_store_impl_selector";

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { MockData } from "@test/mocks/mock-data";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueObj } from "@domain/key_value_obj";
import { ServerEventModifiedFormData } from "@domain/event";
import { MockMetadata, CommonEntities } from "@test/mocks/mock-metadata";
import { DictionaryEntry } from "@domain/dictionary-entry";
import { $Dictionary } from "@domain/metadata/default-metadata";
import { HotelBookingDictionary } from "./hotel-booking/data";
import { DataObj } from "@domain/metadata/data_obj";

function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    return frmdbEngine.processEvent(new ServerEventModifiedFormData(obj));
}

const mockMetadata = new MockMetadata();

export async function loadTestData(): Promise<KeyValueStoreFactoryI> {
    try {
        let kvsFactory = await getKeyValueStoreFactory();
        await kvsFactory.clearAllForTestingPurposes();

        
        let uiMetaLoaded = false;
        let commonEntitiesIds = CommonEntities.map(e => e._id);
        {
            let mockData = new MockData(CommonEntities.reduce((acc, e) => {
                acc[e._id] = e; return acc;
            }, {}));
            let frmdbEngineStore = new FrmdbEngineStore('', '', kvsFactory, {_id: "FRMDB_SCHEMA", entities: mockData.entitiesMap});
            let frmdbEngine = new FrmdbEngine(frmdbEngineStore);
            for (let entityId of commonEntitiesIds) {
                for (let obj of mockData.getAllForPath(entityId)) {
                    console.log("PUTTTTTT22", obj);
                    // await frmdbEngineStore.putDataObj(obj);
                    await putObj(frmdbEngine, obj);
                }
            }    
        }

        for (let schemaForApp of mockMetadata.schemas) {
            console.log("Loading data for schema", JSON.stringify(schemaForApp));
            let mockData = new MockData(schemaForApp.schema.entities);
            let frmdbEngineStore = new FrmdbEngineStore(schemaForApp.tenantName, schemaForApp.appName, kvsFactory, schemaForApp.schema);
            let frmdbEngine = new FrmdbEngine(frmdbEngineStore);
            await frmdbEngine.init(true);
            let savedSchema = await frmdbEngineStore.getSchema();
            console.log("Saved schema", savedSchema);
            for (let entityId of Object.keys(schemaForApp.schema.entities).filter(id => !commonEntitiesIds.includes(id))) {
                for (let obj of mockData.getAllForPath(entityId)) {
                    console.log("PUTTTTTT", obj);
                    // await frmdbEngineStore.putDataObj(obj);
                    await putObj(frmdbEngine, obj);
                }
            }
        }

        let kvs$Dictionary = await kvsFactory.createKeyTableS<DictionaryEntry>($Dictionary);
        await Promise.all([...HotelBookingDictionary].map(de => kvs$Dictionary.put(de as any)));

        return kvsFactory;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

loadTestData();