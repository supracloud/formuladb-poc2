import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';
import { MapReduceView, MapReduceViewUpdates } from "./map_reduce_view";
import { $s2e } from '@functions/s2e';
import { SumReduceFunN } from "@domain/metadata/reduce_functions";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { MINCHAR, MAXCHAR } from '@storage/collator';
import { KeyValueObj } from '@functions/key_value_obj';

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */


describe('MapReduceView', () => {
    let kvsFactory: KeyValueStoreFactoryI;

    beforeAll(async () => {
        kvsFactory = await getKeyValueStoreFactory();
        await kvsFactory.clearAllForTestingPurposes();
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    });

    it('should pre-compute and compute basic SUM', async () => {
        let mapReduceView = new MapReduceView(kvsFactory, "tst", "desc", {
            entityId: 'A',
            keyExpr: [$s2e(`a_y`)],
            valueExpr: $s2e(`num`),
        }, false, { name: SumReduceFunN });

        let updates: MapReduceViewUpdates<number | string>;
        let obj1 = { "_id": "R_A~~1", "num": 1, "a_y": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj1); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            objChanges: [{
                type: "add",
                objId: "R_A~~1",
                keyToSet: ["a1", "R_A~~1"],
                newMapKey: ["a1"],
                newMapValue: obj1.num,
            }],
            reduceChanges: { "a1": obj1.num }
        }));

        let obj2 = { "_id": "R_A~~2", "num": 5, "a_y": "a1" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj2); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            objChanges: [{ type: "add", objId: "R_A~~2", keyToSet: ["a1", "R_A~~2"], newMapKey: ["a1"], newMapValue: obj2.num }],
            reduceChanges: { "a1": obj1.num + obj2.num },
        }));
        let obj3 = { "_id": "R_A~~3", "num": 2, "a_y": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj3); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            objChanges: [{ type: "add", objId: "R_A~~3", keyToSet: ["a2", "R_A~~3"], newMapKey: ["a2"], newMapValue: obj3.num }],
            reduceChanges: { "a2": obj3.num },
        }));
        let obj4 = { "_id": "R_A~~4", "num": 3, "a_y": "a2" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj4); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            objChanges: [{ type: "add", objId: "R_A~~4", keyToSet: ["a2", "R_A~~4"], newMapKey: ["a2"], newMapValue: obj4.num }],
            reduceChanges: { "a2": obj3.num + obj4.num },
        }));
        //we need to check that a21 is not taken into account when we only want [a1, a2]
        let obj5 = { "_id": "R_A~~5", "num": 123, "a_y": "a21" }; updates = await mapReduceView.preComputeViewUpdateForObj(null, obj5); await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual(jasmine.objectContaining({
            objChanges: [{ type: "add", objId: "R_A~~5", keyToSet: ["a21", "R_A~~5"], newMapKey: ["a21"], newMapValue: obj5.num }],
            reduceChanges: { "a21": obj5.num },
        }));

        let red = await mapReduceView.reduceQuery({ startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true });
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({ startkey: ['0'], endkey: [MAXCHAR], inclusive_start: true, inclusive_end: true });
        expect(red).toEqual(obj1.num + obj2.num + obj3.num + obj4.num + obj5.num);
        red = await mapReduceView.reduceQuery({ startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: true });
        expect(red).toEqual(obj3.num + obj4.num);
        red = await mapReduceView.reduceQuery({ startkey: ['a1'], endkey: ['a2'], inclusive_start: false, inclusive_end: false });
        expect(red).toEqual(0);

        let map = await mapReduceView.mapRangeQuery({ startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: ['a1'], endkey: ['a2', MAXCHAR], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: [MINCHAR], endkey: [MAXCHAR, MAXCHAR], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num, obj3.num, obj4.num, obj5.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num, obj3.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: true });
        expect(map).toEqual([obj2.num, obj3.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: ['a1', 'R_A~~2'], endkey: ['a2', 'R_A~~3'], inclusive_start: true, inclusive_end: false });
        expect(map).toEqual([obj2.num]);
        map = await mapReduceView.mapRangeQuery({ startkey: ['a1', 'R_A~~1'], endkey: ['a2', 'R_A~~3'], inclusive_start: false, inclusive_end: false });
        expect(map).toEqual([obj2.num]);

        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a2'], inclusive_start: true, inclusive_end: false });
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a1'], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a1'], inclusive_start: false, inclusive_end: true });
        expect(map).toEqual([obj1.num, obj2.num]);
        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a1'], inclusive_start: true, inclusive_end: false });
        expect(map).toEqual([]);//this is because start and end are the same but inclusive_end == false
        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a1'], inclusive_start: false, inclusive_end: false });
        expect(map).toEqual([]);
        map = await mapReduceView.mapQuery({ startkey: ['a2'], endkey: ['a2'], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj3.num, obj4.num]);

        let obj6 = { "_id": "R_A~~6", "num": 10, "a_y": "a1" };
        let obj2New = { "_id": "R_A~~2", "num": 100, "a_y": "a1" }
        updates = await mapReduceView.preComputeViewUpdateForObjs([
            { oldObj: null, newObj: obj6 as KeyValueObj},
            { oldObj: obj2 as KeyValueObj, newObj: obj2New as KeyValueObj},
            { oldObj: obj1 as KeyValueObj, newObj: null }
        ]); 
        await mapReduceView.updateViewForObj(updates);
        expect(updates).toEqual({
            viewHashCode: 'tst',
            objChanges: [
                { type: "add", objId: "R_A~~6", keyToSet: ["a1", "R_A~~6"], newMapKey: ["a1"], newMapValue: obj6.num },
                { type: "modify", objId: "R_A~~2", keyToSet: ["a1", "R_A~~2"], oldMapKey: ["a1"], oldMapValue: obj2.num, newMapKey: ["a1"], newMapValue: obj2New.num },
                { type: "delete", objId: "R_A~~1", keyToDelete: ["a1", "R_A~~1"], oldMapKey: ["a1"], oldMapValue: obj1.num },
            ],
            reduceChanges: { "a1": obj2New.num + obj6.num },
        } as any);
        map = await mapReduceView.mapQuery({ startkey: ['a1'], endkey: ['a1'], inclusive_start: true, inclusive_end: true });
        expect(map).toEqual([obj2New.num, obj6.num]);
    });
});
