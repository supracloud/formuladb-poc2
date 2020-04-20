/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { CircularJSON } from "@domain/json-stringify";

import { KeyObjStoreI, KVSArrayKeyType, KeyValueStoreFactoryI, KeyValueStoreArrayKeys, RangeQueryOptsI, RangeQueryOptsArrayKeysI, kvsKey2Str, KeyTableStoreI, kvsReduceValues } from "@storage/key_value_store_i";
import { MapReduceTrigger, CompiledFormula, MapFunctionT } from "@domain/metadata/execution_plan";
import { evalExpression } from "@functions/map_reduce_utils";
import { FrmdbStore } from './frmdb_store';
import { _sum_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_sum';
import { _count_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_count';
import { _textjoin_preComputeAggForObserverAndObservable } from './frmdb_engine_functions/_textjoin';
import { _throw, _throwEx } from './throw';
import * as _ from 'lodash';
import { TransactionManager } from './transaction_manager';
import { Expression } from 'jsep';
import { MapReduceView, MapReduceViewUpdates } from './map_reduce_view';
import { ReduceFun, SumReduceFunN, TextjoinReduceFunN, CountReduceFunN } from "@domain/metadata/reduce_functions";
import { DataObj, parseDataObjId } from '@domain/metadata/data_obj';
import { Entity, Schema } from '@domain/metadata/entity';
import { Pn } from '@domain/metadata/entity';
import { I18nStore } from "./i18n-store";
import { validateAndCovertObjPropertyType } from "@domain/metadata/types";

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
        let allObjs = await this.getDataListByPrefix(view.map.entityId + '~~');
        for (let obj of allObjs) {
            await this.forceUpdateViewForObj(viewHashCode, null, obj);
        }
    }
    public async initViewsForNewFormula(oldCompiledFormula: CompiledFormula, compiledFormula: CompiledFormula): Promise<any> {
        let oldTriggers = !oldCompiledFormula?.triggers ? [] : _.flatMap(oldCompiledFormula.triggers || [], trg => [
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
            let startkey = kvsKey2Str(evalExpression({ $ROW$: observerObj }, aggsTrg.map.query.startkeyExpr));
            let endkey = kvsKey2Str(evalExpression({ $ROW$: observerObj }, aggsTrg.map.query.endkeyExpr));
            let inclusive_start = aggsTrg.map.query.inclusive_start;
            let inclusive_end = aggsTrg.map.query.inclusive_end;

            let all = await this.all(aggsTrg.map.entityId);
            let filteredObjs: any[] = [];
            for (let obj of all) {
                let key = kvsKey2Str(evalExpression(obj, aggsTrg.map.keyExpr));
                if ((startkey < key && key < endkey) || (startkey == key && inclusive_start) || (endkey == key && inclusive_end)) {
                    filteredObjs.push(obj);
                }
            }

            // let triggerValue: any = await this.adHocQuery(aggsTrg.map.entityId, {
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
            ret = evalExpression(obsNew, compiledFormula.finalExpression);
        } else if (compiledFormula.triggers.length === 1) {
            ret = triggerValues[compiledFormula.triggers[0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName];
        } else {
            ret = evalExpression(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
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
    public async preComputeViewUpdateForObj(viewHashCode: string, oldObj: DataObj | null, newObj: DataObj | null): Promise<MapReduceViewUpdates<string | number>> {
        let view = this.view(viewHashCode, undefined);
        return view.preComputeViewUpdateForObj(oldObj, newObj);
    }

    
    validateAndConvertObjFields(obj: DataObj, entity: Entity, skipConversion?: boolean): string | null {
        for (let prop of Object.values(entity.props)) {
            let errMsg = validateAndCovertObjPropertyType(obj, entity, prop.name, obj[prop.name], skipConversion);
            if (errMsg) return `${prop.name} is invalid: ${errMsg}`;
        }
        return null;
    }

    public async getDataObj(id: string): Promise<DataObj | null> {
        let obj = await super.getDataObj(id);
        if (!obj) throw new Error(`Cannot find obj ${id}`);
        let entityId = parseDataObjId(id).entityId;
        let entity = this.schema.entities[entityId];
        if (!entity) throw new Error(`Cannot find table definition for obj ${JSON.stringify(obj)}`);
        let errMsg = this.validateAndConvertObjFields(obj, entity);
        if (errMsg) throw new Error(`obj ${id} is invalid: ${errMsg}`);

        return obj;
    }

    public async getObserversOfObservable(observableObj: DataObj, trigger: MapReduceTrigger): Promise<DataObj[]> {
        let ret: DataObj[] = [];
        if (trigger.mapObserversImpactedByOneObservable.existingIndex === '_id') {
            let observerId = evalExpression(observableObj, trigger.mapObserversImpactedByOneObservable.keyExpr)[0];
            if (null == observerId) throw new Error("obs not found for " + JSON.stringify(observableObj) + " with " + trigger.mapObserversImpactedByOneObservable.keyExpr[0].origExpr);
            ret = await this.getDataObj(observerId)
                .then(o => o ? [o] : [])
                .catch(ex => ex.status === 404 ? [] : _throwEx(ex));
        } else {
            let mapQuery = trigger.mapObserversImpactedByOneObservable.query;
            let viewHashCode = trigger.mapObserversImpactedByOneObservable.obsViewName;
            ret = await this.mapQueryWithKeys<DataObj>(viewHashCode, {
                startkey: evalExpression(observableObj, mapQuery.startkeyExpr),
                endkey: evalExpression(observableObj, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            })
                .then(rows => Promise.all(
                    rows.map(row => this.getDataObj(MapReduceView.extractObjIdFromMapKey(row._id))))
                )
                .then(rows => {
                    let filterExpr = trigger.mapObserversImpactedByOneObservable.query.filter;
                    if (filterExpr) {
                        return rows.filter(row => {
                            let matchesFilter = filterExpr && evalExpression({
                                ...observableObj,
                                $ROW$: row,
                            }, filterExpr);
                            return matchesFilter;
                        });
                    } else return rows;
                })
                .then(objs => objs.filter(o => {
                    if (o == null) console.error("map query returned null object", CircularJSON.stringify({ observableObj, trigger }));
                    return o != null;
                })) as DataObj[];
        }
        return ret;
    }

    public async getObserversOfObservableOldAndNew(
        observableOld: DataObj | null,
        observableNew: DataObj | null,
        trigger: MapReduceTrigger): Promise<DataObj[]> {

        if (!observableOld && !observableNew) throw new Error("OLD and NEW cannot be both null");
        let oldObs = observableOld ? await this.getObserversOfObservable(observableOld, trigger) : [];
        let newObs = observableNew ? await this.getObserversOfObservable(observableNew, trigger) : [];
        return _.unionBy(oldObs, newObs, '_id');
    }
    public async getAggValueForObserverAndObservable(
        observerObj: DataObj, 
        observableOld: DataObj | null,
        observableNew: DataObj | null,
        trigger: MapReduceTrigger): Promise<number | string> 
    {
        if (observableNew && observableNew._id === observerObj._id) {
            return this.getAggValueForObserver(observableNew, trigger);
        } else return this.getAggValueForObserver(observerObj, trigger);
    }
    public async getAggValueForObserver(observerObj: DataObj, trigger: MapReduceTrigger): Promise<number | string> {
        // let defaultValue = this.getAggDefaultValue(trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
        let mapQuery = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query;
        if (trigger.mapObserversImpactedByOneObservable.query.filter) {
            let viewHashCode = trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName;
            let queryOpts = {
                startkey: evalExpression({$ROW$: observerObj}, mapQuery.startkeyExpr),
                endkey: evalExpression({$ROW$: observerObj}, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            };
            let view = this.view(viewHashCode, queryOpts);
            if (!view.reduceFun) throw new Error(`view for trigger ${trigger.rawExpr.origExpr} does not have reduce function`);
            let viewRows = await view.mapQueryWithKeys(queryOpts);

            let observables = await Promise.all(viewRows.map(row => this.getDataObj(MapReduceView.extractObjIdFromMapKey(row._id))));
            if (observables.length != viewRows.length) {
                console.error(`expected obs to have the same length as view rows`, viewRows, observables);
                throw new Error(`expected obs to have the same length as view rows`);
            }

            let filteredViewRecords: { row: { _id: KVSArrayKeyType, val }, obj: DataObj }[] = [];
            let filterExpr = trigger.mapObserversImpactedByOneObservable.query.filter;
            for (let [i, row] of viewRows.entries()) {
                let obj = observables[i];
                if (!obj) { console.warn(`obj null for row ${JSON.stringify(row)}`); continue; }
                let matchesFilter;
                if (filterExpr) {
                    matchesFilter = filterExpr && evalExpression({
                        ...obj,
                        $ROW$: observerObj,
                    }, filterExpr);
                } else matchesFilter = true;

                if (matchesFilter) filteredViewRecords.push({ row, obj });
            }

            return kvsReduceValues(filteredViewRecords.map(x => x.row.val),
                view.reduceFun, viewHashCode, true);
        } else return this.reduceQuery(
            trigger.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName,
            Object.assign({}, {
                startkey: evalExpression({ $ROW$: observerObj }, mapQuery.startkeyExpr),
                endkey: evalExpression({ $ROW$: observerObj }, mapQuery.endkeyExpr),
                inclusive_start: mapQuery.inclusive_start,
                inclusive_end: mapQuery.inclusive_end,
            }
            ));
    }

    public async preComputeAggForObserverAndObservable(
        observerObj: DataObj,
        observableOld: DataObj | null,
        observableNew: DataObj | null,
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
        getIds: () => Promise<string[]>,
        lockAcquiredCallback: () => Promise<any>) {
        return this.transactionManager.runTransaction(eventId, getIds, lockAcquiredCallback);
    }

    public async clearAllForTestingPurposes() {
        await this.kvsFactory.clearAllForTestingPurposes();
    }
}
