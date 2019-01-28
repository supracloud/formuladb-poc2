/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */
import * as isNode from 'detect-node';
import { KeyValueStoreFactoryI } from "@core/key_value_store_i";
import { Schema } from '@core/domain/metadata/entity';
import { FrmdbEngine } from '@core/frmdb_engine';
import { FrmdbEngineStore } from '@core/frmdb_engine_store';

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

export async function getFrmdbEngineStore(): Promise<FrmdbEngineStore> {
    let kvsFactory = await getKeyValueStoreFactory();
    return new FrmdbEngineStore(kvsFactory);
}

export async function getFrmdbEngine(schema: Schema): Promise<FrmdbEngine> {
    return new FrmdbEngine(await getFrmdbEngineStore(), schema);
}
