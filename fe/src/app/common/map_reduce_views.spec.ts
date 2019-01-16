import { keyValueStoreSpecs } from "./key_value_store_i.spec";
import { KeyValueStoreMem, KeyValueStoreFactoryMem } from "./key_value_store_mem";
import { MapReduceView, MapReduceViewUpdates } from "./map_reduce_view";
import { $s2e } from "./formula_compiler";
import { SumReduceFunN } from "./domain/metadata/reduce_functions";

/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */


describe('MapReduceView', () => {
    fit('should create a formula DAG correctly', async (done) => {
        let mapReduceView = new MapReduceView(new KeyValueStoreFactoryMem(), "tst", {
            entityName: 'A',
            keyExpr: [$s2e(`aY`)],
            valueExpr: $s2e(`num`),
        }, false, {name: SumReduceFunN});

        let updates: MapReduceViewUpdates<number|string>;
        let obj1 = { "_id": "R_A~~1", "num": 1, "aY": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj1);
        expect(updates).toEqual(jasmine.objectContaining({

        }));
        let obj2 = { "_id": "R_A~~2", "num": 5, "aY": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj2);
        let obj3 = { "_id": "R_A~~3", "num": 2, "aY": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj3);
        let obj4 = { "_id": "R_A~~4", "num": 3, "aY": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj4);

        done();
    });
});
