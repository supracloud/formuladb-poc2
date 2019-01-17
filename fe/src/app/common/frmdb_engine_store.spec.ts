/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";
import { KeyObjStoreI, KeyValueStoreFactoryI } from "./key_value_store_i";

import { Fn } from "./domain/metadata/functions";
import { CompiledFormula } from "./domain/metadata/execution_plan";
import { compileFormula, $s2e } from "./formula_compiler";
import { KeyValueStoreMem, KeyValueStoreFactoryMem } from "./key_value_store_mem";
import { SumReduceFunN } from "./domain/metadata/reduce_functions";

describe('frmdb_engine_store', () => {
    let kvsFactory: KeyValueStoreFactoryI;
    let frmdbEngineStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;


    beforeEach(async (done) => {
        kvsFactory = new KeyValueStoreFactoryMem();
        frmdbEngineStore = new FrmdbEngineStore(kvsFactory);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    fit("Should allow working with MapReduce queries produced by the FormulaCompiler", async (done) => {

        $s2e(Fn.SUMIF(`R_A.num`, `aY == @[bY]`) + ` + 1`)
        await frmdbEngineStore.createMapReduceView("sum1", {
            entityName: 'R_A',
            keyExpr: [$s2e(`aY`)],
            valueExpr: $s2e(`num`),
        }, false, {name: SumReduceFunN});

        let obj1 = { "_id": "R_A~~1", "num": 1, "aY": "a1" }; await frmdbEngineStore.putDataObj(obj1); await frmdbEngineStore.updateViewForObj('sum1', null, obj1);
        let obj2 = { "_id": "R_A~~2", "num": 5, "aY": "a1" }; await frmdbEngineStore.putDataObj(obj2); await frmdbEngineStore.updateViewForObj('sum1', null, obj2);
        let obj3 = { "_id": "R_A~~3", "num": 2, "aY": "a2" }; await frmdbEngineStore.putDataObj(obj3); await frmdbEngineStore.updateViewForObj('sum1', null, obj3);
        let obj4 = { "_id": "R_A~~4", "num": 3, "aY": "a2" }; await frmdbEngineStore.putDataObj(obj4); await frmdbEngineStore.updateViewForObj('sum1', null, obj4);

        let qRes = await frmdbEngineStore.mapQueryWithKeys('sum1');
        let expQRes = [
            { key: ["a1", "R_A~~1"], val: 1 },
            { key: ["a1", "R_A~~2"], val: 5 },
            { key: ["a2", "R_A~~3"], val: 2 },
            { key: ["a2", "R_A~~4"], val: 3 },
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

    xit("Should allow CAS transactions (super-duper-basic test)", async (done) => {
        await frmdbEngineStore.putDataObj({ "_id": "obj1", "idx": 1});

        let counter = 1;

        async function incrementCounter() {
            // let obj1 = await frmdbTStore.kvs().get<{_id: string, idx: number}>("obj1");
            // obj1.idx = obj1.idx + 1;
            counter = counter + 1;
            // await frmdbTStore.putDataObj(obj1);
        }

        async function parallelWorker(eventId) {
            // await frmdbTStore.lockObjs("event" + eventId, ["obj1"], incrementCounter, () => Promise.resolve(), 20);
        }
        let workers: Promise<void>[] = [];
        for (var i = 0; i < 20; i++) {
            workers.push(parallelWorker(i));
        }
        await Promise.all(workers);

        // let obj1 = await frmdbTStore.kvs().get<{_id: string, idx: number}>("obj1");
        // expect(obj1.idx).toEqual(21);
        expect(counter).toEqual(21);

        done();
    });

    xit("Should replay crashed CAS transactions correctly", async (done) => {
        //TODO: only one worker should get the lock and finish processing the crashed transaction
    });

    it("Should allow to install formulas then query observers and aggregations", async (done) => {
        compiledFormula = compileFormula('B', 'sum__', Fn.SUMIF(`A.num`,`aY == @[bY]`));
        await frmdbEngineStore.installFormula(compiledFormula);

        let a1  = { "_id": "A~~1", "num": 1, "aY": "a1" }; await frmdbEngineStore.putDataObj(a1);
        let a1b = { "_id": "A~~2", "num": 5, "aY": "a1" }; await frmdbEngineStore.putDataObj(a1b);
        let a2  = { "_id": "A~~3", "num": 2, "aY": "a2" }; await frmdbEngineStore.putDataObj(a2);
        let a2b = { "_id": "A~~4", "num": 3, "aY": "a2" }; await frmdbEngineStore.putDataObj(a1b);
        let b1  = { "_id": "B~~1", "sum__": -1, "bY": "a1" }; await frmdbEngineStore.putDataObj(b1);
        let b2  = { "_id": "B~~2", "sum__": -2, "bY": "a2" }; await frmdbEngineStore.putDataObj(b2);
        
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
        
        await frmdbEngineStore.putDataObj(a1new);
        sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(sum).toEqual(7);
        
        done();
    });

    describe('Table Relationships', () => {
        it("example REFERENCE_TO by _id", async (done) => {
            compiledFormula = compileFormula('B', 'sum__', 'SUMIF(A.num, B$myB._id == @[_id])');
            await frmdbEngineStore.installFormula(compiledFormula);

            let a1  = { _id: "A~~1", B$myB: {_id: 'B~~1'}, num: 1 }; await frmdbEngineStore.putDataObj(a1);
            let a1b = { _id: "A~~2", B$myB: {_id: 'B~~1'}, num: 5 }; await frmdbEngineStore.putDataObj(a1b);
            let a2  = { _id: "A~~3", B$myB: {_id: 'B~~2'}, num: 2 }; await frmdbEngineStore.putDataObj(a2);
            let a2b = { _id: "A~~4", B$myB: {_id: 'B~~2'}, num: 3 }; await frmdbEngineStore.putDataObj(a2b);
            let b1  = { _id: "B~~1", 'sum__': -123 }; await frmdbEngineStore.putDataObj(b1);
            let b2  = { _id: "B~~2", 'sum__': -123 }; await frmdbEngineStore.putDataObj(b2);
            
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
            
            await frmdbEngineStore.putDataObj(a1new);
            sum = await frmdbEngineStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
            expect(sum).toEqual(7);
            
            done();
        });
    });
});
