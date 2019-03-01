/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { MapReduceTrigger } from "@core/domain/metadata/execution_plan";
import { KeyValueObj } from "@core/domain/key_value_obj";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { compareKeys } from "../map_reduce_utils";
import { preComputeAggForObserverAndObservableBase } from "./functions_common";
import { TextjoinReduceFunN } from "@core/domain/metadata/reduce_functions";
import { CircularJSON } from "@core/json-stringify";

function prepareReturnValue(ret: any[], delimiter: string): string {
    return ret.map(x => {
        if (typeof x !== 'string') throw new Error("TEXTJOIN returned non-string value: " + CircularJSON.stringify(x));
        return x;
    }).filter(x => x != null && x.length > 0).join(delimiter);
}

export async function _textjoin_preComputeAggForObserverAndObservable(
    store: FrmdbEngineStore, 
    observerObj: KeyValueObj, 
    observableOld: KeyValueObj | null, 
    observableNew: KeyValueObj, 
    trigger: MapReduceTrigger): Promise<string | number> 
{

    if (trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun.name !== TextjoinReduceFunN) throw new Error("textjoin aggregation attempt for a non-textjoin trigger " + CircularJSON.stringify(trigger));;
    let reduceFun = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun;

    // console.debug("WARNING: this reduce precomputation works only for unique keys...needs enhancement to allow non-unique keys");

    let aggs = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;

    return preComputeAggForObserverAndObservableBase(store, observerObj, observableOld, observableNew, trigger, {
        newKeyMatches_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
            let keyCompare = compareKeys(oldKey, newKey);
            if (keyCompare < 0) {
                let startkey_to_oldKey = await store.reduceQuery(aggs, {
                    startkey: startkey,
                    endkey: oldKey,
                    inclusive_start: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                    inclusive_end: false,
                });
                let oldKey_to_newKey = await store.reduceQuery(aggs, {
                    startkey: oldKey,
                    endkey: newKey,
                    inclusive_start: false,
                    inclusive_end: false,
                });
                let newKey_to_endKey = await store.reduceQuery(aggs, {
                    startkey: newKey,
                    endkey: endkey,
                    inclusive_start: false,
                    inclusive_end: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                })

                return prepareReturnValue([startkey_to_oldKey, oldKey_to_newKey, newValue, newKey_to_endKey], reduceFun.delimiter);
            } else if (keyCompare === 0) {
                return store.getAggValueForObserver(observerObj, trigger);
            } else {
                let startkey_to_newKey = await store.reduceQuery(aggs, {
                    startkey: startkey,
                    endkey: newKey,
                    inclusive_start: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                    inclusive_end: false,
                });
                let newKey_to_oldKey = await store.reduceQuery(aggs, {
                    startkey: newKey,
                    endkey: oldKey,
                    inclusive_start: false,
                    inclusive_end: false,
                });
                let oldKey_to_endKey = await store.reduceQuery(aggs, {
                    startkey: oldKey,
                    endkey: endkey,
                    inclusive_start: false,
                    inclusive_end: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                })

                return prepareReturnValue([startkey_to_newKey, newValue, newKey_to_oldKey, oldKey_to_endKey], reduceFun.delimiter);
            }
        },
        newKeyMatches_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
            let startkey_to_newKey = await store.reduceQuery(aggs, {
                startkey: startkey,
                endkey: newKey,
                inclusive_start: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                inclusive_end: false,
            });
            let newKey_to_endKey = await store.reduceQuery(aggs, {
                startkey: newKey,
                endkey: endkey,
                inclusive_start: false,
                inclusive_end: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
            })

            return prepareReturnValue([startkey_to_newKey, newValue, newKey_to_endKey], reduceFun.delimiter);
        },
        newKeyDoesNotMatch_oldKeyMatches: async (oldKey, newKey, newValue, startkey, endkey) => {
            let startkey_to_oldKey = await store.reduceQuery(aggs, {
                startkey: startkey,
                endkey: oldKey,
                inclusive_start: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                inclusive_end: false,
            });
            let oldKey_to_endKey = await store.reduceQuery(aggs, {
                startkey: oldKey,
                endkey: endkey,
                inclusive_start: false,
                inclusive_end: trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
            })
            return prepareReturnValue([startkey_to_oldKey, oldKey_to_endKey], reduceFun.delimiter);
        },
        newKeyDoesNotMatch_oldKeyDoesNotMatch: async (oldKey, newKey, newValue, startkey, endkey) => {
            return store.getAggValueForObserver(observerObj, trigger);
        },            
    });
}
