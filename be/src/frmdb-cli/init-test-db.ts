import * as stream from 'stream';
import * as fs from 'fs';
import * as util from 'util';
const exists = util.promisify(fs.exists);
import * as parse from 'csv-parse';
import * as child_process from 'child_process';
const exec = util.promisify(child_process.exec);

import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { FrmdbEngine } from '@core/frmdb_engine';
import { KeyValueObj } from '@domain/key_value_obj';
import { ServerEventModifiedFormData } from '@domain/event';
import { Schema, Entity } from '@domain/metadata/entity';
import { $User, $Dictionary, $Currency, $System_Param, $Permission } from '@domain/metadata/default-metadata';

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
            $User,
            $Dictionary,
            $Currency,
            $System_Param,
            $Permission,
            (await kvsFactory.metadataStore.getEntity(null, 'Report_Order_Item'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Report_Order'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Monthly_Delivery_Rate_By_Customer'))!,
            (await kvsFactory.metadataStore.getEntity(null, 'Monthly_Delivery_Rate_By_Brands'))!,
        ]

        let schema: Schema = {
            _id: 'FRMDB_SCHEMA~~COMPLETE_DB',
            entities: entitiesInOrderOfDependencies.reduce((a, x) => ({ ...a, [x._id]: x }), {})
        };
        if (!schema) throw new Error("Cannot get schema");
        let frmdbEngine = await getFrmdbEngine(schema);
        await frmdbEngine.init();

        console.log("loading test data for schema", schema);
        for (let entity of entitiesInOrderOfDependencies) {
            console.log("starting test data load for entity" + entity._id + " in table " + entityId2TableName(entity._id));

            let hasData = await exists(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);
            if (!hasData) {
                console.log("empty test data for entity", entity._id);
                continue;
            }
            let csvRawStream = fs.createReadStream(`${FRMDB_ENV_DIR}/db/${entityId2TableName(entity._id)}.csv`);

            let parser = csvRawStream.pipe(parse({ columns: true, escape: '\\' }));
            let records: any[] = [];
            await new Promise((resolve, reject) => {
                parser.on('readable', function () {
                    let record;
                    while (record = parser.read()) {
                        records.push(record);
                        nbRecords++;
                    }
                })
                // Catch any error
                parser.on('error', function (err) {
                    reject(err);
                })
                // When we are done, test that the parsed output matched what expected
                parser.on('end', function () {
                    resolve();
                })
            });
            await Promise.all(records.map(r => putObj(frmdbEngine, r)));
        }

        let end = new Date();
        console.log("loading test data end", new Date(), "nbRecords=" + nbRecords + " in " + ((end.getTime() - start.getTime()) / 1000) + "sec");

        await exec(`bash -c "if [ -f /wwwroot/git/formuladb-env/db/init-db.sql ]; then cat /wwwroot/git/formuladb-env/db/init-db.sql | psql -e -h \${PGHOST:-db} -U postgres; fi"`);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
