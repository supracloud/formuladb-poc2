/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as moment from 'moment';

import { KeyValueStoreBase, KVSArrayKeyType, KeyValueStoreFactoryI, KeyValueStoreArrayKeys, RangeQueryOptsI, RangeQueryOptsArrayKeysI } from "./key_value_store_i";
import { KeyValueObj, isKeyValueError, KeyValueError } from "./domain/key_value_obj";
import { MapReduceTrigger, CompiledFormula, MapFunctionT } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { ObjLock } from "./domain/transaction";
import { FrmdbStore } from './frmdb_store';
import { _sum_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_sum';
import { _count_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_count';
import { _textjoin_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_textjoin';
import { _throw, _throwEx } from './throw';
import * as _ from 'lodash';
import { TransactionManager } from './transaction_manager';
import { Expression } from 'jsep';
import { MapReduceView } from './map_reduce_view';
import { ReduceFun, SumReduceFunN, TextjoinReduceFunN, CountReduceFunN } from './domain/metadata/reduce_functions';

function ll(eventId: string, retryNb: number | string): string {
    return new Date().toISOString() + "|" + eventId + "|" + retryNb;
}

export class RetryableError {
    constructor(public message: string) { }
}



export class FrmdbEngineStore extends FrmdbStore {

    protected transactionManager = new TransactionManager();
    protected mapReduceViews: Map<string, MapReduceView> = new Map();
    protected locksDB: KeyValueStoreBase;

    constructor(private kvsFactory: KeyValueStoreFactoryI) {
        super(kvsFactory.createKVS(), kvsFactory.createKVS());
        this.locksDB = kvsFactory.createKVS();
    }

    public async installFormula(formula: CompiledFormula): Promise<any> {
        for (let trigger of (formula.triggers || [])) {
            let obs = trigger.mapObserversImpactedByOneObservable.obsViewName,
                aggs = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;
            await this.createMapReduceView(obs, trigger.mapObserversImpactedByOneObservable, true);
            await this.createMapReduceView(aggs, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                false,
                trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        }
    }

    public createMapReduceView(viewName: string, map: MapFunctionT, use$ROW$?: boolean, reduceFun?: ReduceFun) {
        if (map.existingIndex != null) return Promise.resolve("existing index");

        this.mapReduceViews.set(viewName, new MapReduceView(
            this.kvsFactory,
            viewName,
            map,
            use$ROW$,
            reduceFun,
        ));
    }

    private view(viewName: string, opts: any): MapReduceView {
        let mrView = this.mapReduceViews.get(viewName);
        if (!mrView) throw new Error("mapQuery called on non-existent view " + viewName + "; with opts " + JSON.stringify(opts));
        return mrView;
    }
    public mapQuery<T>(viewName: string, queryOpts?: Partial<RangeQueryOptsArrayKeysI>): Promise<T[]> {
        return this.view(viewName, queryOpts).mapQuery(queryOpts || {});
    }
    public reduceQuery(viewName: string, queryOpts?: Partial<RangeQueryOptsArrayKeysI>) {
        return this.view(viewName, queryOpts).reduceQuery(queryOpts || {});
    }
    public async updateViewForObj(viewName: string, obj: KeyValueObj) {
        let view = this.view(viewName, obj);
        let updates = await view.preComputeViewUpdateForObj(obj);
        return view.updateViewForObj(updates);
    }

    public async getObserversOfObservable(observableObj, trigger: MapReduceTrigger): Promise<KeyValueObj[]> {
        let ret: KeyValueObj[] = [];
        if (trigger.mapObserversImpactedByOneObservable.existingIndex === '_id') {
            let observerId = evalExprES5(observableObj, trigger.mapObserversImpactedByOneObservable.keyExpr)[0];
            if (null == observerId) throw new Error("obs not found for " + JSON.stringify(observableObj) + " with " + trigger.mapObserversImpactedByOneObservable.keyExpr[0].origExpr);
            ret = await this.dataDB.get<KeyValueObj>(observerId)
                .then(o => o ? [o] : [])
                .catch(ex => ex.status === 404 ? [] : _throwEx(ex));
        } else {
            let mapQuery = trigger.mapObserversImpactedByOneObservable.query;
            let viewName = trigger.mapObserversImpactedByOneObservable.obsViewName;
            await this.mapQuery<KeyValueObj>(viewName, {
                startkey: evalExprES5(observableObj, mapQuery.startkeyExpr),
                endkey: evalExprES5(observableObj, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            }).then(rows => {
                for (let row of rows) {
                    ret.push(row);
                }
            });
        }
        return ret;
    }

    public async getObserversOfObservableOldAndNew(
        observableOld: KeyValueObj | null,
        observableNew: KeyValueObj,
        trigger: MapReduceTrigger): Promise<KeyValueObj[]> {

        let oldObs = observableOld ? await this.getObserversOfObservable(observableOld, trigger) : [];
        let newObs = await this.getObserversOfObservable(observableNew, trigger);
        return _.unionBy(oldObs, newObs, '_id');
    }

    public async getAggValueForObserver(observerObj, trigger: MapReduceTrigger): Promise<number | string> {
        // let defaultValue = this.getAggDefaultValue(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        let mapQuery = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query;
        return this.reduceQuery(
            trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName,
            Object.assign({}, {
                startkey: evalExprES5(observerObj, mapQuery.startkeyExpr),
                endkey: evalExprES5(observerObj, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            }
            ));
    }

    public async preComputeAggForObserverAndObservable(
        observerObj: KeyValueObj,
        observableOld: KeyValueObj | null,
        observableNew: KeyValueObj,
        trigger: MapReduceTrigger): Promise<string | number> {

        let ret: number | string = 'ERRNOTFOUND2';

        let reduceFun = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun;
        if (SumReduceFunN === reduceFun.name) {
            return _sum_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else if (CountReduceFunN === reduceFun.name) {
            return _count_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else if (TextjoinReduceFunN == reduceFun.name) {
            return _textjoin_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else {
            throw new Error('Unknown reduce function ' + trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        }
    }

    public async withLock(
        eventId: string,
        transacRetry: number,
        getIds: (retryNb: number) => Promise<string[]>,
        lockAcquiredCallback: () => Promise<any>,
        lockRecoveredCallback: (eventId: string) => Promise<any>,
        maxRetryNb: number = 10,
        sleepFactorMs: number = 50) {
        return this.transactionManager.runTransaction(eventId, getIds, lockAcquiredCallback);
    }

}
