/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "./frmdb_engine_store";
import { KeyValueStorePouchDB, PouchDB } from "./key_value_store_pouchdb";

import { UserActionEditedFormDataN } from "./domain/event";
import { Fn } from "./domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "./domain/metadata/execution_plan";
import { promise } from "protractor";
import { compileFormula, $s2e } from "./formula_compiler";

describe('FrmdbEngineStore', () => {
    let dataKVS: KeyValueStorePouchDB;
    let locksKVS: KeyValueStorePouchDB;
    let transactionsKVS: KeyValueStorePouchDB;
    let frmdbTStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;


    beforeEach(async (done) => {
        transactionsKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs_tr'));
        dataKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs'));
        locksKVS = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs_lk'));
        await dataKVS.removeAll();
        await locksKVS.removeAll();
        frmdbTStore = new FrmdbEngineStore(transactionsKVS, dataKVS, locksKVS);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });    

    it("Should allow working with MapReduce queries produced by the FormulaCompiler", async (done) => {

        $s2e(Fn.SUMIF(`R_A.num`, `aY == $ROW$.bY`) + ` + 1`)
        await frmdbTStore.putMapReduceQueryForComputingAggs("sum1", {
            entityName: 'R_A',
            keyExpr: [$s2e(`aY`)],
            valueExpr: $s2e(`num`),
        }, '_sum');

        await frmdbTStore.kvs().put({ "_id": "R_A~~1", "num": 1, "aY": "a1" });
        await frmdbTStore.kvs().put({ "_id": "R_A~~2", "num": 5, "aY": "a1" });
        await frmdbTStore.kvs().put({ "_id": "R_A~~3", "num": 2, "aY": "a2" });
        await frmdbTStore.kvs().put({ "_id": "R_A~~4", "num": 3, "aY": "a2" });

        let qRes = await frmdbTStore.kvs().mapReduceQuery('sum1', { reduce: false });
        let expQRes = [
            { "key": ["a1"], "id": "R_A~~1", "value": 1 },
            { "key": ["a1"], "id": "R_A~~2", "value": 5 },
            { "key": ["a2"], "id": "R_A~~3", "value": 2 },
            { "key": ["a2"], "id": "R_A~~4", "value": 3 },
        ];
        expect(qRes.rows).toEqual(expQRes);

        qRes = await frmdbTStore.kvs().mapReduceQuery('sum1', { reduce: false, include_docs: true });
        let expQRes2 = [
            {"key":["a1"],"id":"R_A~~1","value":1,"doc":{"num":1,"aY":"a1","_id":"R_A~~1"}},
            {"key":["a1"],"id":"R_A~~2","value":5,"doc":{"num":5,"aY":"a1","_id":"R_A~~2"}},
            {"key":["a2"],"id":"R_A~~3","value":2,"doc":{"num":2,"aY":"a2","_id":"R_A~~3"}},
            {"key":["a2"],"id":"R_A~~4","value":3,"doc":{"num":3,"aY":"a2","_id":"R_A~~4"}}
        ];
        expect(qRes.rows.map(_.partialRight(_.omit, 'doc._rev'))).toEqual(expQRes2);

        let ret = await frmdbTStore.mapReduceQueryForObj({ $ROW$: { bY: 'a1' } }, "sum1", {
            startkeyExpr: [$s2e(`$ROW$.bY`)],
            endkeyExpr: [$s2e(`$ROW$.bY`)],
            inclusive_start: true,
            inclusive_end: true,
        })
        expect(ret.rows).toEqual([{ "value": 6, "key": null }]);

        done();
    });

    it("Should allow CAS transactions (super-duper-basic test)", async (done) => {
        await frmdbTStore.kvs().put({ "_id": "obj1", "idx": 1});

        let counter = 1;

        async function incrementCounter() {
            // let obj1 = await frmdbTStore.kvs().get<{_id: string, idx: number}>("obj1");
            // obj1.idx = obj1.idx + 1;
            counter = counter + 1;
            // await frmdbTStore.kvs().put(obj1);
        }

        async function parallelWorker(eventId) {
            await frmdbTStore.lockObjs("event" + eventId, ["obj1"], incrementCounter, () => Promise.resolve(), 20);
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
        compiledFormula = compileFormula('B', 'sum__', Fn.SUMIF(`A.num`,`aY == $ROW$.bY`));
        await frmdbTStore.installFormula(compiledFormula);

        let a1  = { "_id": "A~~1", "num": 1, "aY": "a1" }; await frmdbTStore.kvs().put(a1);
        let a1b = { "_id": "A~~2", "num": 5, "aY": "a1" }; await frmdbTStore.kvs().put(a1b);
        let a2  = { "_id": "A~~3", "num": 2, "aY": "a2" }; await frmdbTStore.kvs().put(a2);
        let a2b = { "_id": "A~~4", "num": 3, "aY": "a2" }; await frmdbTStore.kvs().put(a1b);
        let b1  = { "_id": "B~~1", "sum__": -1, "bY": "a1" }; await frmdbTStore.kvs().put(b1);
        let b2  = { "_id": "B~~2", "sum__": -2, "bY": "a2" }; await frmdbTStore.kvs().put(b2);
        
        let designDocs = await frmdbTStore.kvs().range('_design', '_design', false);

        let obs1 = await frmdbTStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
        expect(obs1[0]).toEqual(b1);

        let obss = await frmdbTStore.getObserversOfObservableOldAndNew(a1, a2, compiledFormula.triggers![0])
        expect(obss[0]).toEqual(b1);
        expect(obss[1]).toEqual(b2);

        let sum = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(sum).toEqual(6);

        let a1new = _.cloneDeep(a1);
        a1new.num = 2;
        sum = await frmdbTStore.preComputeAggForObserverAndObservable(b1, a1, a1new, compiledFormula.triggers![0]);
        expect(sum).toEqual(7);
        
        await frmdbTStore.kvs().put(a1new);
        sum = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(sum).toEqual(7);
        
        done();
    });

    describe('Table Relationships', () => {
        it("B.sum__ SUM(A$.num) means A is SUB_TABLE of B or A BELONGS_TO B", async (done) => {
            compiledFormula = compileFormula('B', 'sum__', 'SUM(A__of__myB.num)');
            await frmdbTStore.installFormula(compiledFormula);

            let a1  = { _id: "A~~1", B$myB: {_id: 'B~~1'}, num: 1 }; await frmdbTStore.kvs().put(a1);
            let a1b = { _id: "A~~2", B$myB: {_id: 'B~~1'}, num: 5 }; await frmdbTStore.kvs().put(a1b);
            let a2  = { _id: "A~~3", B$myB: {_id: 'B~~2'}, num: 2 }; await frmdbTStore.kvs().put(a2);
            let a2b = { _id: "A~~4", B$myB: {_id: 'B~~2'}, num: 3 }; await frmdbTStore.kvs().put(a2b);
            let b1  = { _id: "B~~1", 'sum__': -123 }; await frmdbTStore.kvs().put(b1);
            let b2  = { _id: "B~~2", 'sum__': -123 }; await frmdbTStore.kvs().put(b2);
            
            let designDocs = await frmdbTStore.kvs().range('_design/', '_design0', false);

            let obs1 = await frmdbTStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
            expect(obs1[0]).toEqual(b1);

            let obss = await frmdbTStore.getObserversOfObservableOldAndNew(a1, a2, compiledFormula.triggers![0])
            expect(obss[0]).toEqual(b1);
            expect(obss[1]).toEqual(b2);

            let aggsViewName = compiledFormula.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;
            let tmp = await frmdbTStore.mapReduceQuery(aggsViewName, {
                startkey: [null],
                endkey: ['ZZZZZ'],
                inclusive_start: false,
                inclusive_end: false,
                reduce: false,
            });
                
            let sum = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
            expect(sum).toEqual(6);

            let a1new = _.cloneDeep(a1);
            a1new.num = 2;
            sum = await frmdbTStore.preComputeAggForObserverAndObservable(b1, a1, a1new, compiledFormula.triggers![0]);
            expect(sum).toEqual(7);
            
            await frmdbTStore.kvs().put(a1new);
            sum = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
            expect(sum).toEqual(7);
            
            done();
        });
    });
});
