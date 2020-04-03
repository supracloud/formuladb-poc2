import * as stream from 'stream';

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { DataObj } from "@domain/metadata/data_obj";
import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { FrmdbEngine } from '@core/frmdb_engine';
import { KeyValueObj } from '@domain/key_value_obj';
import { ServerEventModifiedFormData } from '@domain/event';

const batchSize = 100;

function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    return frmdbEngine.processEvent(new ServerEventModifiedFormData(obj));
}

export async function initDb(kvsFactory: KeyValueStoreFactoryI) {
    try {
        let schema = await kvsFactory.metadataStore.getSchema(null);
        if (!schema) throw new Error("Cannot get schema");
        let frmdbEngine = await getFrmdbEngine(schema);

        console.log("loading test data for schema", schema);
        for (let entity of Object.values(schema.entities)) {
            if (entity._id.indexOf('$') == 0) continue;
            console.log("loading test data for entity", entity._id);
            let csvSource: stream.Readable | null = await kvsFactory.metadataStore.getEntityBackupData(entity._id);
            if (!csvSource) {
                console.log("empty test data for entity", entity._id);
                continue;
            }
            await new Promise((resolve, reject) => {
                console.log("waiting for loading of test data for entity", entity._id);
                let records: any[] = [];
                csvSource.on("readable", async function () {
                    let record;
                    while (record = this.read()) {
                    /*no await*/ putObj(frmdbEngine, record);
                    }
                });
                csvSource.on("end", () => resolve());
                csvSource.on("error", error => reject(error));
            });
            console.log("finished loading test data for entity", entity._id);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
