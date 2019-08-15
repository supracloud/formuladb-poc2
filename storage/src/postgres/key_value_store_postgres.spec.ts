/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { KeyValueStoreFactoryPostgres, KeyTableStorePostgres } from './key_value_store_postgres';
import { Pn } from '@domain/metadata/entity';
import { DataObj } from '@domain/metadata/data_obj';

describe('KeyObjStorePostgres', () => {

    it('checkIfTableExists should work', async (done) => {
        let kvsFactory = new KeyValueStoreFactoryPostgres();
        await kvsFactory.clearAllForTestingPurposes();
        let kvs = kvsFactory.createKeyTableS({
            _id: 'A', props: {
                _id: { name: "_id", propType_: Pn.STRING },
                a: { name: "a", propType_: Pn.STRING },
            },
        });

        let ret = await (kvs as KeyTableStorePostgres<DataObj>).checkIfTableExists();
        expect(ret).toEqual(false);

        await kvs.put({_id: 'A~~1', a: "1"} as any);
        ret = await (kvs as KeyTableStorePostgres<DataObj>).checkIfTableExists();
        expect(ret).toEqual(true);

        done();
    });

});
