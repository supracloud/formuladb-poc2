/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MockMetadata } from "./mocks/mock-metadata";
import { MockData } from "./mocks/mock-data";
import { Forms___ServiceForm_Form_ } from "./mocks/forms-ui-metadata";
import { obj2MapES5 } from "../ts-utils";
import { KeyValueStorePouchDB } from "../key_value_store_pouchdb";
import { REP___LargeSales_Form } from "./mocks/reports-ui-metadata";


export async function loadData(dataDB: KeyValueStorePouchDB, transactionsDB: KeyValueStorePouchDB, locksDB: KeyValueStorePouchDB): Promise<{mockMetadata: MockMetadata, mockData: MockData}> {
    try {
        var mockMetadata = new MockMetadata();

        await dataDB.removeAll();
        await transactionsDB.removeAll();
        await locksDB.removeAll();

        await dataDB.put(mockMetadata.schema);

        let mockData = new MockData(mockMetadata.schema.entities);
        await dataDB.putAll(mockData.getAll());

        [Forms___ServiceForm_Form_, REP___LargeSales_Form].forEach(async (formUiMeta) => {
            await dataDB.put(formUiMeta);
        });

        return {mockMetadata, mockData};
    } catch (err) {
        console.error(err);
        throw err;
    }
}
