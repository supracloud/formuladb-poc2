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
import * as md5 from 'md5';

function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    return frmdbEngine.processEvent(new ServerEventModifiedFormData(obj));
}

const mockMetadata = new MockMetadata();

function waitForAllPromisesEvenIfOneRejects(promises: Promise<any>[]): Promise<any> {
    return Promise.all(promises.map(p => p.catch(e => {
        console.error(e);
        return e;
    })));

} 

export async function loadTestData() {
    try {
        let kvsFactory = await getKeyValueStoreFactory();
        await kvsFactory.clearAllForTestingPurposes();

        for (let schemaForApp of mockMetadata.schemas) {
            console.log("Loading data for schema", JSON.stringify(schemaForApp));
            let mockData = new MockData(schemaForApp.schema.entities);
            let frmdbEngineStore = new FrmdbEngineStore(schemaForApp.tenantName, schemaForApp.appName, kvsFactory, schemaForApp.schema);
            await frmdbEngineStore.kvsFactory.metadataStore.putApp(schemaForApp.tenantName, schemaForApp.appName, schemaForApp.app);
            await frmdbEngineStore.kvsFactory.metadataStore.putSchema(schemaForApp.tenantName, schemaForApp.appName, schemaForApp.schema);
            let frmdbEngine = new FrmdbEngine(frmdbEngineStore);
            await frmdbEngine.init(true);

            if (schemaForApp.appName === "formuladb.io" && process.env.ADMIN_USER_EMAIL && process.env.ADMIN_USER_PASS) {
                let hashedPass = md5(process.env.ADMIN_USER_PASS);
                const AdminUser = { _id: `$User~~${process.env.ADMIN_USER_EMAIL}`, firstName: "Admin", lastName: "Admin", code: "act1", username: process.env.ADMIN_USER_EMAIL, email: process.env.ADMIN_USER_EMAIL, avatar: "", name: process.env.ADMIN_USER_EMAIL, role: "ADMIN", password: hashedPass, details: "Environment Owner", state: "ACTIVE_" };
                await putObj(frmdbEngine, AdminUser);
            }

            for (let entityId of Object.keys(schemaForApp.schema.entities)) {
                // Don't load users if DISABLE_TEST_USERS was specified. Used for client envs
                if (entityId === "$User" && process.env.DISABLE_TEST_USERS === "true") {
                    continue;
                }
                let promisesForEntity: Promise<any>[] = [];
                for (let obj of mockData.getAllForPath(entityId)) {
                    console.log("PUTTTTTT", obj);
                    // await frmdbEngineStore.putDataObj(obj);
                    promisesForEntity.push(putObj(frmdbEngine, obj));
                }
                console.log(new Date(), "WAITING FOR", entityId);
                await waitForAllPromisesEvenIfOneRejects(promisesForEntity);
                console.log(new Date(), "FINISHED", entityId);
            }
        }
        // let kvs$Dictionary = await kvsFactory.createKeyTableS<DictionaryEntry>($Dictionary);
        // await Promise.all([...HotelBookingDictionary].map(de => kvs$Dictionary.put(de as any)));

        console.info("load_test_data has FINISHED.");
        kvsFactory.close();

    } catch (err) {
        console.error(err);
    }
}

loadTestData();
