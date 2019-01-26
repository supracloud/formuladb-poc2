/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

 import * as _ from 'lodash';

import { KeyObjStoreI, KeyValueStoreArrayKeys } from "./key_value_store_i";
import { SumReduceFunN } from "./domain/metadata/reduce_functions";
import { query } from "@angular/core/src/render3/query";
import { AddHocQuery } from './domain/metadata/ad_hoc_query';
import { $s2e } from './formula_compiler';

export interface KeyValueStoreSpecObjType {
    _id: string;
    categ?: string;
    subcateg?: string;
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
            await kvsa.set(["a"], {_id: "a", val: 2});
            await kvsa.set(["b","c"], {_id: "b_c", val: 3});
            await kvsa.set(["b","d"], {_id: "b_d", val: 4});
            await kvsa.set(["b","e"], {_id: "b_e", val: 5});

             let res: any;
            res = await kvsa.rangeQuery({inclusive_start: false, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_d", val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: false, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_c", val: 3}, {_id: "b_d", val: 4}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: ["b","c"], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "b_c", val: 3}, {_id: "b_d", val: 4}, {_id: "b_e", val: 5}]);
            res = await kvsa.rangeQuery({inclusive_start: true, startkey: [" "], inclusive_end: true, endkey: ["b","e"]});
            expect(res).toEqual([{_id: "a", val: 2}, {_id: "b_c", val: 3}, {_id: "b_d", val: 4}, {_id: "b_e", val: 5}]);

            done();
        });

        fit('run adHocQueries', async (done) => {
            await kvs.put({_id: 'o1', categ: 'C1', subcateg: 'sc1', val: 1});
            await kvs.put({_id: 'o2', categ: 'C1', subcateg: 'sc2', val: 2});
            await kvs.put({_id: 'o3', categ: 'C2', subcateg: 'sc1', val: 3});
            await kvs.put({_id: 'o4', categ: 'C2', subcateg: 'sc2', val: 4});

            let query1: AddHocQuery = {
                extraColsBeforeGroup: [{alias: 'computedVal', expr: $s2e('100 + val') }],
                filters: [$s2e('val > 0')],
                groupColumns: ['categ'],
                groupAggs: [{alias: 'sumVal', reduceFun: {name: SumReduceFunN}, colName: 'computedVal'}],
                groupFilters: [ $s2e('categ == "C1"') ],
                returnedColumns: ['categ', 'sumVal', {alias: 'RET', expr: $s2e('10000 + sumVal')}],
                sortColumns: [],
            };
            let objs = await kvs.adHocQuery(query1);
            expect(objs).toEqual([{
                categ: 'C1',
                sumVal: 203,
                RET: 10203,
            }]);

            await kvs.put({_id: 'o5', categ: 'xx', subcateg: 'Hello', val: 120});

            query1.extraColsBeforeGroup.push({
                alias: 'xx',
                subquery: {
                    extraColsBeforeGroup: [],
                    filters: [$s2e('categ == "xx"')],
                    groupColumns: [],
                    groupAggs: [],
                    groupFilters: [],
                    returnedColumns: ['subcateg'],
                    sortColumns: [],
                },
            });
            query1.groupColumns.push('xx');
            query1.returnedColumns.push('xx');

            objs = await kvs.adHocQuery(query1);
            expect(objs).toEqual([{
                categ: 'C1',
                sumVal: 203,
                RET: 10203,
                xx: 'Hello',
            }]);

            done();
        });

    });
}
