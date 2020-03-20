/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngineStore } from "../frmdb_engine_store";

import { Fn } from "@domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "@domain/metadata/execution_plan";
import { compileFormula } from '../formula_compiler';
import { evalExpression } from "@functions/map_reduce_utils";
import { getFrmdbEngineStore, getTestFrmdbEngineStore } from '@storage/key_value_store_impl_selector';
import { Schema, Pn, Entity } from "@domain/metadata/entity";
import { $s2e } from "@functions/s2e";

const ATable = {
    _id: 'A', props: {
        _id: { name: "_id", propType_: Pn.STRING },
        type: { name: "type", propType_: Pn.STRING },
        start_num: { name: "start_num", propType_: Pn.NUMBER },
        end_num: { name: "end_num", propType_: Pn.NUMBER },
        nb_overlap: { name: "nb_overlap", propType_: Pn.FORMULA, formula: `COUNTIF(A, AND(type == @[type], INTERSECTS(NUMRANGE(start_num, end_num),NUMRANGE(@[start_num], @[end_num]))))` }
    },
};
const TestSchema: Schema = {
    _id: "FRMDB_SCHEMA",
    entities: {
        A: ATable as Entity,
    }
};

describe('FrmdbEngineStore _count.INTERSECTS', () => {
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
        frmdbTStore = await getTestFrmdbEngineStore(TestSchema);
        await frmdbTStore.kvsFactory.clearAllForTestingPurposes();
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        done();
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("_count should allow extra conditions with INTERSECTS", async () => {
        try {
            compiledFormula = compileFormula('A', 'nb_overlap', ATable.props.nb_overlap.formula);
            await frmdbTStore.installFormula(compiledFormula);

            let a1 = { _id: "A~~1", type: "t1", start_num: 1, end_num: 4 }; await putAndForceUpdateView(null, a1, true); await putAndForceUpdateView(null, a1, false);
            let a2 = { _id: "A~~2", type: "t1", start_num: 3, end_num: 3 }; await putAndForceUpdateView(null, a2, true); await putAndForceUpdateView(null, a2, false);
            let a3 = { _id: "A~~3", type: "t1", start_num: 2, end_num: 9 }; await putAndForceUpdateView(null, a3, true); await putAndForceUpdateView(null, a3, false);
            let a4 = { _id: "A~~4", type: "t1", start_num: 5, end_num: 7 }; await putAndForceUpdateView(null, a4, true); await putAndForceUpdateView(null, a4, false);
            let a5 = { _id: "A~~5", type: "t2", start_num: 1, end_num: 8 }; await putAndForceUpdateView(null, a5, true); await putAndForceUpdateView(null, a5, false);
            let a6 = { _id: "A~~6", type: "t2", start_num: 5, end_num: 7 }; await putAndForceUpdateView(null, a6, true); await putAndForceUpdateView(null, a6, false);
            let a7 = { _id: "A~~7", type: "t3", start_num: 8, end_num: 8 }; await putAndForceUpdateView(null, a7, true); await putAndForceUpdateView(null, a7, false);

            let obs1 = await frmdbTStore.getObserversOfObservable(a1, compiledFormula.triggers![0]);
            expect(obs1.length).toEqual(3);
            expect(obs1[0]).toEqual(a1);
            expect(obs1[1]).toEqual(a2);
            expect(obs1[2]).toEqual(a3);

            obs1 = await frmdbTStore.getObserversOfObservable(a4, compiledFormula.triggers![0]);
            expect(obs1.length).toEqual(2);
            expect(obs1[0]).toEqual(a3);
            expect(obs1[1]).toEqual(a4);

            obs1 = await frmdbTStore.getObserversOfObservable(a6, compiledFormula.triggers![0]);
            expect(obs1.length).toEqual(2);
            expect(obs1[0]).toEqual(a5);
            expect(obs1[1]).toEqual(a6);

            obs1 = await frmdbTStore.getObserversOfObservable(a7, compiledFormula.triggers![0]);
            expect(obs1.length).toEqual(1);
            expect(obs1[0]).toEqual(a7);

            let a4new = _.cloneDeep(a4);
            a4new.start_num = 4;
            let obss = await frmdbTStore.getObserversOfObservableOldAndNew(a4, a4new, compiledFormula.triggers![0])
            expect(obss.length).toEqual(3);
            expect(obss[0]).toEqual(a3);
            expect(obss[1]).toEqual(a4);
            expect(obss[2]).toEqual(a1);

            let count = await frmdbTStore.getAggValueForObserver(a1, compiledFormula.triggers![0]);
            expect(count).toEqual(3);
            count = await frmdbTStore.getAggValueForObserver(a2, compiledFormula.triggers![0]);
            expect(count).toEqual(3);
            count = await frmdbTStore.getAggValueForObserver(a3, compiledFormula.triggers![0]);
            expect(count).toEqual(4);
            count = await frmdbTStore.getAggValueForObserver(a4, compiledFormula.triggers![0]);
            expect(count).toEqual(2);
            count = await frmdbTStore.getAggValueForObserver(a6, compiledFormula.triggers![0]);
            expect(count).toEqual(2);
            count = await frmdbTStore.getAggValueForObserver(a7, compiledFormula.triggers![0]);
            expect(count).toEqual(1);

            count = await frmdbTStore.preComputeAggForObserverAndObservable(a4, a4, a4new, compiledFormula.triggers![0]);
            expect(count).toEqual(3);
    
            let a7new = _.cloneDeep(a7);
            a7new.type = 't2';
            obss = await frmdbTStore.getObserversOfObservableOldAndNew(a7, a7new, compiledFormula.triggers![0])
            expect(obss.length).toEqual(2);
            expect(obss[0]).toEqual(a7);
            expect(obss[1]).toEqual(a5);
            count = await frmdbTStore.preComputeAggForObserverAndObservable(a5, a7, a7new, compiledFormula.triggers![0]);
            expect(count).toEqual(3);

            a7new.start_num = 6;
            obss = await frmdbTStore.getObserversOfObservableOldAndNew(a7, a7new, compiledFormula.triggers![0])
            expect(obss.length).toEqual(3);
            expect(obss[0]).toEqual(a7);
            expect(obss[1]).toEqual(a5);
            expect(obss[2]).toEqual(a6);
            count = await frmdbTStore.preComputeAggForObserverAndObservable(a6, a7, a7new, compiledFormula.triggers![0]);
            expect(count).toEqual(3);

        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
