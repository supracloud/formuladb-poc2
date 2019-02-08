/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MockData } from "./mocks/mock-data";
import { Forms__ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { REP__LargeSales_Form } from "./mocks/reports-ui-metadata";
import { FrmdbEngine } from "../frmdb_engine";

export async function loadTestData(frmdbEngine: FrmdbEngine): Promise<MockData> {
    try {
        await frmdbEngine.frmdbEngineStore.kvsFactory.clearAll();
        let schema = frmdbEngine.frmdbEngineStore.schema;
        await frmdbEngine.frmdbEngineStore.putSchema(schema);

        let mockData = new MockData(schema.entities);
        await frmdbEngine.frmdbEngineStore.putAllObj(mockData.getAll());
        for (let obj of mockData.getAll()) {
            await frmdbEngine.updateViewsForObj(null, obj);
        }

        [Forms__ServiceForm_Form_, REP__LargeSales_Form].forEach(async (formUiMeta) => {
            await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
        });

        return mockData;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
