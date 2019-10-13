/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";

import { Fn } from "@domain/metadata/functions";
import { CompiledFormula } from "@domain/metadata/execution_plan";
import { compileFormula } from './formula_compiler';
import { getFrmdbEngineStore, getTestFrmdbEngineStore } from '@storage/key_value_store_impl_selector';
import { SumReduceFunN } from "@domain/metadata/reduce_functions";
import { Pn, Entity, Schema } from "@domain/metadata/entity";
import { $s2e } from "@functions/s2e";
import { frmdbxit } from "@fe/fe-test-urils.spec";

const TestSchema: Schema = {
    _id: "FRMDB_SCHEMA",
    entities: {
        A: {
            _id: 'A', props: {
                _id: { name: "_id", propType_: Pn.STRING },
                num: { name: "num", propType_: Pn.NUMBER },
                a_y: { name: "a_y", propType_: Pn.STRING },
            },
        } as Entity,
        B: {
            _id: 'B', props: {
                _id: { name: "_id", propType_: Pn.STRING },
                num: { name: "sum__", propType_: Pn.NUMBER },
                a_y: { name: "b_y", propType_: Pn.STRING },
            },
        } as Entity,
    }
};

describe('frmdb_engine_store', () => {
    let frmdbEngineStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;


    beforeEach(async (done) => {
        frmdbEngineStore = await getTestFrmdbEngineStore(TestSchema);
        await frmdbEngineStore.kvsFactory.clearAllForTestingPurposes();
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        done();
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("Should allow working with MapReduce queries produced by the FormulaCompiler", async (done) => {

        $s2e(Fn.SUMIF(`A.num`, `a_y == @[b_y]`) + ` + 1`)
        await frmdbEngineStore.createMapReduceView("sum1", {
            entityId: 'A',
            keyExpr: [$s2e(`a_y`)],
            valueExpr: $s2e(`num`),
        }, false, {name: SumReduceFunN});

        let obj1 = { "_id": "A~~1", "num": 1, "a_y": "a1" }; await frmdbEngineStore.putDataObj(obj1); await frmdbEngineStore.forceUpdateViewForObj('sum1', null, obj1);
        let obj2 = { "_id": "A~~2", "num": 5, "a_y": "a1" }; await frmdbEngineStore.putDataObj(obj2); await frmdbEngineStore.forceUpdateViewForObj('sum1', null, obj2);
        let obj3 = { "_id": "A~~3", "num": 2, "a_y": "a2" }; await frmdbEngineStore.putDataObj(obj3); await frmdbEngineStore.forceUpdateViewForObj('sum1', null, obj3);
        let obj4 = { "_id": "A~~4", "num": 3, "a_y": "a2" }; await frmdbEngineStore.putDataObj(obj4); await frmdbEngineStore.forceUpdateViewForObj('sum1', null, obj4);

        let qRes = await frmdbEngineStore.mapQueryWithKeys('sum1');
        let expQRes = [
            { _id: ["a1", "A~~1"], val: 1 },
            { _id: ["a1", "A~~2"], val: 5 },
            { _id: ["a2", "A~~3"], val: 2 },
            { _id: ["a2", "A~~4"], val: 3 },
        ];
        expect(qRes).toEqual(expQRes);

        let rRes = await frmdbEngineStore.reduceQuery('sum1');
        expect(rRes).toEqual(11);
        rRes = await frmdbEngineStore.reduceQuery('sum1', {startkey: ['a1'], inclusive_start: true, endkey: ['a1'], inclusive_end: true});
        expect(rRes).toEqual(6);
        rRes = await frmdbEngineStore.reduceQuery('sum1', {startkey: ['a2'], inclusive_start: true, endkey: ['a2'], inclusive_end: true});
        expect(rRes).toEqual(5);

        done();
    });

    frmdbxit("Should replay crashed CAS transactions correctly", async (done) => {
        //TODO: only one worker should get the lock and finish processing the crashed transaction
    });

    async function putAndForceUpdateView(objOld, objNew, isAggs: boolean) {
        await frmdbEngineStore.putDataObj(objNew); 
        if (isAggs) {
            await frmdbEngineStore.forceUpdateViewForObj(compiledFormula.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, objOld, objNew);
        } else {
            await frmdbEngineStore.forceUpdateViewForObj(compiledFormula.triggers![0].mapObserversImpactedByOneObservable.obsViewName, objOld, objNew);
        }
    }
    
    it("Should allow to install formulas then query observers and aggregations", async (done) => {
        let formula = 'SUMIF(A.num, a_y == @[b_y])';
        compiledFormula = compileFormula('B', 'sum__', formula);
        await frmdbEngineStore.installFormula(compiledFormula);

        let a1  = { "_id": "A~~1", "num": 1, "a_y": "a1" }; await putAndForceUpdateView(null, a1, true);
        let a1b = { "_id": "A~~2", "num": 5, "a_y": "a1" }; await putAndForceUpdateView(null, a1b, true);
        let a2  = { "_id": "A~~3", "num": 2, "a_y": "a2" }; await putAndForceUpdateView(null, a2, true);
        let a2b = { "_id": "A~~4", "num": 3, "a_y": "a2" }; await putAndForceUpdateView(null, a2b, true);
        let b1  = { "_id": "B~~1", "sum__": -1, "b_y": "a1" }; await putAndForceUpdateView(null, b1, false);
        let b2  = { "_id": "B~~2", "sum__": -2, "b_y": "a2" }; await putAndForceUpdateView(null, b2, false);
        
        let obs1 = await frmdbEngineStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
        expect(obs1[0]).toEqual(b1);

        let obss = await frmdbEngineStore.getObserversOfObservableOldAndNew(a1, a2, compiledFormula.triggers![0])
        expect(obss[0]).toEqual(b1);
        expect(obss[1]).toEqual(b2);

        let sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(sum).toEqual(6);

        // sum = await frmdbEngineStore.adHocFormulaQuery(b1, compiledFormula);
        // expect(sum).toEqual(6);
        // sum = await frmdbEngineStore.adHocFormulaQuery(b2, compiledFormula);
        // expect(sum).toEqual(5);

        let bEntity: Entity = {
            _id: 'B',
            props: {
                sum__: { name: 'sum__', propType_: Pn.FORMULA, formula: formula, compiledFormula_: compiledFormula}
            }
        };
        // let bTable = await frmdbEngineStore.adHocTableQuery(bEntity);
        // expect(bTable[0]).toEqual(jasmine.objectContaining({_id: 'B~~1', sum__: 6, b_y: 'a1'}));
        // expect(bTable[1]).toEqual(jasmine.objectContaining({_id: 'B~~2', sum__: 5, b_y: 'a2'}));

        let a1new = _.cloneDeep(a1);
        a1new.num = 2;
        sum = await frmdbEngineStore.preComputeAggForObserverAndObservable(b1, a1, a1new, compiledFormula.triggers![0]);
        expect(sum).toEqual(7);
        
        await putAndForceUpdateView(a1, a1new, true);
        sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(sum).toEqual(7);
        // sum = await frmdbEngineStore.adHocFormulaQuery(b1, compiledFormula);
        // expect(sum).toEqual(7);

        // bTable = await frmdbEngineStore.adHocTableQuery(bEntity);
        // expect(bTable[0]).toEqual(jasmine.objectContaining({_id: 'B~~1', sum__: 7, b_y: 'a1'}));
        // expect(bTable[1]).toEqual(jasmine.objectContaining({_id: 'B~~2', sum__: 5, b_y: 'a2'}));
        
        done();
    });

    describe('TablePage Relationships', () => {
        it("example REFERENCE_TO by _id", async (done) => {
            compiledFormula = compileFormula('B', 'sum__', 'SUMIF(A.num, B$myB._id == @[_id])');
            await frmdbEngineStore.installFormula(compiledFormula);

            let a1  = { _id: "A~~1", B$myB: {_id: 'B~~1'}, num: 1 }; await putAndForceUpdateView(null, a1, true);
            let a1b = { _id: "A~~2", B$myB: {_id: 'B~~1'}, num: 5 }; await putAndForceUpdateView(null, a1b, true);
            let a2  = { _id: "A~~3", B$myB: {_id: 'B~~2'}, num: 2 }; await putAndForceUpdateView(null, a2, true);
            let a2b = { _id: "A~~4", B$myB: {_id: 'B~~2'}, num: 3 }; await putAndForceUpdateView(null, a2b, true);
            let b1  = { _id: "B~~1", 'sum__': -123 }; await putAndForceUpdateView(null, b1, false);
            let b2  = { _id: "B~~2", 'sum__': -123 }; await putAndForceUpdateView(null, b2, false);
            
            let obs1 = await frmdbEngineStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
            expect(obs1[0]).toEqual(b1);

            let obss = await frmdbEngineStore.getObserversOfObservableOldAndNew(a1, a2, compiledFormula.triggers![0])
            expect(obss[0]).toEqual(b1);
            expect(obss[1]).toEqual(b2);
                
            let sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
            expect(sum).toEqual(6);

            let a1new = _.cloneDeep(a1);
            a1new.num = 2;
            sum = await frmdbEngineStore.preComputeAggForObserverAndObservable(b1, a1, a1new, compiledFormula.triggers![0]);
            expect(sum).toEqual(7);
            
            await putAndForceUpdateView(a1, a1new, true);
            sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
            expect(sum).toEqual(7);
            
            done();
        });
    });
});
