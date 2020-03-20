/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "@domain/metadata/execution_plan";
import { KeyValueObj } from "@domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { evalExpression } from "@functions/map_reduce_utils";
import { preComputeAggForObserverAndObservableBase } from "./functions_common";

export async function _count_preComputeAggForObserverAndObservable(
    store: FrmdbEngineStore, 
    observerObj: KeyValueObj, 
    observableOld: KeyValueObj | null, 
    observableNew: KeyValueObj | null, 
    trigger: MapReduceTrigger): Promise<string | number> {
    
    let args = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map;
    let countValue = await store.getAggValueForObserverAndObservable(observerObj, observableOld, observableNew, trigger);
    if (typeof countValue === 'string') throw new Error("_count aggregation returned a text value");
    let current: number = countValue;
    let oldKey = observableOld ? evalExpression(observableOld, args.keyExpr) : null;
    let newKey = observableNew ? evalExpression(observableNew, args.keyExpr) : null;

    let startkey = evalExpression({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr);
    let endkey = evalExpression({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr);

    return preComputeAggForObserverAndObservableBase(store, observerObj, observableOld, observableNew, trigger, {
        newKeyMatches_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
            return current;
        },
        newKeyMatches_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
            return current + 1;
        },
        newKeyDoesNotMatch_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
            return current - 1;
        },
        newKeyDoesNotMatch_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
            return current;
        },            
    });    

}
