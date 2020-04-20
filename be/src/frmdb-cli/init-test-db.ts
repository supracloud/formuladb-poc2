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
import { Schema, Entity } from '@domain/metadata/entity';

const FRMDB_ENV_ROOT_DIR = process.env.FRMDB_ENV_ROOT_DIR || '/wwwroot/git';
const FRMDB_ENV_DIR = `${FRMDB_ENV_ROOT_DIR}/formuladb-env`;

async function putObj(frmdbEngine: FrmdbEngine, obj: KeyValueObj) {
    try {
        let event = await frmdbEngine.processEventAnonymous(new ServerEventModifiedFormData(obj));
        if (event.error_ || event.state_ === "ABORT") {
            throw new Error("Error saving object " + obj._id + "; " + event.error_);
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function entityId2TableName(entityId: string) {
    return 't' + entityId.replace(/^\$/, '_').toLowerCase();
}

export async function initTestDb(kvsFactory: KeyValueStoreFactoryI) {
    try {
        let start = new Date();
        console.log("loading test data start", start);
        let nbRecords = 0;

        let entitiesInOrderOfDependencies: Entity[] = [
            (await kvsFactory.metadataStore.getEntity(null, 'AppCategory'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'SampleApp'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'WishListRequest'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'ContactRequest'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Restaurant_Menu_Item'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Restaurant_Order'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Restaurant_Order_Item'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Room'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Room_Booking'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Room_Type'))!,
        ]

        let schema: Schema = {
            _id: 'FRMDB_SCHEMA~~COMPLETE_DB',
            entities: entitiesInOrderOfDependencies.reduce((a, x) => ({...a, [x._id]: x}), {})
        };
        if (!schema) throw new Error("Cannot get schema");
        let frmdbEngine = await getFrmdbEngine(schema);
        await frmdbEngine.init();

        console.log("loading test data for schema", schema);
        let records: any[] = [];
        for (let entity of entitiesInOrderOfDependencies) {
            console.log("starting test data load for entity" + entity._id + " in table " + entityId2TableName(entity._id));

            let hasData = await exists(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);
            if (!hasData) {
                console.log("empty test data for entity", entity._id);
                continue;
            }
            let csvRawStream = fs.createReadStream(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);

            let parser = csvRawStream.pipe(parse({ columns: true, escape: '\\' }));
            for await (const record of parser) {
                records.push(record);
            }
            await Promise.all(records.map(r => putObj(frmdbEngine, r)));
        }

        // //all in parallel
        // await Promise.all(records.map(r => putObj(frmdbEngine, r)));

        // // batches
        // let batchSize = 50;
        // for (let i = 0; i < 100; i++) {
        //     if (records.length < i * batchSize) break;
        //     await Promise.all(records.slice(i * batchSize, (i + 1) * batchSize).map(r => putObj(frmdbEngine, r).catch(err => {console.error(err); throw err})));
        // }
        // //sequential
        // for (let r of records) {
        //     await putObj(frmdbEngine, r);
        // }
        nbRecords = records.length;

        let end = new Date();
        console.log("loading test data end", new Date(), "nbRecords=" + nbRecords + " in " + ((end.getTime() - start.getTime())/1000) + "sec");

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
