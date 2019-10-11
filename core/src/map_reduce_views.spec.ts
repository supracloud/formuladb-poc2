import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';
import { MapReduceView, MapReduceViewUpdates } from "./map_reduce_view";
import { $s2e } from '@functions/s2e';
import { SumReduceFunN } from "@domain/metadata/reduce_functions";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { MINCHAR, MAXCHAR } from '@storage/collator';

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


describe('MapReduceView', () => {
    let kvsFactory: KeyValueStoreFactoryI;
    
    beforeEach(async (done) => {
        kvsFactory = await getKeyValueStoreFactory();
        await kvsFactory.clearAllForTestingPurposes();
        done();
    });

    it('should precompute and compute basic SUM', async (done) => {
        let mapReduceView = new MapReduceView(kvsFactory, "tst", {
            entityId: 'A',
            keyExpr: [$s2e(`a_y`)],
            valueExpr: $s2e(`num`),
        }, false, {name: SumReduceFunN});

        let updates: MapReduceViewUpdates<number|string>;
        let obj1 = { "_id": "R_A~~1", "num": 1, "a_y": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj1); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a1", "R_A~~1"], value: obj1.num}],
            mapDelete: [],
            reduce: [{key: ["a1"], value: obj1.num}],
        }));
        let obj2 = { "_id": "R_A~~2", "num": 5, "a_y": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj2); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a1", "R_A~~2"], value: 5}],
            mapDelete: [],
            reduce: [{key: ["a1"], value: obj1.num + obj2.num}],
        }));
        let obj3 = { "_id": "R_A~~3", "num": 2, "a_y": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj3); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a2", "R_A~~3"], value: obj3.num}],
            mapDelete: [],
            reduce: [{key: ["a2"], value: obj3.num}],
        }));
        let obj4 = { "_id": "R_A~~4", "num": 3, "a_y": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj4); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a2", "R_A~~4"], value: obj4.num}],
            mapDelete: [],
            reduce: [{key: ["a2"], value: obj3.num + obj4.num}],
        }));
        //we need to check that a21 is not taken into account when we only want [a1, a2]
        let obj5 = { "_id": "R_A~~5", "num": 123, "a_y": "a21" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj5); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            map: [{key: ["a21", "R_A~~5"], value: obj5.num}],
            mapDelete: [],
            reduce: [{key: ["a21"], value: obj5.num}],
        }));

        let red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true});
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({startkey: ['0'], endkey: [MAXCHAR], inclusive_start: true, inclusive_end: true});
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num + obj5.num);
        red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: true});
        expect(red).toEqual(obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: false});
        expect(red).toEqual(0);

        let map = await mapReduceView.mapRangeQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapRangeQuery({startkey: ['a1'], endkey: ['a2', MAXCHAR], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num]);
        map = await mapReduceView.mapRangeQuery({startkey: [MINCHAR], endkey: [MAXCHAR, MAXCHAR], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num, obj5.num]);
        map = await mapReduceView.mapRangeQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num, obj3.num]);
        map = await mapReduceView.mapRangeQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: true});
        expect(map).toEqual([obj2.num, obj3.num]);
        map = await mapReduceView.mapRangeQuery({startkey: ['a1', 'R_A~~2'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: false});
        expect(map).toEqual([obj2.num]);
        map = await mapReduceView.mapRangeQuery({startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: false});
        expect(map).toEqual([obj2.num]);

        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: false});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a1'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a1'], inclusive_start: false, inclusive_end: true});
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a1'], inclusive_start: true, inclusive_end: false});
        expect(map).toEqual([]);//this is because start and end are the same but inclusive_end == false
        map = await mapReduceView.mapQuery({startkey: ['a1'], endkey: ['a1'], inclusive_start: false, inclusive_end: false});
        expect(map).toEqual([]);
        map = await mapReduceView.mapQuery({startkey: ['a2'], endkey: ['a2'], inclusive_start: true, inclusive_end: true});
        expect(map).toEqual([obj3.num, obj4.num]);
        
        done();
    });
});
