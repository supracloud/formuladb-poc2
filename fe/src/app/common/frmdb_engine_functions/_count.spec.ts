/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { PouchDB, KeyValueStorePouchDB } from "../key_value_store_pouchdb";

import { UserActionEditedFormDataN } from "../domain/event";
import { Fn } from "../domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "../domain/metadata/execution_plan";
import { promise } from "protractor";
import { compileFormula, $s2e } from "../formula_compiler";
import { evalExprES5 } from "../map_reduce_utils";

describe('FrmdbEngineStore _count', () => {
    let dataKVS: KeyValueStorePouchDB;
    let transactionsKVS: KeyValueStorePouchDB;
    let locksKVS: KeyValueStorePouchDB;
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

    function $s(f: (...args) => any) {
        return f.toString().replace(/\w+\.Fn\./, '').replace(/^function\s*\(.*?\)\s*\{\s*return\s*/, '').replace(/;\s*\}$/, '');
    }

    const rank1 = Fn.RANK(`[FLOOR($ROW$.x/4) * 4, $ROW$.x]`, Fn._MAP(`A.x`, `[FLOOR(x/4) * 4, x]`));
    it("simple one table RANK formula: " + rank1, async (done) => {
        let formula = rank1;
        compiledFormula = compileFormula('A', 'idx=', formula);
        await frmdbTStore.installFormula(compiledFormula);

        let a1 = { "_id": "A~~1", "x": 1 }; await frmdbTStore.kvs().put(a1);
        let a2 = { "_id": "A~~2", "x": 3 }; await frmdbTStore.kvs().put(a2);
        let a3 = { "_id": "A~~3", "x": 5 }; await frmdbTStore.kvs().put(a3);
        let a4 = { "_id": "A~~4", "x": 7 }; await frmdbTStore.kvs().put(a4);

        let designDocs = await frmdbTStore.kvs().range('_design', '_design', false);
        
        let f = Fn.FLOOR(`x/4`, `1`) + ` * 4`;
        let x = evalExprES5(a3, $s2e(f));

        let obs1 = await frmdbTStore.getObserversOfObservable(a3, compiledFormula.triggers![0]);
        expect(obs1.length).toEqual(2);
        expect(obs1[0]).toEqual(a3);
        expect(obs1[1]).toEqual(a4);

        obs1 = await frmdbTStore.getObserversOfObservable(a2, compiledFormula.triggers![0]);
        expect(obs1.length).toEqual(2);
        expect(obs1[0]).toEqual(a1);
        expect(obs1[1]).toEqual(a2);

        let a2new = _.cloneDeep(a2);
        a2new.x = 6;
        let obss = await frmdbTStore.getObserversOfObservableOldAndNew(a2, a2new, compiledFormula.triggers![0])
        expect(obss.length).toEqual(4);
        expect(obss[0]).toEqual(a1);
        expect(obss[1]).toEqual(a2);
        expect(obss[2]).toEqual(a3);
        expect(obss[3]).toEqual(a4);

        let count = await frmdbTStore.getAggValueForObserver(a1, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.getAggValueForObserver(a2, compiledFormula.triggers![0]);
        expect(count).toEqual(2);
        count = await frmdbTStore.getAggValueForObserver(a3, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.getAggValueForObserver(a4, compiledFormula.triggers![0]);
        expect(count).toEqual(2);
        count = await frmdbTStore.getAggValueForObserver(a4, compiledFormula.triggers![0]);
        expect(count).toEqual(2);

        count = await frmdbTStore.preComputeAggForObserverAndObservable(a1, a2, a2new, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.preComputeAggForObserverAndObservable(a3, a2, a2new, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.preComputeAggForObserverAndObservable(a4, a2, a2new, compiledFormula.triggers![0]);
        expect(count).toEqual(3);

        done();

    });


    const rank2 = Fn.RANK(`[FLOOR($ROW$.idx/4) * 4, $ROW$.idx]`, Fn._MAP(`A.x`, `[FLOOR(x/4) * 4, x]`));
    it("two table RANK formula: " + rank2, async (done) => {

        let formula = rank2;
        compiledFormula = compileFormula('B', 'rank=', formula);
        await frmdbTStore.installFormula(compiledFormula);

        let a1 = { "_id": "A~~1", "x": 1 }; await frmdbTStore.kvs().put(a1);
        let a2 = { "_id": "A~~2", "x": 3 }; await frmdbTStore.kvs().put(a2);
        let a3 = { "_id": "A~~3", "x": 5 }; await frmdbTStore.kvs().put(a3);
        let a4 = { "_id": "A~~4", "x": 6 }; await frmdbTStore.kvs().put(a4);

        let b1 = { "_id": "B~~1", "idx": 2 }; await frmdbTStore.kvs().put(b1);
        let b2 = { "_id": "B~~2", "idx": 7 }; await frmdbTStore.kvs().put(b2);

        let obsIndex = await frmdbTStore.debugGetAll(compiledFormula.triggers![0].mapObserversImpactedByOneObservable.obsViewName);
        let aggsIndex = await frmdbTStore.debugGetAll(compiledFormula.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName);

        let obs = await frmdbTStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
        expect(obs.length).toEqual(1);
        expect(obs[0]).toEqual(b1);
        obs = await frmdbTStore.getObserversOfObservable(a2, compiledFormula.triggers![0]);
        expect(obs.length).toEqual(1);
        expect(obs[0]).toEqual(b1);
        obs = await frmdbTStore.getObserversOfObservable(a3, compiledFormula.triggers![0]);
        expect(obs.length).toEqual(1);
        expect(obs[0]).toEqual(b2);
        obs = await frmdbTStore.getObserversOfObservable(a4, compiledFormula.triggers![0]);
        expect(obs.length).toEqual(1);
        expect(obs[0]).toEqual(b2);

        let a2new = _.cloneDeep(a2);
        a2new.x = 6;
        let obss = await frmdbTStore.getObserversOfObservableOldAndNew(a2, a2new, compiledFormula.triggers![0])
        expect(obss.length).toEqual(2);
        expect(obss[0]).toEqual(b1);
        expect(obss[1]).toEqual(b2);

        let count = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.getAggValueForObserver(b2, compiledFormula.triggers![0]);
        expect(count).toEqual(2);

        count = await frmdbTStore.preComputeAggForObserverAndObservable(b1, a2, a2new, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.preComputeAggForObserverAndObservable(b2, a2, a2new, compiledFormula.triggers![0]);
        expect(count).toEqual(3);

        await frmdbTStore.kvs().put(a2new);
        count = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.getAggValueForObserver(b2, compiledFormula.triggers![0]);
        expect(count).toEqual(3);

        done();

    });
    
});
