import * as stream from 'stream';
import * as fs from 'fs';
import * as util from 'util';
const exists = util.promisify(fs.exists);
import * as parse from 'csv-parse';

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { FrmdbEngine } from '@core/frmdb_engine';
import { KeyValueObj } from '@domain/key_value_obj';
import { ServerEventModifiedFormData } from '@domain/event';

const FRMDB_ENV_ROOT_DIR = process.env.FRMDB_ENV_ROOT_DIR || '/wwwroot/git';
const FRMDB_ENV_DIR = `${FRMDB_ENV_ROOT_DIR}/formuladb-env`;

async function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    let event = await frmdbEngine.processEvent(new ServerEventModifiedFormData(obj));
    if (event.error_ || event.state_ === "ABORT") {
        throw new Error("Error saving object " + obj._id + "; " + event.error_);
    }
}

function entityId2TableName(entityId: string) {
    return 't' + entityId.replace(/^$/, '_').toLowerCase();
}

export async function initTestDb(kvsFactory: KeyValueStoreFactoryI) {
    try {
        let start = new Date();
        console.log("loading test data start", start);
        let nbRecords = 0;

        let schema = await kvsFactory.metadataStore.getSchema(null);
        if (!schema) throw new Error("Cannot get schema");
        let frmdbEngine = await getFrmdbEngine(schema);
        await frmdbEngine.init();

        console.log("loading test data for schema", schema);
        let records: any[] = [];
        for (let entity of Object.values(schema.entities)) {
            if (entity._id.indexOf('$') == 0) continue;
            console.log("loading test data for entity" + entity._id + " in table " + entityId2TableName(entity._id));

            let hasData = await exists(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);
            if (!hasData) {
                console.log("empty test data for entity", entity._id);
                continue;
            }
            let csvRawStream = fs.createReadStream(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);

            let parser = csvRawStream.pipe(parse({ columns: true }));
            for await (const record of parser) {
                records.push(record);
            }

            console.log("finished loading test data for entity", entity._id);
        }

        await Promise.all(records.map(r => putObj(frmdbEngine, r)));
        nbRecords = records.length;

        let end = new Date();
        console.log("loading test data end", new Date(), "nbRecords=" + nbRecords + " in " + ((end.getTime() - start.getTime())/1000) + "sec");

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
