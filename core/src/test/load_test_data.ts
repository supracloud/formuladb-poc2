/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { getKeyValueStoreFactory } from "@storage/key_value_store_impl_selector";

import { mockMetadata } from "./main_demo.flow";
import { KeyValueStoreFactoryI } from "@core/key_value_store_i";
import { MockData } from "./mocks/mock-data";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueObj } from "@domain/key_value_obj";
import { ServerEventModifiedFormDataEvent } from "@domain/event";
import { Forms__ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { LargeSalesReport_Form } from "./mocks/reports-ui-metadata";
import { HomePage_Form, HomePage_Table } from "@core/default_pages/website-ui-metadata";
import { BookingItem_Form, Booking_Form, BookingItem_Table, Booking_Table } from "./mocks/booking-ui-metadata";

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
        let commonEntitiesIds = mockMetadata.commonEntities.map(e => e._id);
        {
            let mockData = new MockData(mockMetadata.commonEntities.reduce((acc, e) => {
                acc[e._id] = e; return acc;
            }, {}));
            let frmdbEngineStore = new FrmdbEngineStore(kvsFactory, {_id: "FRMDB_SCHEMA", entities: mockData.entitiesMap});
            for (let entityId of commonEntitiesIds) {
                for (let obj of mockData.getAllForPath(entityId)) {
                    await frmdbEngineStore.putDataObj(obj);
                    // await putObj(frmdbEngine, obj);
                }
            }    
        }

        for (let schema of mockMetadata.schemas) {
            await kvsFactory.putSchema(schema);
            let mockData = new MockData(schema.entities);
            let frmdbEngineStore = new FrmdbEngineStore(kvsFactory, schema);
            let frmdbEngine = new FrmdbEngine(frmdbEngineStore);
            for (let entityId of Object.keys(schema.entities).filter(id => !commonEntitiesIds.includes(id))) {
                for (let obj of mockData.getAllForPath(entityId)) {
                    await frmdbEngineStore.putDataObj(obj);
                    // await putObj(frmdbEngine, obj);
                }
            }
            if (!uiMetaLoaded) {
                for (let formUiMeta of [
                    Forms__ServiceForm_Form_, LargeSalesReport_Form, HomePage_Form, BookingItem_Form, Booking_Form
                ]) {
                    await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
                };
                for (let tbl of [HomePage_Table, BookingItem_Table, Booking_Table]) {
                    await frmdbEngine.frmdbEngineStore.putTable(tbl);
                };
                uiMetaLoaded = true;
            }
        }

        return kvsFactory;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
