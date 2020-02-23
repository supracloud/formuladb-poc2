/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */
import * as isNode from 'detect-node';
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { Schema } from '@domain/metadata/entity';
import { FrmdbEngine } from '@core/frmdb_engine';
import { FrmdbEngineStore } from '@core/frmdb_engine_store';

export const KvsImplementation = process.env.FRMDB_STORAGE || "mem";
console.info("KvsImplementation=" + KvsImplementation);

export async function getKeyValueStoreFactory(): Promise<KeyValueStoreFactoryI> {
    if (isNode) {
        const process = await import('process');
        if (process.env.FRMDB_STORAGE === 'postgres') {
            const kvsPostgres = await import("./postgres/key_value_store_postgres");
            return new kvsPostgres.KeyValueStoreFactoryPostgres();
        } else {
            const kvsMem = await import("./mem/key_value_store_mem");
            return new kvsMem.KeyValueStoreFactoryMem();
        }
    } else {
        const kvsMem = await import("./mem/key_value_store_mem");
        return new kvsMem.KeyValueStoreFactoryMem();
    }
}

export async function getFrmdbEngineStore(schema: Schema, tenantName: string, appName: string): Promise<FrmdbEngineStore> {
    let kvsFactory = await getKeyValueStoreFactory();
    return new FrmdbEngineStore(tenantName, appName, kvsFactory, schema);
}

export async function getFrmdbEngine(schema: Schema, tenantName: string, appName: string): Promise<FrmdbEngine> {
    return new FrmdbEngine(await getFrmdbEngineStore(schema, tenantName, appName));
}


const fs = require('fs');//TODO: fix this for running in the browser
export async function getTestFrmdbEngineStore(schema: Schema): Promise<FrmdbEngineStore> {
    fs.mkdirSync('/tmp/frmdb-metadata-store-for-specs', { recursive: true });
    console.log("mkdir finished")
    let kvsFactory = await getKeyValueStoreFactory();
    return new FrmdbEngineStore('spec-apps', 'test-app', kvsFactory, schema);
}
export async function getTestFrmdbEngine(schema: Schema): Promise<FrmdbEngine> {
    return new FrmdbEngine(await getTestFrmdbEngineStore(schema));
}
