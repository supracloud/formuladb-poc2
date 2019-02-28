/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as CircularJSON from "circular-json";

import { KeyObjStoreI, KVSArrayKeyType, KeyValueStoreFactoryI, KeyValueStoreArrayKeys, RangeQueryOptsI, RangeQueryOptsArrayKeysI, kvsKey2Str, KeyTableStoreI } from "./key_value_store_i";
import { MapReduceTrigger, CompiledFormula, MapFunctionT } from "@core/domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { FrmdbStore } from './frmdb_store';
import { _sum_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_sum';
import { _count_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_count';
import { _textjoin_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_textjoin';
import { _throw, _throwEx } from './throw';
import * as _ from 'lodash';
import { TransactionManager } from './transaction_manager';
import { Expression } from 'jsep';
import { MapReduceView, MapReduceViewUpdates } from './map_reduce_view';
import { ReduceFun, SumReduceFunN, TextjoinReduceFunN, CountReduceFunN } from "@core/domain/metadata/reduce_functions";
import { DataObj } from '@core/domain/metadata/data_obj';
import { Entity, Schema } from '@core/domain/metadata/entity';
import { $s2e } from './formula_compiler';
import { Pn } from '@core/domain/metadata/entity';

function ll(eventId: string, retryNb: number | string): string {
    return new Date().toISOString() + "|" + eventId + "|" + retryNb;
}

export class RetryableError {
    constructor(public message: string) { }
}



export class FrmdbEngineStore extends FrmdbStore {

    protected transactionManager: TransactionManager;
    protected mapReduceViews: Map<string, MapReduceView> = new Map();

    constructor(public kvsFactory: KeyValueStoreFactoryI, schema: Schema) {
        super(kvsFactory, _.cloneDeep(schema));
        this.transactionManager = new TransactionManager(kvsFactory);
    }

    public async installFormula(formula: CompiledFormula, skipExisting?: boolean): Promise<any> {
        for (let trigger of (formula.triggers || [])) {
            let obs = trigger.mapObserversImpactedByOneObservable.obsViewName,
                aggs = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;
            if (!skipExisting || null == this.mapReduceViews.get(obs)) {
                await this.createMapReduceView(obs, trigger.mapObserversImpactedByOneObservable, true);
            }
            if (!skipExisting || null == this.mapReduceViews.get(aggs)) {
                await this.createMapReduceView(aggs, trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                    false,
                    trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
            }
        }
    }

    public async uninstallFormula(formula: CompiledFormula): Promise<any> {
        for (let trigger of (formula.triggers || [])) {
            await this.removeMapReduceView(trigger.mapObserversImpactedByOneObservable.obsViewName);
            await this.removeMapReduceView(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName);
        }
    }

    private async initView(viewHashCode: string) {
        let view = this.view(viewHashCode, "forceUpdate");
        let allObjs = await this.getDataListByPrefix(view.map.entityName + '~~');
        for (let obj of allObjs) {
            await this.forceUpdateViewForObj(viewHashCode, null, obj);
        }
    }
    public async initViewsForNewFormula(oldCompiledFormula: CompiledFormula, compiledFormula: CompiledFormula): Promise<any> {
        let oldTriggers = _.flatMap(oldCompiledFormula.triggers || [], trg => [
            trg.mapObserversImpactedByOneObservable.obsViewName,
            trg.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName,
        ]);
        for (let trigger of (compiledFormula.triggers || [])) {
            if (!oldTriggers.includes(trigger.mapObserversImpactedByOneObservable.obsViewName)) {
                await this.initView(trigger.mapObserversImpactedByOneObservable.obsViewName);
            }
            if (!oldTriggers.includes(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName)) {
                await this.initView(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName);
            }
        }
    }

    public async adHocTableQuery(entity: Entity): Promise<DataObj[]> {
        //super-duper-extra-naive implementation
        let ret: DataObj[] = [];
        let allObjs = await this.all(entity._id);
        let formulas: CompiledFormula[] = [];
        for (let prop of Object.values(entity.props)) {
            if (prop.propType_ === Pn.FORMULA) {
                formulas.push(prop.compiledFormula_!);
            }
        }
        for (let obj of allObjs) {
            if (obj._id.indexOf(entity._id) === 0) {
                let retObj = _.cloneDeep(obj);
                for (let formula of formulas) {
                    retObj[formula.targetPropertyName] = await this.adHocFormulaQuery(obj, formula);
                }
                ret.push(retObj);
            }
        }
        return Promise.resolve(ret);
    }
    public async adHocFormulaQuery(observerObj: DataObj, compiledFormula: CompiledFormula): Promise<any> {
        let triggerValues: _.Dictionary<number | string> = {};
        let obsNew = _.cloneDeep(observerObj);
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            let aggsTrg = triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs;
            let startkey = kvsKey2Str(evalExprES5({$ROW$: observerObj}, aggsTrg.map.query.startkeyExpr));
            let endkey = kvsKey2Str(evalExprES5({$ROW$: observerObj}, aggsTrg.map.query.endkeyExpr));
            let inclusive_start = aggsTrg.map.query.inclusive_start;
            let inclusive_end = aggsTrg.map.query.inclusive_end;
        
            let all = await this.all(aggsTrg.map.entityName);
            let filteredObjs: any[] = [];
            for (let obj of all) {
                let key = kvsKey2Str(evalExprES5(obj, aggsTrg.map.keyExpr));
                if ((startkey < key && key < endkey) || (startkey == key && inclusive_start) || (endkey == key && inclusive_end)) {
                    filteredObjs.push(obj);
                }
            }

            // let triggerValue: any = await this.adHocQuery(aggsTrg.map.entityName, {
            //     extraColsBeforeGroup: [
            //         {alias: 'KEY', expr: aggsTrg.map.keyExpr},
            //         {alias: 'VALUE', expr: aggsTrg.map.valueExpr}, 
            //         'AGG',
            //     ],
            //     filters: [],
            //     groupColumns: ['KEY'],
            //     groupAggs: [{alias: 'AGG', reduceFun: aggsTrg.reduceFun, colName: 'VALUE'}],
            //     groupFilters: [ $s2e(`'${startkey}' ${op1} KEY && KEY ${op2} '${endkey}'`)],
            //     returnedColumns: ['AGG'],
            //     sortColumns: [],
            // });
            // triggerValues[aggsTrg.aggsViewName] = triggerValue[0]['AGG'];
        }

        let ret;
        if (!compiledFormula.triggers) {
            ret = evalExprES5(obsNew, compiledFormula.finalExpression);
        } else if (compiledFormula.triggers.length === 1) {
            ret = triggerValues[compiledFormula.triggers[0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName];
        } else {
            ret = evalExprES5(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
        }
        // obsNew[compiledFormula.targetPropertyName]
        console.log("adHocFormulaQuery|[" + compiledFormula.targetPropertyName + "] = " + ret + " ($TRG$=" + CircularJSON.stringify(triggerValues) + ") = [" + compiledFormula.finalExpression.origExpr + "]");

        //TODO: validations are important for Formula Preview, not necessarily for Reports

        return ret;
    }

    public removeMapReduceView(viewHashCode: string) {
        this.mapReduceViews.delete(viewHashCode);
    }
    public createMapReduceView(viewHashCode: string, map: MapFunctionT, use$ROW$?: boolean, reduceFun?: ReduceFun) {
        if (map.existingIndex != null) return Promise.resolve("existing index");

        this.mapReduceViews.set(viewHashCode, new MapReduceView(
            this.kvsFactory,
            viewHashCode,
            map,
            use$ROW$,
            reduceFun,
        ));
    }

    private view(viewHashCode: string, opts: any): MapReduceView {
        let mrView = this.mapReduceViews.get(viewHashCode);
        if (!mrView) throw new Error("view called on non-existent view " + viewHashCode + "; with opts " + CircularJSON.stringify(opts));
        return mrView;
    }
    public mapQuery<T>(viewHashCode: string, queryOpts?: Partial<RangeQueryOptsArrayKeysI>): Promise<T[]> {
        return this.view(viewHashCode, queryOpts).mapQuery(queryOpts || {});
    }
    public mapQueryWithKeys<T>(viewHashCode: string, queryOpts?: Partial<RangeQueryOptsArrayKeysI>) {
        return this.view(viewHashCode, queryOpts).mapQueryWithKeys(queryOpts || {});
    }
    public reduceQuery(viewHashCode: string, queryOpts?: Partial<RangeQueryOptsArrayKeysI>) {
        return this.view(viewHashCode, queryOpts).reduceQuery(queryOpts || {});
    }
    public async forceUpdateViewForObj(viewHashCode: string, oldObj: DataObj | null, newObj: DataObj) {
        let view = this.view(viewHashCode, newObj);
        let updates = await view.preComputeViewUpdateForObj(oldObj, newObj);
        return view.updateViewForObj(updates);
    }
    public async updateViewForObj(updates: MapReduceViewUpdates<string | number>) {
        let view = this.view(updates.viewHashCode, undefined);
        return view.updateViewForObj(updates);
    }
    public async preComputeViewUpdateForObj(viewHashCode: string, oldObj: DataObj | null, newObj: DataObj): Promise<MapReduceViewUpdates<string | number>> {
        let view = this.view(viewHashCode, undefined);
        return view.preComputeViewUpdateForObj(oldObj, newObj);
    }

    public async getObserversOfObservable(observableObj, trigger: MapReduceTrigger): Promise<DataObj[]> {
        let ret: DataObj[] = [];
        if (trigger.mapObserversImpactedByOneObservable.existingIndex === '_id') {
            let observerId = evalExprES5(observableObj, trigger.mapObserversImpactedByOneObservable.keyExpr)[0];
            if (null == observerId) throw new Error("obs not found for " + CircularJSON.stringify(observableObj) + " with " + trigger.mapObserversImpactedByOneObservable.keyExpr[0].origExpr);
            ret = await this.getDataObj(observerId)
                .then(o => o ? [o] : [])
                .catch(ex => ex.status === 404 ? [] : _throwEx(ex));
        } else {
            let mapQuery = trigger.mapObserversImpactedByOneObservable.query;
            let viewHashCode = trigger.mapObserversImpactedByOneObservable.obsViewName;
            ret = await this.mapQueryWithKeys<DataObj>(viewHashCode, {
                startkey: evalExprES5(observableObj, mapQuery.startkeyExpr),
                endkey: evalExprES5(observableObj, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            }).then(rows => Promise.all(
                rows.map(row => this.getDataObj(MapReduceView.extractObjIdFromMapKey(row._id))))
            ).then(objs => objs.filter(o => {
                if (o == null) console.error("map query returned null object", CircularJSON.stringify({observableObj, trigger}));
                return o != null;
            })) as DataObj[];
        }
        return ret;
    }

    public async getObserversOfObservableOldAndNew(
        observableOld: DataObj | null,
        observableNew: DataObj,
        trigger: MapReduceTrigger): Promise<DataObj[]> {

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
                startkey: evalExprES5({ $ROW$: observerObj }, mapQuery.startkeyExpr),
                endkey: evalExprES5({ $ROW$: observerObj }, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            }
        ));
    }

    public async preComputeAggForObserverAndObservable(
        observerObj: DataObj,
        observableOld: DataObj | null,
        observableNew: DataObj,
        trigger: MapReduceTrigger): Promise<string | number> {

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
        lockAcquiredCallback: () => Promise<any>) {
        return this.transactionManager.runTransaction(eventId, getIds, lockAcquiredCallback);
    }
}
