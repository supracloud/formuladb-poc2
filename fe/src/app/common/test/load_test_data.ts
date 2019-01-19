/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MockMetadata } from "./mocks/mock-metadata";
import { MockData } from "./mocks/mock-data";
import { Forms___ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { REP___LargeSales_Form } from "./mocks/reports-ui-metadata";
import { FrmdbEngine } from "../frmdb_engine";
import { KeyValueObj } from "../domain/key_value_obj";
import { UserActionEditedFormDataEvent } from "../domain/event";

async function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj): Promise<UserActionEditedFormDataEvent> {
    return await frmdbEngine.processEvent(new UserActionEditedFormDataEvent(obj)) as UserActionEditedFormDataEvent;
}

export async function loadData(frmdbEngine: FrmdbEngine, mockMetadata: MockMetadata): Promise<{mockMetadata: MockMetadata, mockData: MockData}> {
    try {
        await frmdbEngine.frmdbEngineStore.putSchema(mockMetadata.schema);

        let mockData = new MockData(mockMetadata.schema.entities);
        for (let obj of mockData.getAll()) {
            await putObj(frmdbEngine, obj);
        }

        [Forms___ServiceForm_Form_, REP___LargeSales_Form].forEach(async (formUiMeta) => {
            await frmdbEngine.frmdbEngineStore.putForm(formUiMeta);
        });

        return {mockMetadata, mockData};
    } catch (err) {
        console.error(err);
        throw err;
    }
}
