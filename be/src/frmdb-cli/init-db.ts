import * as stream from 'stream';

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { DataObj } from "@domain/metadata/data_obj";

const batchSize = 100;

export async function initDb(kvsFactory: KeyValueStoreFactoryI) {
    let schema = await kvsFactory.metadataStore.getSchema(null, null);
    if (!schema) throw new Error("Cannot get schema");

    for (let entity of Object.values(schema.entities)) {
        if (entity._id.indexOf('$') == 0) continue;
        let kvs = kvsFactory.createKeyTableS<DataObj>(entity);
        let csvSource: stream.Readable = await kvsFactory.metadataStore.getEntityBackupData(entity._id);
        await new Promise((resolve, reject) => {
            let records: any[] = [];

            csvSource.on("readable", async function () {
                let record;
                while (record = this.read()) {
                    records.push(record);
                    if (records.length >= batchSize) {
                        await Promise.all(records.map(r => kvs.put(r)));
                    }
                }
            });
            csvSource.on("end", () => resolve());
            csvSource.on("error", error => reject(error));
        });
    }
}
