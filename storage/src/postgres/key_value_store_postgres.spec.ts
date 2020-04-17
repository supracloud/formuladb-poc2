/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { KeyValueStoreFactoryPostgres, KeyTableStorePostgres } from './key_value_store_postgres';
import { Pn } from '@domain/metadata/entity';
import { DataObj } from '@domain/metadata/data_obj';
import { KvsImplementation } from '@storage/key_value_store_impl_selector';

describe('KeyObjStorePostgres', () => {

    if (KvsImplementation === "postgres") {
        it('checkIfTableExists should work', async (done) => {
            let kvsFactory = new KeyValueStoreFactoryPostgres();
            await kvsFactory.clearAllForTestingPurposes();
            let kvs = kvsFactory.createKeyTableS({
                _id: 'A', props: {
                    _id: { name: "_id", propType_: Pn.TEXT },
                    a: { name: "a", propType_: Pn.TEXT },
                },
            });

            let ret = await (kvs as KeyTableStorePostgres<DataObj>).checkIfTableExists();
            expect(ret).toEqual(false);

            await kvs.put({_id: 'A~~1', a: "1"} as any);
            ret = await (kvs as KeyTableStorePostgres<DataObj>).checkIfTableExists();
            expect(ret).toEqual(true);

            done();
        });
    }
});
