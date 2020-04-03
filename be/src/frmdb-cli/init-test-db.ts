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

export async function initTestDb(kvsFactory: KeyValueStoreFactoryI) {
    try {
        let csvRawStream = fs.createReadStream(`${FRMDB_ENV_DIR}/db/troom.csv`);

        // Initialise the parser by generating random records
        const parser = csvRawStream.pipe(
            parse({ columns: true })
        )
        // Intialise count
        let count = 0;
        // Report start
        process.stdout.write('start\n')
        // Iterate through each records
        for await (const record of parser) {
            // Report current line
            console.log(record);
            // Fake asynchronous operation
            await new Promise((resolve) => setTimeout(resolve, 100))
        }
        // Report end
        process.stdout.write('...done\n')

        let schema = await kvsFactory.metadataStore.getSchema(null);
        if (!schema) throw new Error("Cannot get schema");
        let frmdbEngine = await getFrmdbEngine(schema);

        console.log("loading test data for schema", schema);
        for (let entity of Object.values(schema.entities)) {
            if (entity._id.indexOf('$') == 0) continue;
            console.log("loading test data for entity", entity._id);

            let hasData = await exists(`${FRMDB_ENV_DIR}/db/t${entity._id.toLowerCase()}.csv`);
            if (!hasData) {
                console.log("empty test data for entity", entity._id);
                continue;
            }
            let csvRawStream = fs.createReadStream(`${FRMDB_ENV_DIR}/db/t${entity._id.toLowerCase()}.csv`);

            let parser = csvRawStream.pipe(parse({ columns: true }));
            for await (const record of parser) {
                await putObj(frmdbEngine, record);
            }

            console.log("finished loading test data for entity", entity._id);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
