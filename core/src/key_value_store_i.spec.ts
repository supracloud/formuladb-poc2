/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { KeyValueStoreArrayKeys, KeyTableStoreI, KeyValueStoreI } from "./key_value_store_i";
import { Entity, EntityProperty, Pn } from '@domain/metadata/entity';
import { getKeyValueStoreFactory, KvsImplementation } from '@storage/key_value_store_impl_selector';
import { SimpleAddHocQuery } from '@domain/metadata/simple-add-hoc-query';

export interface KeyValueStoreSpecObjType {
    _id: string;
    categ?: string;
    subcateg?: string;
    val: number;
}
export const KeyValueStoreSpecEntity: Entity = {
    _id: "KeyValueStoreSpecEntity",
    props: {
        _id: { name: "_id", propType_: Pn.STRING } as EntityProperty,
        categ: { name: "categ", propType_: Pn.STRING } as EntityProperty,
        subcateg: { name: "subcateg", propType_: Pn.STRING } as EntityProperty,
        val: { name: "val", propType_: Pn.NUMBER } as EntityProperty,
    }
};


describe('KeyObjStoreI', () => {
    let kvs: KeyValueStoreI<KeyValueStoreSpecObjType>;
    let kvt: KeyTableStoreI<KeyValueStoreSpecObjType>;

    beforeEach(async (done) => {
        let kvsFactory = await getKeyValueStoreFactory();
        kvs = kvsFactory.createKeyValS('spec_KeyObjStoreI', {} as KeyValueStoreSpecObjType);
        kvt = kvsFactory.createKeyTableS(KeyValueStoreSpecEntity);
        await kvt.clearDB();
        done();
    });

    it('testGetAll ' + KvsImplementation, async (done) => {
        await kvt.put({ _id: 'o1', categ: 'C1', subcateg: 'sc1', val: 1 });
        await kvt.put({ _id: 'o2', categ: 'C1', subcateg: 'sc2', val: 2 });
        await kvt.put({ _id: 'o3', categ: 'C2', subcateg: 'sc1', val: 3 });
        await kvt.put({ _id: 'o4', categ: 'C2', subcateg: 'sc2', val: 4 });

        let res = await kvt.all();
        expect(res.length).toEqual(4);
        expect(res[0]['_id']).toEqual('o1');

        done();
    });

    it('rangeQuery for views ' + KvsImplementation, async (done) => {
        let kvsa = new KeyValueStoreArrayKeys(kvs);
        await kvsa.set(["a"], { _id: "a", val: 2 });
        await kvsa.set(["b", "c"], { _id: "b_c", val: 3 });
        await kvsa.set(["b", "d"], { _id: "b_d", val: 4 });
        await kvsa.set(["b", "e"], { _id: "b_e", val: 5 });

        let res: any;
        res = await kvsa.rangeQuery({ inclusive_start: false, startkey: ["b", "c"], inclusive_end: false, endkey: ["b", "e"] });
        expect(res).toEqual([{ _id: "b_d", val: 4 }]);
        res = await kvsa.rangeQuery({ inclusive_start: true, startkey: ["b", "c"], inclusive_end: false, endkey: ["b", "e"] });
        expect(res).toEqual([{ _id: "b_c", val: 3 }, { _id: "b_d", val: 4 }]);
        res = await kvsa.rangeQuery({ inclusive_start: true, startkey: ["b", "c"], inclusive_end: true, endkey: ["b", "e"] });
        expect(res).toEqual([{ _id: "b_c", val: 3 }, { _id: "b_d", val: 4 }, { _id: "b_e", val: 5 }]);
        res = await kvsa.rangeQuery({ inclusive_start: true, startkey: [" "], inclusive_end: true, endkey: ["b", "e"] });
        expect(res).toEqual([{ _id: "a", val: 2 }, { _id: "b_c", val: 3 }, { _id: "b_d", val: 4 }, { _id: "b_e", val: 5 }]);

        done();
    });

    it('run adHocQueries ' + KvsImplementation, async (done) => {
        await kvt.put({ _id: 'o1', categ: 'C1', subcateg: 'sc1', val: 1 });
        await kvt.put({ _id: 'o2', categ: 'C1', subcateg: 'sc2', val: 2 });
        await kvt.put({ _id: 'o3', categ: 'C2', subcateg: 'sc1', val: 3 });
        await kvt.put({ _id: 'o4', categ: 'C2', subcateg: 'sc2', val: 4 });

        let query1: SimpleAddHocQuery = {
            startRow: 0,
            endRow: 10,
            rowGroupCols: [{ field: 'categ' }],
            valueCols: [{ field: 'val', aggFunc: "sum" }],
            pivotCols: [],
            pivotMode: false,
            groupKeys: [],
            filterModel: {
                val: { filterType: "number", type: "greaterThan", filter: "0" },
                categ: { filterType: "text", type: "equals", filter: "C1" },
            },
            sortModel: []
        };
        let objs = await kvt.simpleAdHocQuery(query1);
        expect(objs).toEqual([{
            categ: 'C1',
            val: 3
        }]);

        done();
    });

});
