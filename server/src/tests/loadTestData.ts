import { Container } from "typedi";
import { MockMetadata } from "../../../src/app/common/test/mocks/mock-metadata";
import { MockData } from "../../../src/app/common/test/mocks/mock-data";
import { Forms__ServiceForm_Form_ } from "../../../src/app/common/test/mocks/mock-ui-metadata";
import { KeyValueStores } from "../keyValueStores";

var mockMetadata = new MockMetadata();

let kvs = Container.get(KeyValueStores);

export async function loadData() {
    try {
        await kvs.historyDB.removeAll();
        await kvs.transactionsDB.removeAll();
        
        mockMetadata.entities.forEach(async (entity) => {
            await kvs.historyDB.put(entity);
        });

        await kvs.historyDB.putAll(new MockData(mockMetadata.entitiesMap).getAll());

        [Forms__ServiceForm_Form_].forEach(async (formUiMeta) => {
            await kvs.historyDB.put(formUiMeta);
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}
