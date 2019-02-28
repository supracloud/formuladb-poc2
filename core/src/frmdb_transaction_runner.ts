/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { SchemaDAO, FormulaTriggeredByObj } from "@core/domain/metadata/schema_dao";
import { DataObj, parseDataObjId, isNewDataObjId } from "@core/domain/metadata/data_obj";

import { FrmdbEngineStore, RetryableError } from "./frmdb_engine_store";

import * as events from "@core/domain/event";
import * as _ from 'lodash';
import * as CircularJSON from "circular-json";

import { isKeyValueError } from "@core/domain/key_value_obj";
import { generateUUID } from "@core/domain/uuid";
import { CompiledFormula } from "@core/domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { FailedValidation, FrmdbEngineTools } from "./frmdb_engine_tools";
import { MapReduceViewUpdates, MapReduceView, MapViewUpdates } from "./map_reduce_view";
import { compileFormula } from "./formula_compiler";
import { ScalarType } from "./key_value_store_i";
import { Pn, FormulaProperty } from "./domain/metadata/entity";

function ll(transacDAG: TransactionDAG): string {
    return new Date().toISOString() + "|" + transacDAG.eventId + "|" + transacDAG.retry;
}
function stringifyObj(obj: DataObj | DataObj[]): string {
    let arr = obj instanceof Array ? obj : [obj];
    return arr.map(o => CircularJSON.stringify(_.omit(o, ['_revisions']))).join(", ");
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
    ) {
        let start = Date.now();

        if (oldObj && newObj._id !== oldObj._id) throw new Error("expected OLD id to equal NEW id " + CircularJSON.stringify(newObj) + " // " + CircularJSON.stringify(oldObj));
        if (this.objs[newObj._id]) {
            throw new Error("Circular dependency found for " + CircularJSON.stringify(newObj) + ", current " + CircularJSON.stringify(this.objs, null, 4));
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
        console.log(ll(this) + "|addObj|" + (Date.now() - start) + "ms; level=" + this.currentLevel + "|" + newObj._id + "/" + CircularJSON.stringify({ newObj, oldObj, aggsViewsUpdates, obsViewsUpdates }) + " in " + CircularJSON.stringify(this.levels));
    }
    public getTrObj(id: string) {
        let ret = this.objs[id];
        if (null == ret) throw new Error("Obj id " + id + " does not exist in transaction " + CircularJSON.stringify(this, null, 4));
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
        let ret = aggs.concat(obs.map((o: MapViewUpdates<string | number>) => ({ ...o, reduce: [], reduceDelete: [] })));
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
    constructor(public event: events.ServerEventModifiedFormDataEvent) { }
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


    public async previewFormula(event: events.ServerEventPreviewFormula) {
        try {
            let compiledFormula = compileFormula(event.targetEntity._id, event.targetPropertyName, event.formula);
            let triggerValues: _.Dictionary<ScalarType> = {};
            for (let triggerOfFormula of compiledFormula.triggers || []) {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.mapReduceAdHocQuery(event.currentDataObj,
                        triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                        triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
            }

            this.computeFormulaExprWithValidations(triggerValues, compiledFormula, event.currentDataObj);

        } catch (ex) {
            event.state_ = 'ABORT';
            event.notifMsg_ = '' + ex;
            try {
                await this.frmdbEngineStore.putTransaction(event);
            } catch (ex2) {
                console.warn("Error during event save on failure", ex2, event);
            }
        }
        return Promise.resolve(event);
    }

    public async setEntityProperty(event: events.ServerEventSetProperty) {
        try {
            let modifiedEntity = await this.frmdbEngineStore.getEntity(event.targetEntity._id);
            if (!modifiedEntity) throw new Error("Cannot modify non existent entity " + event.targetEntity._id + ", " + CircularJSON.stringify(event.property));

            if (Pn.FORMULA == event.property.propType_) {
                let compiledFormula = compileFormula(event.targetEntity._id, event.property.name, event.property.formula);
                let oldProp = event.targetEntity.props[event.property.name];
                let oldCompiledFormula;
                if (Pn.FORMULA === oldProp.propType_) {
                    oldCompiledFormula = compileFormula(event.targetEntity._id, oldProp.name, oldProp.formula);
                }
                await this.frmdbEngineStore.installFormula(compiledFormula, true);

                event.property.compiledFormula_ = compiledFormula;
                modifiedEntity.props[event.property.name] = event.property;
                await this.frmdbEngineStore.putEntity(modifiedEntity);

                if (oldCompiledFormula) {
                    // await this.frmdbEngineStore.uninstallFormula(oldCompiledFormula);
                    //FIXME: the view name is the actual formula which may be still in use !?
                }

                //FIXME re-compute data asynchronously, not wait for all objects to be re-computed and then reply to the server
                await this.frmdbEngineStore.initViewsForNewFormula(oldCompiledFormula, compiledFormula);
                let affectedObjs = await this.frmdbEngineStore.getDataListByPrefix(event.targetEntity._id + '~~');
                let i = 0;
                for (let obj of affectedObjs) {
                    i++;
                    await this.computeFormulasAndSave({
                        _id: event._id + '-' + i,
                        type_: events.ServerEventModifiedFormDataN,
                        state_: "BEGIN",
                        clientId_: event.clientId_,
                        obj: obj,
                    });
                }
            } else {
                modifiedEntity.props[event.property.name] = event.property;
                await this.frmdbEngineStore.putEntity(modifiedEntity);
            }
        } catch (ex) {
            event.state_ = 'ABORT';
            event.notifMsg_ = '' + ex;
            try {
                await this.frmdbEngineStore.putTransaction(event);
            } catch (ex2) {
                console.warn("Error during event save on failure", ex2, event);
            }
        }
        return Promise.resolve(event);
    }

    public async deleteEntityProperty(event: events.ServerEventDeleteProperty) {
        try {
            let modifiedEntity = _.cloneDeep(event.targetEntity);

            let oldProp = event.targetEntity.props[event.propertyName];
            if (Pn.FORMULA === oldProp.propType_) {
                let oldCompiledFormula = compileFormula(event.targetEntity._id, oldProp.name, oldProp.formula);
                //FIXME: the view name is the actual formula which may be still in use !?
                // await this.frmdbEngineStore.uninstallFormula(oldCompiledFormula);
            }

            delete modifiedEntity.props[event.propertyName];
            await this.frmdbEngineStore.putEntity(modifiedEntity);
        } catch (ex) {
            event.state_ = 'ABORT';
            event.notifMsg_ = '' + ex;
            try {
                await this.frmdbEngineStore.putTransaction(event);
            } catch (ex2) {
                console.warn("Error during event save on failure", ex2, event);
            }
        }
        return Promise.resolve(event);
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

                for (let compiledFormula of this.schemaDAO.getFormulas(event.obj._id)) {
                    await this.preComputeNonSelfFormulaOfObj(event.obj, compiledFormula);
                }
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
                    if (isKeyValueError(res)) throw new Error("Unexpected error in saveObjects " + CircularJSON.stringify(res) + "; full results: " + CircularJSON.stringify(results));
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
            } else if (!transacDAG!.finished) {
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

        console.log(new Date().toISOString() + "|" + event._id + "|" + (null != transacDAG! ? transacDAG!.retry : -1) + "|FINISH|" + CircularJSON.stringify(event));
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

    public async preComputeNonSelfFormulaOfObj(obsNew: DataObj, compiledFormula: CompiledFormula) {
        if (!compiledFormula.triggers || compiledFormula.triggers.length == 0) return;
        let triggerValues: _.Dictionary<ScalarType> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                await this.frmdbEngineStore.getAggValueForObserver(obsNew, triggerOfFormula);
        }
        this.computeFormulaExprWithValidations(triggerValues, compiledFormula, obsNew);
    }

    private computeFormulaExprWithValidations(triggerValues: _.Dictionary<ScalarType>, compiledFormula: CompiledFormula, obsNew: DataObj): CompiledFormula[] {
        if (!compiledFormula.triggers) {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(obsNew, compiledFormula.finalExpression);
        } else {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
        }

        let selfFormulas = this.schemaDAO.getSelfFormulas(obsNew._id);
        for (let selfFormula of selfFormulas) {
            if (selfFormula.targetPropertyName === compiledFormula.targetPropertyName) continue;
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
        console.log(ll(transacDAG) + "|preComputeFormula|" + oblNew._id + " --> " + obsOld._id + "[" + compiledFormula.targetPropertyName + "] = " + obsNew[compiledFormula.targetPropertyName] + " ($TRG$=" + CircularJSON.stringify(triggerValues) + ") = [" + compiledFormula.finalExpression.origExpr + "]");
        for (let selfFormula of selfFormulas) {
            console.log(ll(transacDAG) + "|preComputeFormula| - selfFormula: " + obsNew._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + obsNew[selfFormula.targetPropertyName]);
        }

        transacDAG.addObj(obsNew, obsOld, aggsViewUpdates, obsViewUpdates);
    }

    private async preComputeNextTransactionDAGLevel(transactionDAG: TransactionDAG) {
        let currentLevel = transactionDAG.getCurrentLevelObjs();
        transactionDAG.incrementLevel();
        for (let trObj of currentLevel) {
            let observersTriggeredByObj: Map<string, {obs: DataObj, formulaTriggeredByObj: FormulaTriggeredByObj}> = new Map();
            for (let formulaTriggeredByObj of this.schemaDAO.getFormulasTriggeredByObj(trObj.NEW._id)) {
                for (let triggerOfFormula of formulaTriggeredByObj.formula.triggers || []) {
                    let obss = await this.frmdbEngineStore.getObserversOfObservableOldAndNew(trObj.OLD, trObj.NEW, triggerOfFormula);
                    for (let obs of obss) {observersTriggeredByObj.set(obs._id, {obs, formulaTriggeredByObj})}
                }
            }
            for (let obsTrgByObj of observersTriggeredByObj.values()) {
                let obsNew = _.cloneDeep(obsTrgByObj.obs);
                await this.preComputeFormula(transactionDAG, trObj.OLD, trObj.NEW, obsTrgByObj.formulaTriggeredByObj.formula, obsTrgByObj.obs, obsNew);
            }            
        };
        if (transactionDAG.currentLevelSize() > 0) {
            await this.preComputeNextTransactionDAGLevel(transactionDAG);
        }
    }
}
