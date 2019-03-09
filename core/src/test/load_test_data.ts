/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MockData } from "./mocks/mock-data";
import { Forms__ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { LargeSalesReport_Form } from "./mocks/reports-ui-metadata";
import { FrmdbEngine } from "../frmdb_engine";
import { Schema } from "@core/domain/metadata/entity";
import { getFrmdbEngine } from "@storage/key_value_store_impl_selector";
import { HomePage_Form } from "@core/default_pages/website-ui-metadata";

export async function loadTestData(schema: Schema): Promise<FrmdbEngine> {
    try {
        let frmdbEngine = await getFrmdbEngine(schema);
        await frmdbEngine.frmdbEngineStore.kvsFactory.clearAll();
        await frmdbEngine.putSchema(schema);
        await frmdbEngine.init(true);

        let mockData = new MockData(schema.entities);
        await frmdbEngine.frmdbEngineStore.putBulk(mockData.getAll());
        for (let obj of mockData.getAll()) {
            await frmdbEngine.updateViewsForObj(null, obj);
        }

        [Forms__ServiceForm_Form_, LargeSalesReport_Form, HomePage_Form].forEach(async (formUiMeta) => {
            await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
        });

        return frmdbEngine;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
