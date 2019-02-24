/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../frmdb_engine_store";

import { ServerEventModifiedFormDataN } from "@core/domain/event";
import { Fn } from "@core/domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "@core/domain/metadata/execution_plan";
import { compileFormula, $s2e } from '../formula_compiler';
import { evalExpression } from "../map_reduce_utils";
import { getFrmdbEngineStore } from '@storage/key_value_store_impl_selector';
import { Schema, Pn, Entity } from "@core/domain/metadata/entity";

const TestSchema: Schema = {
    _id: "FRMDB_SCHEMA",
    entities: {
        A: {
            _id: 'A', props: {
                _id: { name: "_id", propType_: Pn.STRING },
                x: { name: "x", propType_: Pn.NUMBER },
            },
        } as Entity,
        B: {
            _id: 'B', props: {
                _id: { name: "_id", propType_: Pn.STRING },
                idx: { name: "idx", propType_: Pn.NUMBER },
            },
        } as Entity,
    }
};

describe('FrmdbEngineStore _count', () => {
    let frmdbTStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;

    async function putAndForceUpdateView(objOld, objNew, isAggs: boolean) {
        await frmdbTStore.putDataObj(objNew); 
        if (isAggs) {
            await frmdbTStore.forceUpdateViewForObj(compiledFormula.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, objOld, objNew);
        } else {
            await frmdbTStore.forceUpdateViewForObj(compiledFormula.triggers![0].mapObserversImpactedByOneObservable.obsViewName, objOld, objNew);
        }
    }

    beforeEach(async (done) => {
        frmdbTStore = await getFrmdbEngineStore(TestSchema);
        await frmdbTStore.kvsFactory.clearAll();
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

    const rank1 = Fn.RANK(`[FLOOR(@[x]/4) * 4, @[x]]`, Fn._MAP(`A.x`, `[FLOOR(x/4) * 4, x]`));
    it("simple one table RANK formula: " + rank1, async (done) => {
        let formula = rank1;
        compiledFormula = compileFormula('A', 'idx', formula);
        await frmdbTStore.installFormula(compiledFormula);

        let a1 = { "_id": "A~~1", "x": 1 }; await putAndForceUpdateView(null, a1, true); await putAndForceUpdateView(null, a1, false);
        let a2 = { "_id": "A~~2", "x": 3 }; await putAndForceUpdateView(null, a2, true); await putAndForceUpdateView(null, a2, false);
        let a3 = { "_id": "A~~3", "x": 5 }; await putAndForceUpdateView(null, a3, true); await putAndForceUpdateView(null, a3, false);
        let a4 = { "_id": "A~~4", "x": 7 }; await putAndForceUpdateView(null, a4, true); await putAndForceUpdateView(null, a4, false);

        let f = Fn.FLOOR(`x/4`, `1`) + ` * 4`;
        let x = evalExpression(a3, $s2e(f));

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


    const rank2 = 'RANK([FLOOR(@[idx]/4) * 4, @[idx]], _MAP(A.x, [FLOOR(x/4) * 4, x]))';
    it("two table RANK formula: " + rank2, async (done) => {

        let formula = rank2;
        compiledFormula = compileFormula('B', 'rank', formula);
        await frmdbTStore.installFormula(compiledFormula);

        let a1 = { "_id": "A~~1", "x": 1 }; await putAndForceUpdateView(null, a1, true);
        let a2 = { "_id": "A~~2", "x": 3 }; await putAndForceUpdateView(null, a2, true);
        let a3 = { "_id": "A~~3", "x": 5 }; await putAndForceUpdateView(null, a3, true);
        let a4 = { "_id": "A~~4", "x": 6 }; await putAndForceUpdateView(null, a4, true);

        let b1 = { "_id": "B~~1", "idx": 2 }; await putAndForceUpdateView(null, b1, false);
        let b2 = { "_id": "B~~2", "idx": 7 }; await putAndForceUpdateView(null, b2, false);

        let obsIndex = await frmdbTStore.mapQuery(compiledFormula.triggers![0].mapObserversImpactedByOneObservable.obsViewName);
        let aggsIndex = await frmdbTStore.mapQuery(compiledFormula.triggers![0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName);

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

        await putAndForceUpdateView(a2, a2new, true);
        count = await frmdbTStore.getAggValueForObserver(b1, compiledFormula.triggers![0]);
        expect(count).toEqual(1);
        count = await frmdbTStore.getAggValueForObserver(b2, compiledFormula.triggers![0]);
        expect(count).toEqual(3);

        done();

    });
    
});
