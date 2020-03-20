/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "@domain/metadata/execution_plan";
import { KeyValueObj } from "@domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { evalExpression, includesKey } from "@functions/map_reduce_utils";

export interface PreComputeAggForObserverAndObservableOpts {
    newKeyMatches_oldKeyMatches: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyMatches_oldKeyDoesNotMatch: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyDoesNotMatch_oldKeyMatches: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
    newKeyDoesNotMatch_oldKeyDoesNotMatch: (oldKey, newKey, newValue, startkey, endkey) => Promise<string | number>,
}

function matchesFilter(observable: KeyValueObj | null, observerObj: KeyValueObj, trigger: MapReduceTrigger) {
    let filterExpr = trigger.mapObserversImpactedByOneObservable.query.filter
    if (filterExpr) {
        if (!observable) return false;

        return evalExpression({
            ...observable,
            $ROW$: observerObj,
        }, filterExpr);

    } else return true;
}

export async function preComputeAggForObserverAndObservableBase (
    store: FrmdbEngineStore, 
    observerObj: KeyValueObj, 
    observableOld: KeyValueObj | null, 
    observableNew: KeyValueObj | null, 
    trigger: MapReduceTrigger,
    opts: PreComputeAggForObserverAndObservableOpts): Promise<string | number> {

    let obs = trigger.mapObserversImpactedByOneObservable.obsViewName;
    
    let args = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map;
    let reduceFun = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun;
    let oldKey = observableOld ? evalExpression(observableOld, args.keyExpr) : [];
    let newKey = observableNew ? evalExpression(observableNew, args.keyExpr) : [];
    let newValue = observableNew ? evalExpression(observableNew, args.valueExpr) : null;

    let startkey = evalExpression({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr);
    let endkey = evalExpression({$ROW$: observerObj}, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr);
    let inclusive_start = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start;
    let inclusive_end = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end;

    if (includesKey(newKey, startkey, endkey, inclusive_start, inclusive_end) && matchesFilter(observableNew, observerObj, trigger)) {
        if (includesKey(oldKey, startkey, endkey, inclusive_start, inclusive_end) && matchesFilter(observableOld, observerObj, trigger)) {
            return opts.newKeyMatches_oldKeyMatches(oldKey, newKey, newValue, startkey, endkey);
        } else {
            return opts.newKeyMatches_oldKeyDoesNotMatch(oldKey, newKey, newValue, startkey, endkey);
        }
    } else {
        if (includesKey(oldKey, startkey, endkey, inclusive_start, inclusive_end) && matchesFilter(observableOld, observerObj, trigger)) {
            return opts.newKeyDoesNotMatch_oldKeyMatches(oldKey, newKey, newValue, startkey, endkey);
        } else {
            return opts.newKeyDoesNotMatch_oldKeyDoesNotMatch(oldKey, newKey, newValue, startkey, endkey);
        }
    }    
}
