/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreBase, KeyValueStoreArrayKeys } from "./key_value_store_i";
declare var emit: any;

export function keyValueStoreSpecs<KVSType extends KeyValueStoreBase>(context: { kvs: KVSType }) {
    let kvs: KVSType;
    let kvsa: KeyValueStoreArrayKeys;

    describe('KeyValueStoreBase', () => {
        beforeEach(async (done) => {
            kvs = context.kvs;
            kvsa = new KeyValueStoreArrayKeys(kvs);
            await kvs.clearDB();
            done();
        });

        it('rangeQuery for views', async (done) => {
            kvsa.put({_id: ["a"], val: 2});
            kvsa.put({_id: ["b","c"], val: 3});
            kvsa.put({_id: ["b","d"], val: 4});
            kvsa.put({_id: ["b","e"], val: 5});

            let res: any;
            res = await kvsa.rangeQuery({inclusive_start: false, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: ["b","d"], val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: ["b","c"], val: 3}, {_id: ["b","d"], val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: ["b","c"], val: 3}, {_id: ["b","d"], val: 4}, {_id: ["b","e"], val: 5}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["\u0000"], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: ["a"], val: 2}, {_id: ["b","c"], val: 3}, {_id: ["b","d"], val: 4}, {_id: ["b","e"], val: 5}]);

            done();
        });

    });
}
