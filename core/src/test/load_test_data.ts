/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { getKeyValueStoreFactory, getFrmdbEngineStore } from "@storage/key_value_store_impl_selector";

import { mockMetadata } from "./main_demo.flow";
import { KeyValueStoreFactoryI } from "@core/key_value_store_i";
import { MockData } from "./mocks/mock-data";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueObj } from "@core/domain/key_value_obj";
import { ServerEventModifiedFormDataEvent } from "@core/domain/event";
import { Forms__ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { LargeSalesReport_Form } from "./mocks/reports-ui-metadata";
import { HomePage_Form, HomePage_Table } from "@core/default_pages/website-ui-metadata";

function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    return frmdbEngine.processEvent(new ServerEventModifiedFormDataEvent(obj));
}

export async function loadTestData(): Promise<KeyValueStoreFactoryI> {
    try {
        let kvsFactory = await getKeyValueStoreFactory();
        await kvsFactory.clearAll();
        for (let app of mockMetadata.apps) {
            await kvsFactory.putApp(app);
        }

        let uiMetaLoaded = false;
        for (let schema of mockMetadata.schemas) {
            await kvsFactory.putSchema(schema);
            let mockData = new MockData(schema.entities);
            let frmdbEngineStore = new FrmdbEngineStore(kvsFactory, schema);
            let frmdbEngine = new FrmdbEngine(frmdbEngineStore);
            for (let obj of mockData.getAll()) {
                await putObj(frmdbEngine, obj);
            }
            if (!uiMetaLoaded) {
                [Forms__ServiceForm_Form_, LargeSalesReport_Form, HomePage_Form].forEach(async (formUiMeta) => {
                    await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
                });
                [HomePage_Table].forEach(async (tbl) => {
                    await frmdbEngine.frmdbEngineStore.putTable(tbl);
                });
                uiMetaLoaded = true;
            }
        }

        return kvsFactory;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
