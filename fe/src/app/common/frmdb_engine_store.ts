/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as moment from 'moment';

import { KeyValueStoreBase, RangeQueryOpts } from "./key_value_store_i";
import { KeyValueObj, isKeyValueError, KeyValueError } from "./domain/key_value_obj";
import { MapReduceTrigger } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { ObjLock } from "./domain/transaction";
import { FrmdbStore } from './frmdb_store';
import { _sum_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_sum';
import { _count_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_count';
import { _textjoin_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_textjoin';
import { _throw, _throwEx } from './throw';
import * as _ from 'lodash';
import { TransactionManager } from './transaction_manager';

function ll(eventId: string, retryNb: number | string): string {
    return new Date().toISOString() + "|" + eventId + "|" + retryNb;
}

export class RetryableError {
    constructor(public message: string) {}
}

export class FrmdbEngineStore extends FrmdbStore {

    private transactionManager = new TransactionManager();

    constructor(
        protected transactionsDB: KeyValueStoreBase, 
        protected dataDB: KeyValueStoreBase, 
        protected mapReduceDB: KeyValueStoreBase,
        protected locksDB: KeyValueStoreBase) 
    {
        super(transactionsDB, dataDB);
    }

    public async getObserversOfObservable(observableObj, trigger: MapReduceTrigger): Promise<KeyValueObj[]> {
        let ret: KeyValueObj[] = [];
        if (trigger.mapObserversImpactedByOneObservable.existingIndex === '_id') {
            let observerId = evalExprES5(observableObj, trigger.mapObserversImpactedByOneObservable.keyExpr)[0];
            if (null == observerId) throw new Error("obs not found for " + JSON.stringify(observableObj) + " with " + trigger.mapObserversImpactedByOneObservable.keyExpr[0].origExpr);
            ret = await this.dataDB.get<KeyValueObj>(observerId)
                .then(o => [o])
                .catch(ex => ex.status === 404 ? [] : _throwEx(ex));
        } else {
            let mapQuery = trigger.mapObserversImpactedByOneObservable.query;
            await this.mapReduceDB.rangeQuery<KeyValueObj>(
                trigger.mapObserversImpactedByOneObservable.obsViewName, 
                Object.assign({}, {
                    startkey: evalExprES5(observableObj, mapQuery.startkeyExpr),
                    endkey: evalExprES5(observableObj, mapQuery.endkeyExpr),
                    inclusive_start: mapQuery.inclusive_start,
                    inclusive_end: mapQuery.inclusive_end,
                })).then(rows => {
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
        let defaultValue = this.getAggDefaultValue(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        let mapQuery = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query;
        return this.reduceQuery(
            trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, 
            trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun,
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
        if ('_sum' === reduceFun) {
            return _sum_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else if ('_count' === reduceFun) {
            return _count_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else if (reduceFun.indexOf('_textjoin') >= 0) {
            return _textjoin_preComputeAggForObserverAndObservable(this, observerObj, observableOld, observableNew, trigger);
        } else {
            throw new Error('Unknown reduce function ' + trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        }
    }

    public  async debugGetAll(viewName: string): Promise<(string | number)[]> {
        return this.mapReduceDB.rangeQuery(viewName, {});
    }

    private getAggDefaultValue(reduceFun: string) {
        if ('_sum' === reduceFun) {
            return 0;
        } else if ('_count' === reduceFun) {
            return 0;
        } else if (reduceFun.indexOf('_textjoin') >= 0) {
            return '';
        } else {
            throw new Error('Unknown reduce function ' + reduceFun);
        }
    }
    public async reduceQuery(viewName: string, reduceFun: string, queryOpts: RangeQueryOpts): Promise<string | number> {
        let defaultValue = this.getAggDefaultValue(reduceFun);

        return this.mapReduceDB.rangeQuery<string | number>(viewName, queryOpts)
            .then(rows => {
                return rows.reduce((acc, current) => {
                    if ('_sum' === reduceFun) {
                        if (typeof acc !== 'number' || typeof current !== 'number' ) throw new Error ('View ' + viewName + ' _sum accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + current;
                    } else if ('_count' === reduceFun) {
                        if (typeof acc !== 'number' || typeof current !== 'number' ) throw new Error ('View ' + viewName + ' _count accepts only numbers but found (' + acc + ', ' + current + ')');
                        return acc + 1;
                    } else if (reduceFun.indexOf('_textjoin') >= 0) {
                        return acc + 'TBDDelimiter' + current;
                    } else {
                        throw new Error('Unknown reduce function ' + reduceFun);
                    }
            
                }, defaultValue);
            });
    }

    private async unlockObjs(locks: (KeyValueError | ObjLock)[]): Promise<void> {
        if (typeof locks !== 'object' || locks.length <= 0) return;
        let obtainedLocks = locks.filter(lock => !isKeyValueError(lock)) as ObjLock[];
        let locksToDelete = obtainedLocks.map<ObjLock>((lock: ObjLock) => ({ ...lock, _deleted: true }));
        let deletedLocks = await this.locksDB.putAll(locksToDelete);
        for (let lock of deletedLocks) {
            if (isKeyValueError(lock)) {
                console.warn("Could not delete lock" + lock.id, lock);
            }
        };
        locks.length = 0;
    }

    public async lockObjs(
        eventId: string, 
        ids: string[], 
        lockAcquiredCallback: () => Promise<any>, 
        lockRecoveredCallback: (eventId: string) => Promise<any>, 
        maxRetryNb: number = 10, 
        sleepFactorMs: number = 50): Promise<void> 
    {
        return this.lockObjsR(eventId, 0, ids, lockAcquiredCallback, lockRecoveredCallback, maxRetryNb, sleepFactorMs);
    }    
    public async lockObjsR(
        eventId: string, 
        transacRetry: number,
        ids: string[], 
        lockAcquiredCallback: () => Promise<any>, 
        lockRecoveredCallback: (eventId: string) => Promise<any>, 
        maxRetryNb: number = 10, 
        sleepFactorMs: number = 50): Promise<void> {

        return this.withLock(eventId, transacRetry, () => Promise.resolve(ids), lockAcquiredCallback, lockRecoveredCallback, maxRetryNb, sleepFactorMs);
    }

    public async exponentialSleep(eventId: string, retryNb: number, sleepFactorMs: number, msg: string) {
        let sleepTime = Math.round(Math.pow(2, retryNb) * sleepFactorMs * Math.random());
        console.log(ll(eventId, retryNb) + "|sleeping " + sleepTime + "|" + msg);
        return new Promise(resolve => setTimeout(resolve, sleepTime));
    }

    public async withLock(
        eventId: string, 
        transacRetry: number,
        getIds: (retryNb: number) => Promise<string[]>, 
        lockAcquiredCallback: () => Promise<any>, 
        lockRecoveredCallback: (eventId: string) => Promise<any>, 
        maxRetryNb: number = 10, 
        sleepFactorMs: number = 50) 
    {
        return this.transactionManager.runTransaction(eventId, getIds, lockAcquiredCallback);
    }
    public async withLockOld(
        eventId: string, 
        transacRetry: number,
        getIds: (retryNb: number) => Promise<string[]>, 
        lockAcquiredCallback: () => Promise<any>, 
        lockRecoveredCallback: (eventId: string) => Promise<any>, 
        maxRetryNb: number = 10, 
        sleepFactorMs: number = 50): Promise<void> {

        let locks: (KeyValueError | ObjLock)[] = [];

        try {
            let done = false;
            let ids: string[] = [];
            for (let retryNb = 0; retryNb < maxRetryNb && !done; retryNb++) {
                try {
                    ids = await getIds(retryNb);
                    locks = await this.locksDB.putAll(ids.map(id => ({ _id: 'LOCK>' + id, eventId: eventId })));

                    for (let lock of locks) {
                        if (isKeyValueError(lock)) {
                            if (409 != lock.status) throw new Error("Event" + eventId + " could not obtain lock " + JSON.stringify(lock) + "; " + JSON.stringify(ids) + "; " + JSON.stringify(locks));
                            else throw new RetryableError("lock not acquired");
                        }
                    };
                    console.log(ll(eventId, retryNb) + "|lock ok ids=" + JSON.stringify(ids));
                    await lockAcquiredCallback();
                    done = true;
                    console.log(ll(eventId, retryNb) + "|done, unlock ids=" + JSON.stringify(ids));
                } catch (ex) {
                    if (ex instanceof RetryableError) {
                        console.log(ll(eventId, retryNb) + "|retrying...unlock ids=" + locks.map(l => (isKeyValueError(l) ? l.id + "!" + l.status : l._id)).join(', '));
                        done = false;
                    } else throw ex;
                } finally {
                    await this.unlockObjs(locks);
                    if (!done) {
                        // await this.exponentialSleep(eventId, retryNb, sleepFactorMs, "lock KO for ids " + JSON.stringify(ids));                        
                    }
                }
            }
            if (!done) throw new Error("Could not acquire lock or perform work after " + maxRetryNb + " retries");
        } catch (ex) {
            console.error(ex);
        } finally {
            //console.log(moment().format('YYYY-MM-DD-HH-mm-ss-SSS ') + eventId + " unlocking " + JSON.stringify(ids));
            await this.unlockObjs(locks);
        }
    }

    public kvs(): KeyValueStoreBase {
        return this.dataDB;
    }

}
