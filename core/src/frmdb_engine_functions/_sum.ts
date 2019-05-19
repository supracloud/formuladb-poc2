/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "@domain/metadata/execution_plan";
import { KeyValueObj } from "@domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { evalExpression } from "../map_reduce_utils";
import { preComputeAggForObserverAndObservableBase } from "./functions_common";

export async function _sum_preComputeAggForObserverAndObservable(
    store: FrmdbEngineStore,
    observerObj: KeyValueObj,
    observableOld: KeyValueObj | null,
    observableNew: KeyValueObj | null,
    trigger: MapReduceTrigger): Promise<string | number> {

    try {
        let args = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map;
        let getSumValue = await store.getAggValueForObserver(observerObj, trigger);
        if (typeof getSumValue === 'string') throw new Error("SUM aggregation returned a text value");
        let current: number = getSumValue;
        let oldVal = observableOld ? evalExpression(observableOld, args.valueExpr) : 0;
        let newVal: number;
        newVal = observableNew ? evalExpression(observableNew, args.valueExpr) : 0;
    
        return preComputeAggForObserverAndObservableBase(store, observerObj, observableOld, observableNew, trigger, {
            newKeyMatches_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
                return current - oldVal + newVal;
            },
            newKeyMatches_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
                return current - 0 + newVal;
            },
            newKeyDoesNotMatch_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
                return current - oldVal + 0;
            },
            newKeyDoesNotMatch_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
                return current;
            },
        });


    } catch (ex) {
        console.error(ex);
        throw ex;
    }
}
