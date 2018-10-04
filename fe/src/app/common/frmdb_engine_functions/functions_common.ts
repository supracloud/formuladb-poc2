/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "../domain/metadata/execution_plan";
import { KeyValueObj } from "../domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { evalExprES5, compareKeys, includesKey } from "../map_reduce_utils";

export interface PreComputeAggForObserverAndObservableOpts {
    newKeyMatches_oldKeyMatches: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyMatches_oldKeyDoesNotMatch: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyDoesNotMatch_oldKeyMatches: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyDoesNotMatch_oldKeyDoesNotMatch: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
}

export async function preComputeAggForObserverAndObservableBase (
    store: FrmdbEngineStore, 
    observerObj: KeyValueObj, 
    observableOld: KeyValueObj | null, 
    observableNew: KeyValueObj, 
    trigger: MapReduceTrigger,
    opts: PreComputeAggForObserverAndObservableOpts): Promise<string | number> {

    let obs = trigger.mapObserversImpactedByOneObservable.obsViewName;
    
    let args = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map;
    let reduceFun = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun;
    let oldKey = observableOld ? evalExprES5(observableOld, args.keyExpr) : [];
    let newKey = evalExprES5(observableNew, args.keyExpr);
    let newValue = evalExprES5(observableNew, args.valueExpr);

    let startkey = evalExprES5({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr);
    let endkey = evalExprES5({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr);
    let inclusive_start = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start;
    let inclusive_end = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end;

    if (includesKey(newKey, startkey, endkey, inclusive_start, inclusive_end)) {
        if (includesKey(oldKey, startkey, endkey, inclusive_start, inclusive_end)) {
            return opts.newKeyMatches_oldKeyMatches(oldKey, newKey, newValue, startkey, endkey);
        } else {
            return opts.newKeyMatches_oldKeyDoesNotMatch(oldKey, newKey, newValue, startkey, endkey);
        }
    } else {
        if (includesKey(oldKey, startkey, endkey, inclusive_start, inclusive_end)) {
            return opts.newKeyDoesNotMatch_oldKeyMatches(oldKey, newKey, newValue, startkey, endkey);
        } else {
            return opts.newKeyDoesNotMatch_oldKeyDoesNotMatch(oldKey, newKey, newValue, startkey, endkey);
        }
    }    
}
