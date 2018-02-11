import { Container } from "typedi";
import { MockMetadata } from "../../../src/app/test/mocks/mock-metadata";
import { MockData } from "../../../src/app/test/mocks/mock-data";
import { Forms__ServiceForm_Form_ } from "../../../src/app/test/mocks/mock-ui-metadata";
import { KeyValueStores } from "../keyValueStores";

var mockMetadata = new MockMetadata();

let kvs = Container.get(KeyValueStores);

export async function loadData() {
    try {
        // var result = await kvs.historyDB.allDocs({
        //     include_docs: true,
        //     attachments: false
        // });

        // result.rows.map(async (row) => {
        //     await kvs.historyDB.remove(row.id, row.value.rev);
        // });

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
