/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { SchemaDAO } from "@core/domain/metadata/schema_dao";
import { DataObj, parseDataObjId, isNewDataObjId } from "@core/domain/metadata/data_obj";

import { FrmdbEngineStore, RetryableError } from "./frmdb_engine_store";

import * as events from "@core/domain/event";
import * as _ from 'lodash';
import { isKeyValueError } from "@core/domain/key_value_obj";
import { generateUUID } from "@core/domain/uuid";
import { CompiledFormula } from "@core/domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { FailedValidation, FrmdbEngineTools } from "./frmdb_engine_tools";
import { MapReduceViewUpdates, MapReduceView, MapViewUpdates } from "./map_reduce_view";

function ll(transacDAG: TransactionDAG): string {
    return new Date().toISOString() + "|" + transacDAG.eventId + "|" + transacDAG.retry;
}
function stringifyObj(obj: DataObj | DataObj[]): string {
    let arr = obj instanceof Array ? obj : [obj];
    return arr.map(o => JSON.stringify(_.omit(o, ['_revisions']))).join(", ");
}

class TransactionDAG {
    levels: string[][] = [];
    objs: {
        [id: string]: {
            PREV?: DataObj | null,
            OLD: DataObj | null,
            NEW: DataObj,
            aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
            obsViewsUpdates: MapViewUpdates<string | number>[],
        },
    } = {};
    currentLevel: number = 0;
    haveFailedValidations: boolean = false;
    finished: boolean = false;

    constructor(public eventId: string, public retry: string) {
    }

    public addObj(
        newObj: DataObj, 
        oldObj: DataObj | null,
        aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
        obsViewsUpdates: MapViewUpdates<string | number>[],
        ) 
    {
        let start = Date.now();

        if (oldObj && newObj._id !== oldObj._id) throw new Error("expected OLD id to equal NEW id " + JSON.stringify(newObj) + " // " + JSON.stringify(oldObj));
        if (this.objs[newObj._id]) {
            throw new Error("Circular dependency found for " + JSON.stringify(newObj) + ", current " + JSON.stringify(this.objs, null, 4));
        }

        this.objs[newObj._id] = {
            OLD: oldObj,
            NEW: newObj,
            aggsViewsUpdates,
            obsViewsUpdates,
        };
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push([]);
        }
        this.levels[this.currentLevel].push(newObj._id);
        console.log(ll(this) + "|addObj|" + (Date.now() - start) + "ms; level=" + this.currentLevel + "|" + newObj._id + "/" + JSON.stringify({newObj, oldObj, aggsViewsUpdates, obsViewsUpdates}) + " in " + JSON.stringify(this.levels));
    }
    public getTrObj(id: string) {
        let ret = this.objs[id];
        if (null == ret) throw new Error("Obj id " + id + " does not exist in transaction " + JSON.stringify(this, null, 4));
        return ret;
    }
    public incrementLevel() {
        this.currentLevel++;
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push([]);
        }
    }
    public currentLevelSize() {
        return this.levels[this.currentLevel].length;
    }
    public getCurrentLevelObjs() {
        return this.levels[this.currentLevel].map(objId => this.objs[objId]);
    }
    public getLevelObjs(level: string[]) {
        return level.map(objId => this.objs[objId]);
    }
    public getLevelObjsForSave(level: string[]) {
        return level.map(objId => this.objs[objId].NEW);
    }
    public getAllObjects(): DataObj[] {
        return _.values(this.objs).map(trObj => trObj.NEW);
    }
    public getAllViewUpdates(): MapReduceViewUpdates<string | number>[] {
        let aggs = _.flatMap(_.values(this.objs), trObj => trObj.aggsViewsUpdates);
        let obs = _.flatMap(_.values(this.objs), trObj => trObj.obsViewsUpdates);
        let ret = aggs.concat(obs.map((o: MapViewUpdates<string | number>) => ({...o, reduce: [], reduceDelete: []})));
        return ret as MapReduceViewUpdates<string | number>[];
    }
    public getAllImpactedObjectIdsAndViewKeys(): string[] {
        return _.flatMap(_.values(this.objs), 
            trObj => [trObj.NEW._id]
            .concat(_.flatMap(trObj.aggsViewsUpdates, vupd => MapReduceView.strigifyViewUpdatesKeys(vupd)))
            .concat(_.flatMap(trObj.obsViewsUpdates, vupd => MapReduceView.strigifyViewUpdatesKeys(vupd)))
            );
    }
    public getLevels() { return this.levels }
}

class FailedValidationsError {
    error = "FailedValidationsError";

    constructor(public failedValidations: FailedValidation[]) { }
}

class TransactionAbortedError {
    constructor(public event: events.ServerEventModifiedFormDataEvent) {}
}

export class FrmdbTransactionRunner {
    private schemaDAO: SchemaDAO;
    constructor(private frmdbEngineStore: FrmdbEngineStore, private frmdbEngineTools: FrmdbEngineTools) {
        this.schemaDAO = this.frmdbEngineTools.schemaDAO;
    }

