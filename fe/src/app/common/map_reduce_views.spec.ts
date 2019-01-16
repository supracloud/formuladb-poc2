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
    fit('should precompute and compute basic SUM', async (done) => {
        let mapReduceView = new MapReduceView(new KeyValueStoreFactoryMem(), "tst", {
            entityName: 'A',
            keyExpr: [$s2e(`aY`)],
            valueExpr: $s2e(`num`),
        }, false, {name: SumReduceFunN});

        let updates: MapReduceViewUpdates<number|string>;
        let obj1 = { "_id": "R_A~~1", "num": 1, "aY": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj1); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a1", "R_A~~1"], value: obj1.num}],
            mapDelete: [],
            reduce: [{key: ["a1"], value: obj1.num}],
        }));
        let obj2 = { "_id": "R_A~~2", "num": 5, "aY": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj2); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a1", "R_A~~2"], value: 5}],
            mapDelete: [],
            reduce: [{key: ["a1"], value: obj1.num + obj2.num}],
        }));
        let obj3 = { "_id": "R_A~~3", "num": 2, "aY": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj3); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a2", "R_A~~3"], value: obj3.num}],
            mapDelete: [],
            reduce: [{key: ["a2"], value: obj3.num}],
        }));
        let obj4 = { "_id": "R_A~~4", "num": 3, "aY": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj4); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a2", "R_A~~4"], value: obj4.num}],
            mapDelete: [],
            reduce: [{key: ["a2"], value: obj3.num + obj4.num}],
        }));

        let red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true});
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({startkey: ['0'], endkey: ['\ufff0'], inclusive_start: true, inclusive_end: true});
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: true});
        expect(red).toEqual(obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: false});
        expect(red).toEqual(0);

        let map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a2', '\ufff0'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num]);
        map = await mapReduceView.mapQuery({startkey: ['\u00000'], endkey: ['\ufff0', '\ufff0'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: true});
        expect(map).toEqual([obj2.num, obj3.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: false});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: false});
        expect(map).toEqual([obj2.num]);

        done();
    });
});
