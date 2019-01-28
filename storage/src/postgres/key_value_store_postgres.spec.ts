import { keyValueStoreSpecs, KeyValueStoreSpecObjType } from "@core/key_value_store_i.spec";
import { KeyValueStorePostgres, KeyObjStorePostgres } from "./key_value_store_postgres";
import { SumReduceFunN } from "@core/domain/metadata/reduce_functions";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


describe('KeyValueStorePostgres', () => {
    keyValueStoreSpecs({kvs: new KeyObjStorePostgres<KeyValueStoreSpecObjType>('unit-test')});

    it('simpleAdHocQuery2SQL should work correctly', async (done) => {
        let kvs = new KeyObjStorePostgres<KeyValueStoreSpecObjType>('unit-test');
        let sql = kvs.simpleAdHocQuery2SQL({
            whereFilters: [{colName: 'val', op: '>', value: 0}],
            groupColumns: ['categ'],
            groupAggs: [{alias: 'sumVal', reduceFun: {name: SumReduceFunN}, colName: 'val'}],
            groupFilters: [{colName: 'categ', op: '==', value: 'C1'}],
            columns: ['categ', 'sumVal'],
            sortColumns: [],
        });
        expect(sql).toEqual(`
SELECT val->>'categ' as categ, SUM((val->>'val')::int)::int as sumVal 
FROM f_9885
WHERE ((val->>'val')::int > 0)
GROUP BY val->>'categ'
HAVING (val->>'categ' = 'C1')`);

        done();
    });

});
