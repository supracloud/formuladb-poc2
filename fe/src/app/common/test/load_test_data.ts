/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MockMetadata } from "./mocks/mock-metadata";
import { MockData } from "./mocks/mock-data";
import { Forms__ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { REP__LargeSales_Form } from "./mocks/reports-ui-metadata";
import { FrmdbEngine } from "../frmdb_engine";

export async function loadData(frmdbEngine: FrmdbEngine, mockMetadata: MockMetadata): Promise<{mockMetadata: MockMetadata, mockData: MockData}> {
    try {
        await frmdbEngine.frmdbEngineStore.putSchema(mockMetadata.schema);

        let mockData = new MockData(mockMetadata.schema.entities);
        await frmdbEngine.frmdbEngineStore.putAllObj(mockData.getAll());
        for (let obj of mockData.getAll()) {
            // /*await */frmdbEngine.updateViewsForObj(null, obj);
        }

        [Forms__ServiceForm_Form_, REP__LargeSales_Form].forEach(async (formUiMeta) => {
            await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
        });

        return {mockMetadata, mockData};
    } catch (err) {
        console.error(err);
        throw err;
    }
}