    private computeAutoCorrections(transacDAG: TransactionDAG, obj: DataObj, ex: FailedValidationsError): boolean {
        let objOLD = _.cloneDeep(obj);
        let saveObj = false;
        for (let failedValidation of ex.failedValidations) {
            for (let autoCorrection of this.schemaDAO.getAutoCorrections(obj._id, failedValidation.validationFullName)) {
                obj[autoCorrection.targetPropertyName] = evalExprES5(
                    Object.assign({ $ROW$: failedValidation.obsObj, $OLD$: objOLD }, obj),
                    autoCorrection.autoCorrectExpr);
                if (obj[autoCorrection.targetPropertyName] != objOLD[autoCorrection.targetPropertyName]) {
                    saveObj = true;
                }
                console.log(ll(transacDAG) + "|computeAutoCorrections: "
                    + obj._id + "[" + autoCorrection.targetPropertyName + "] = [" + autoCorrection.autoCorrectExpr.origExpr + "] = "
                    + obj[autoCorrection.targetPropertyName]);
            }
        }

        return saveObj;
    }

    public async computeFormulasAndSave(
        event: events.ServerEventModifiedFormDataEvent): Promise<events.MwzEvents> {

        let transacDAG: TransactionDAG;
        try {

            let newObj: boolean = false;
            if (isNewDataObjId(event.obj._id)) {
                event.obj._id = event.obj._id + generateUUID();
                newObj = true;
            }
            let originalObj = _.cloneDeep(event.obj);

            let getObjectIdsToSave = async (retryNb: number) => {
                Object.assign(event.obj, originalObj);
                for (let selfFormula of this.schemaDAO.getSelfFormulas(event.obj._id)) {
                    event.obj[selfFormula.targetPropertyName] = evalExprES5(event.obj, selfFormula.finalExpression);
                    console.log(new Date().toISOString() + "|" + event._id + "||computeFormulasAndSave| - selfFormula: " + event.obj._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + event.obj[selfFormula.targetPropertyName]);
                }
                for (let failedValidationRetry = 1; failedValidationRetry <= 2; failedValidationRetry++) {
                    transacDAG = new TransactionDAG(event._id, retryNb + "|" + failedValidationRetry);
                    let oldObj: DataObj | null = null;
                    if (!newObj) {
                        oldObj = await this.frmdbEngineStore.getDataObj(event.obj._id);
                        if (false/* TODO: with CouchDB it would be possible to detect conflicts based on _rev, we could implement _rev(s) in the generic storage layer since we already read the old version of objects before writing them */) {
                            //Someone has updated the object before us, we need to do auto-merging and overwrite only fields changed by us
                            //Currently we don't have this in our use-cases, the contention is on the computed formulas not on the observable objects (like OrderItem or FinancialTransaction)
                            //TODO
                            // throw new Error("Auto-merging needed for " + [event.obj._id, oldObj._rev, event.obj._rev].join(", "));
                        }
                    }
                    transacDAG.addObj(event.obj, oldObj, [], []);

                    try {
                        await this.preComputeNextTransactionDAGLevel(transacDAG);
                    } catch (ex) {
                        if (ex instanceof FailedValidationsError) {
                            transacDAG.haveFailedValidations = true;
                            this.computeAutoCorrections(transacDAG, event.obj, ex);
                            continue;
                        }
                        else throw ex;
                    }
                    transacDAG.haveFailedValidations = false;
                    break;
                }
                if (transacDAG.haveFailedValidations) throw new RetryableError("still haveFailedValidations after retries");

                return transacDAG.getAllImpactedObjectIdsAndViewKeys();
            }

            let saveObjects = async () => {
                let objsToSave = transacDAG.getAllObjects();
                console.log(ll(transacDAG) + "|computeFormulasAndSave|saveObjects: " + stringifyObj(objsToSave));
                let results = await this.frmdbEngineStore.putBulk(objsToSave);
                for (let res of results) {
                    if (isKeyValueError(res)) throw new Error("Unexpected error in saveObjects " + JSON.stringify(res) + "; full results: " + JSON.stringify(results));                        
                }
                let allViewsUpdates = transacDAG.getAllViewUpdates();
                for (let viewUpdate of allViewsUpdates) {
                    await this.frmdbEngineStore.updateViewForObj(viewUpdate);
                }
                transacDAG.finished = true;
            }
            await this.frmdbEngineStore.withLock(event._id, 
                0,
                getObjectIdsToSave, 
                saveObjects
            );

            if (transacDAG!.haveFailedValidations) {
                event.state_ = 'ABORT';
                event.reason_ = 'ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED';
                this.handleError(new TransactionAbortedError(event));//no await
            } else if (! transacDAG!.finished) {
                event.state_ = 'ABORT';
                event.reason_ = 'ABORTED_CONFLICT_RETRIES_EXCEEDED';
                this.handleError(new TransactionAbortedError(event));//no await
            }

        } catch (ex) {
            event.state_ = 'ABORT';
            event.reason_ = 'ABORT_ON_ERROR';
            event.error_ = "" + ex + '. Stack:' + ex.stack;
            this.handleError(new TransactionAbortedError(event));//no await
        }

        console.log(new Date().toISOString() + "|" + event._id + "|" + (null != transacDAG! ? transacDAG!.retry : -1) + "|FINISH|" + JSON.stringify(event));
        return event;
    }

