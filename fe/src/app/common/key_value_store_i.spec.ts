/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyObjStoreI, KeyValueStoreArrayKeys } from "./key_value_store_i";
declare var emit: any;

export interface KeyValueStoreSpecObjType {
    _id: string;
    val: number;
}
export function keyValueStoreSpecs<KVSType extends KeyObjStoreI<KeyValueStoreSpecObjType>>(context: { kvs: KVSType }) {
    let kvs: KVSType;

    describe('KeyObjStoreI', () => {
        beforeEach(async (done) => {
            kvs = context.kvs;
            await kvs.clearDB();
            done();
        });

        it('rangeQuery for views', async (done) => {
            let kvsa = new KeyValueStoreArrayKeys(kvs);
            kvsa.set(["a"], {_id: "a", val: 2});
            kvsa.set(["b","c"], {_id: "b_c", val: 3});
            kvsa.set(["b","d"], {_id: "b_d", val: 4});
            kvsa.set(["b","e"], {_id: "b_e", val: 5});

            let res: any;
            res = await kvsa.rangeQuery({inclusive_start: false, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_d", val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_c", val: 3}, {_id: "b_d", val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_c", val: 3}, {_id: "b_d", val: 4}, {_id: "b_e", val: 5}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["\u0000"], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "a", val: 2}, {_id: "b_c", val: 3}, {_id: "b_d", val: 4}, {_id: "b_e", val: 5}]);

            done();
        });

    });
}
