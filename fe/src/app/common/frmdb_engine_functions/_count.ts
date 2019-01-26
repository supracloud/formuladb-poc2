/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "@storage/domain/metadata/execution_plan";
import { KeyValueObj } from "@storage/domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { evalExprES5 } from "@storage/map_reduce_utils";
import { preComputeAggForObserverAndObservableBase } from "./functions_common";

export async function _count_preComputeAggForObserverAndObservable(
    store: FrmdbEngineStore, 
    observerObj: KeyValueObj, 
    observableOld: KeyValueObj | null, 
    observableNew: KeyValueObj, 
    trigger: MapReduceTrigger): Promise<string | number> {
    
    let args = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map;
    let countValue = await store.getAggValueForObserver(observerObj, trigger);
    if (typeof countValue === 'string') throw new Error("_count aggregation returned a text value");
    let current: number = countValue;
    let oldKey = observableOld ? evalExprES5(observableOld, args.keyExpr) : null;
    let newKey = evalExprES5(observableNew, args.keyExpr);

    let startkey = evalExprES5({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr);
    let endkey = evalExprES5({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr);

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