    private async handleError(error: TransactionAbortedError) {
        try {
            await this.frmdbEngineStore.putTransaction(error.event);
        } catch (ex) {
            console.warn("Error during exception handling: ", ex);
        }
    }

    public validateObj(obsNew: DataObj): FailedValidation[] {
        let obsEntityName = parseDataObjId(obsNew._id).entityName;
        let failedValidations: FailedValidation[] = [];
        for (let vEntry of _.entries(this.schemaDAO.getValidations(obsNew._id))) {
            let [validationName, validation] = vEntry;
            if (evalExprES5(obsNew, validation.conditionExpr) == false) {
                failedValidations.push({
                    obsObj: obsNew,
                    validation: validation,
                    validationFullName: obsEntityName + '!' + validationName,
                });
            }
        }
        return failedValidations;
    }

    public async preComputeFormulasOfObj(obsNew: DataObj, compiledFormula: CompiledFormula) {
        let triggerValues: _.Dictionary<number | string> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                await this.frmdbEngineStore.getAggValueForObserver(obsNew, triggerOfFormula);
        }
        this.computeFormulaExprWithValidations(triggerValues, compiledFormula, obsNew);
    }

    private computeFormulaExprWithValidations(triggerValues: _.Dictionary<number | string>, compiledFormula: CompiledFormula, obsNew: DataObj): CompiledFormula[] {
        if (!compiledFormula.triggers) {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(obsNew, compiledFormula.finalExpression);
        } else if (compiledFormula.triggers.length === 1) {
            obsNew[compiledFormula.targetPropertyName] = triggerValues[compiledFormula.triggers[0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName];
        } else {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
        }

        let selfFormulas = this.schemaDAO.getSelfFormulas(obsNew._id);
        for (let selfFormula of selfFormulas) {
            obsNew[selfFormula.targetPropertyName] = evalExprES5(obsNew, selfFormula.finalExpression);
        }

        let failedValidations = this.validateObj(obsNew);

        if (failedValidations.length > 0) {
            throw new FailedValidationsError(failedValidations);
        }

        return selfFormulas;
    } 

    private async preComputeFormula(transacDAG: TransactionDAG, oblOld: DataObj | null, oblNew: DataObj, compiledFormula: CompiledFormula, obsOld: DataObj, obsNew: DataObj) {
        let oblEntityName = parseDataObjId(oblNew._id).entityName;
        let aggsViewUpdates: MapReduceViewUpdates<string | number>[] = [];
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];

        let triggerValues: _.Dictionary<number | string> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            if (triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName === oblEntityName) {
                aggsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, oblOld, oblNew));
                obsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapObserversImpactedByOneObservable.obsViewName, obsOld, obsNew));

                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.preComputeAggForObserverAndObservable(obsOld, oblOld, oblNew, triggerOfFormula);
            } else {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.getAggValueForObserver(oblOld, triggerOfFormula);
            }
        }

        let selfFormulas = this.computeFormulaExprWithValidations(triggerValues, compiledFormula, obsNew);
        console.log(ll(transacDAG) + "|preComputeFormula|" + oblNew._id + " --> " + obsOld._id + "[" + compiledFormula.targetPropertyName + "] = " + obsNew[compiledFormula.targetPropertyName] + " ($TRG$=" + JSON.stringify(triggerValues) + ") = [" + compiledFormula.finalExpression.origExpr + "]");
        for (let selfFormula of selfFormulas) {
            console.log(ll(transacDAG) + "|preComputeFormula| - selfFormula: " + obsNew._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + obsNew[selfFormula.targetPropertyName]);
        }

        transacDAG.addObj(obsNew, obsOld, aggsViewUpdates, obsViewUpdates);
    }

    private async preComputeNextTransactionDAGLevel(transactionDAG: TransactionDAG) {
        let currentLevel = transactionDAG.getCurrentLevelObjs();
        transactionDAG.incrementLevel();
        for (let trObj of currentLevel) {
            for (let compiledFormula of this.schemaDAO.getFormulas(trObj.NEW._id)) {
                await this.preComputeFormulasOfObj(trObj.NEW, compiledFormula);
            }

            for (let formulaTriggeredByObj of this.schemaDAO.getFormulasTriggeredByObj(trObj.NEW._id)) {
                for (let triggerOfFormula of formulaTriggeredByObj.formula.triggers || []) {
                    let observers = await this.frmdbEngineStore.getObserversOfObservableOldAndNew(trObj.OLD, trObj.NEW, triggerOfFormula);
                    for (let obs of observers) {
                        let obsNew = _.cloneDeep(obs);
                        await this.preComputeFormula(transactionDAG, trObj.OLD, trObj.NEW, formulaTriggeredByObj.formula, obs, obsNew);
                    }
                }
            }
        };
        if (transactionDAG.currentLevelSize() > 0) {
            await this.preComputeNextTransactionDAGLevel(transactionDAG);
        }
    }
}
