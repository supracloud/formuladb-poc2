/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { SchemaDAO, FormulaTriggeredByObj } from "@domain/metadata/schema_dao";
import { DataObj, parseDataObjId, isNewDataObjId, getChildrenPrefix, entityNameFromDataObjId } from "@domain/metadata/data_obj";

import { FrmdbEngineStore, RetryableError } from "./frmdb_engine_store";

import * as events from "@domain/event";
import * as _ from 'lodash';
import { CircularJSON } from "@domain/json-stringify";

import { isKeyValueError } from "@domain/key_value_obj";
import { generateShortUID, generateShortTimestampedUID } from "@domain/uuid";
import { CompiledFormula } from "@domain/metadata/execution_plan";
import { evalExpression } from "@functions/map_reduce_utils";
import { FailedValidation, FrmdbEngineTools } from "./frmdb_engine_tools";
import { MapReduceViewUpdates, MapReduceView, MapViewUpdates, initMapReduceViewUpdates } from "./map_reduce_view";
import { compileFormula } from "./formula_compiler";
import { ScalarType } from "@storage/key_value_store_i";
import { Pn, FormulaProperty, Entity, ReferenceToProperty } from "@domain/metadata/entity";
import { getOptionsForReferenceToProperty } from "./getOptionsForReferenceToProperty";
import { scalarFormulaEvaluate } from "./scalar_formula_evaluate";
import { validateAndCovertObjPropertyType } from "@domain/metadata/types";

function ll(transacDAG: TransactionDAG): string {
    return new Date().toISOString() + "|" + transacDAG.eventId + "|" + transacDAG.retry;
}
function stringifyObj(obj: DataObj | DataObj[]): string {
    let arr = obj instanceof Array ? obj : [obj];
    return arr.map(o => CircularJSON.stringify(_.omit(o, ['_revisions']))).join(", ");
}

interface TransactionDAGObj {
    objId: string;
    OLD: DataObj | null;
    NEW: DataObj | null;
    aggsViewsUpdates: MapReduceViewUpdates<string | number>[];
    obsViewsUpdates: MapViewUpdates<string | number>[];
}

class TransactionDAG {
    levels: Set<string>[] = [];
    objs: {
        [id: string]: TransactionDAGObj,
    } = {};
    currentLevel: number = 0;
    haveFailedValidations: boolean = false;
    finished: boolean = false;

    public clear(eventId: string, retry: string) {
        this.eventId = eventId;
        this.retry = retry;
        this.levels.length = 0;
        this.objs = {};
        this.currentLevel = 0;
        this.haveFailedValidations = false;
        this.finished = false;
    }

    constructor(public eventId: string, public retry: string) {
    }

    public addObj(
        newObj: DataObj | null,
        oldObj: DataObj | null,
        aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
        obsViewsUpdates: MapViewUpdates<string | number>[],
    ) {
        let start = Date.now();

        if (!oldObj && !newObj) throw new Error("one of OLD or NEW needs to be non null");
        if (oldObj && newObj && newObj._id !== oldObj._id) throw new Error("expected OLD id to equal NEW id " + JSON.stringify(newObj) + " // " + JSON.stringify(oldObj));
        if (newObj && this.objs[newObj._id]) {
            throw new Error("Circular dependency found for " + JSON.stringify(newObj) + ", current " + JSON.stringify(this.objs, null, 4));
        }
        let objId = oldObj ? oldObj._id : newObj!._id;

        this.objs[objId] = {
            objId,
            OLD: oldObj,
            NEW: newObj,
            aggsViewsUpdates,
            obsViewsUpdates,
        };
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push(new Set());
        }
        this.levels[this.currentLevel].add(objId);
        console.log(ll(this) + "|addObj|" + (Date.now() - start) + "ms; level=" + this.currentLevel + "|" + objId + "/" + JSON.stringify({ newObj, oldObj, aggsViewsUpdates, obsViewsUpdates }) + " in " + JSON.stringify(this.levels));
    }
    public getTrObj(id: string) {
        let ret = this.objs[id];
        if (null == ret) throw new Error("Obj id " + id + " does not exist in transaction " + CircularJSON.stringify(this, null, 4));
        return ret;
    }
    public hasObj(id: string) {
        return this.objs[id] != null;
    }
    public incrementLevel() {
        this.currentLevel++;
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push(new Set());
        }
    }
    public currentLevelSize() {
        return this.levels[this.currentLevel].size;
    }
    public getCurrentLevelObjs() {
        return Array.from(this.levels[this.currentLevel].values()).map(objId => this.objs[objId]);
    }
    public getLevelObjs(level: string[]) {
        return level.map(objId => this.objs[objId]);
    }
    public getLevelObjsForSave(level: string[]) {
        return level.map(objId => this.objs[objId].NEW);
    }
    public getAllObjectsToSave(): DataObj[] {
        let ret: DataObj[] = [];
        for (let obj of _.values(this.objs).map(trObj => trObj.NEW)) {
            if (obj != null) ret.push(obj);
        }
        return ret;
    }
    public getAllViewUpdates(): MapReduceViewUpdates<string | number>[] {
        let aggs = _.flatMap(_.values(this.objs), trObj => trObj.aggsViewsUpdates);
        let obs = _.flatMap(_.values(this.objs), trObj => trObj.obsViewsUpdates);
        let ret = aggs.concat(obs.map((o: MapViewUpdates<string | number>) => initMapReduceViewUpdates(o)));
        return ret as MapReduceViewUpdates<string | number>[];
    }
    public getAllImpactedObjectIdsAndViewKeys(): string[] {
        return _.flatMap(_.values(this.objs),
            trObj => (trObj.NEW ? [trObj.NEW._id] : [])
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
    constructor(public event: events.ServerEventModifiedFormData | events.ServerEventDeletedFormData) { }
}

export class FrmdbTransactionRunner {
    private get schemaDAO(): SchemaDAO {
        return this.frmdbEngineTools.schemaDAO;
    }
    constructor(private frmdbEngineStore: FrmdbEngineStore, private frmdbEngineTools: FrmdbEngineTools) {
    }

    private computeAutoCorrections(transacDAG: TransactionDAG, obj: DataObj, ex: FailedValidationsError): boolean {
        let objOLD = _.cloneDeep(obj);
        let saveObj = false;
        for (let failedValidation of ex.failedValidations) {
            for (let autoCorrection of this.schemaDAO.getAutoCorrections(obj._id, failedValidation.validationFullName)) {
                obj[autoCorrection.targetPropertyName] = evalExpression(
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

            await this.computeHlookups(event.currentDataObj);
            this.computeFormulaExpr(triggerValues, compiledFormula, event.currentDataObj);
            this.applyValidations(event.currentDataObj);

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
            let modifiedEntity = _.cloneDeep(await this.frmdbEngineStore.getEntity(event.targetEntity._id));
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
                //FIXME: formula and objects must be part of a transaction
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
                        type_: "ServerEventModifiedFormData",
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
            console.error(ex);
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

    private async getChildObjects(obj: DataObj): Promise<DataObj[]> {
        let ret: DataObj[] = [];
        let { entityId, id, uid } = parseDataObjId(obj._id);
        let entity = await this.frmdbEngineStore.getEntity(entityId);
        if (!entity) throw new Error("Cannot find children of object with missing entity " + obj._id);
        for (let prop of Object.values(entity.props)) {
            if (prop.propType_ === Pn.CHILD_TABLE && prop.referencedEntityName) {
                ret = ret.concat(await this.frmdbEngineStore.getDataListByPrefix(getChildrenPrefix(prop.referencedEntityName, uid)));
            }
        }
        return ret;
    }

    private async prepareDeleteObj(transacDAG: TransactionDAG,
        newObj: DataObj, oldObj: DataObj | null) {
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];
        for (let compiledFormula of this.schemaDAO.getFormulas(newObj._id)) {
            obsViewUpdates.push.apply(obsViewUpdates,
                await this.preComputeNonSelfFormulaOfTransactionRootObj(newObj, null, compiledFormula));
        }
        //TODO: this is not transactional
        for (let childObj of (await this.getChildObjects(newObj))) {
            let childDelEvent = new events.ServerEventDeletedFormData(childObj);
            childDelEvent._id = transacDAG.eventId + '__';
            await this.computeFormulasAndSave(childDelEvent);
        }
        transacDAG.addObj(null, newObj, [], obsViewUpdates);
    }

    private async prepareModifyAddObj(transacDAG: TransactionDAG,
        newObj: DataObj, oldObj: DataObj | null) {
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];
        for (let compiledFormula of this.schemaDAO.getFormulas(newObj._id)) {
            obsViewUpdates.push.apply(obsViewUpdates,
                await this.preComputeNonSelfFormulaOfTransactionRootObj(oldObj, newObj, compiledFormula));
        }
        await this.computeHlookups(newObj);
        for (let selfFormula of this.schemaDAO.getSelfFormulas(newObj._id)) {
            newObj[selfFormula.targetPropertyName] = evalExpression(newObj, selfFormula.finalExpression);
            console.log(new Date().toISOString() + "|" + newObj + "||computeFormulasAndSave| - selfFormula: " + newObj._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + newObj[selfFormula.targetPropertyName]);
        }
        
        this.applyValidations(newObj);

        transacDAG.addObj(newObj, oldObj, [], obsViewUpdates);
    }

    private async prepareObjWithIdChange(transacDAG: TransactionDAG,
        newObj: DataObj, oldObj: DataObj) {
        await this.prepareModifyAddObj(transacDAG, newObj, null);
        await this.prepareDeleteObj(transacDAG, oldObj, null);
    }

    private async prepareTransaction(event: events.ServerEventModifiedFormData
        | events.ServerEventDeletedFormData, transacDAG: TransactionDAG,
        originalObj: DataObj, oldObj: DataObj | null) {
        Object.assign(event.obj, originalObj);

        for (let failedValidationRetry = 1; failedValidationRetry <= 2; failedValidationRetry++) {
            transacDAG.clear(event._id, '|' + failedValidationRetry);

            if (event.type_ === "ServerEventDeletedFormData") {
                await this.prepareDeleteObj(transacDAG, event.obj, oldObj);
            } else {

                if (oldObj && event.obj._id != oldObj._id) {
                    throw new Error(`_id has changed ${event.obj._id}, ${oldObj._id}`);
                    // await this.prepareObjWithIdChange(transacDAG, event.obj, oldObj);
                } else {
                    await this.prepareModifyAddObj(transacDAG, event.obj, oldObj);
                }
            }

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

    public async preComputeOnly(event: events.ServerEventPreComputeFormData) {
        let oldObj = await this.computeIds(event);
        let originalObj = _.cloneDeep(event.obj);
        let transacDAG = new TransactionDAG(event._id, '|0');
        await this.prepareTransaction(events.ServerEventModifiedFormData.fromPreComputeEvent(event),
            transacDAG, originalObj, oldObj);
    }

    async computeIds(event: events.ServerEventModifiedFormData | events.ServerEventDeletedFormData | events.ServerEventPreComputeFormData): Promise<DataObj | null> {
        let oldObj: DataObj | null = null;
        let newComputedObjId: string | null = null;
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(event.obj._id))
        if (entity?.props?._id.propType_ === Pn.KEY) {
            newComputedObjId = entity._id + '~~' + scalarFormulaEvaluate(event.obj, entity.props._id.scalarFormula);
        }

        if (isNewDataObjId(event.obj._id)) {
            if (event.type_ === "ServerEventDeletedFormData") throw new Error("Deleting a new object is not possible " + event.obj._id);
            if (newComputedObjId) event.obj._id = newComputedObjId;
            else event.obj._id = event.obj._id.replace('$AUTOID', '') + generateShortUID();
        } else {
            oldObj = await this.frmdbEngineStore.getDataObj(event.obj._id);
            // if (newComputedObjId && newComputedObjId != event.obj._id) event.obj._id = newComputedObjId;
            //TODO: _id must always be auto-generated uid and KEY must be a different type of column that points to the uid
        }

        return oldObj;
    }

    public async computeFormulasAndSave(
        event: events.ServerEventModifiedFormData | events.ServerEventDeletedFormData): Promise<events.MwzEvents> {

        let transacDAG;
        try {
            event._id == event._id || generateShortTimestampedUID();

            let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(event.obj._id))
            if (!entity) throw new Error(`Cannot find table definition for object ${JSON.stringify(event.obj)}`);
            let errMsg = this.frmdbEngineStore.validateAndConvertObjFields(event.obj, entity);
            if (errMsg) throw new Error(`Error saving ${event.obj._id}: ${errMsg}`);

            let oldObj = await this.computeIds(event);
            let originalObj = _.cloneDeep(event.obj);

            let getObjectIdsToSave = async () => {
                transacDAG = new TransactionDAG(event._id, '|0');
                return this.prepareTransaction(event, transacDAG, originalObj, oldObj);
            }

            let saveObjects = async () => {
                let objsToSave = transacDAG.getAllObjectsToSave();
                console.log(ll(transacDAG) + "|computeFormulasAndSave|saveObjects: " + stringifyObj(objsToSave));
                if (event.type_ === "ServerEventDeletedFormData") {
                    await this.frmdbEngineStore.delDataObj(event.obj._id);
                }
                let results = await this.frmdbEngineStore.putBulk(objsToSave);
                for (let res of results) {
                    if (isKeyValueError(res)) throw new Error("Unexpected error in saveObjects " + CircularJSON.stringify(res) + "; full results: " + CircularJSON.stringify(results));
                }
                let allViewsUpdates = transacDAG.getAllViewUpdates();
                for (let viewUpdate of allViewsUpdates) {
                    await this.frmdbEngineStore.updateViewForObj(viewUpdate);
                }
                transacDAG.finished = true;
                event.updatedObjs = objsToSave;
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
            if (ex instanceof FailedValidationsError) {
                event.reason_ = 'ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED';
                event.error_ = "Failed Validations: " + ex.failedValidations.map(v => v.validationFullName).join(", ");
            } else {
                event.reason_ = 'ABORT_ON_ERROR';
                event.error_ = ex?.message || ex;
            }
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
        let obsEntityName = parseDataObjId(obsNew._id).entityId;
        let failedValidations: FailedValidation[] = [];
        for (let vEntry of _.entries(this.schemaDAO.getValidations(obsNew._id))) {
            let [validationName, validation] = vEntry;
            if (evalExpression(obsNew, validation.conditionExpr) == false) {
                failedValidations.push({
                    obsObj: obsNew,
                    validation: validation,
                    validationFullName: obsEntityName + '!' + validationName,
                });
            }
        }
        return failedValidations;
    }

    public async preComputeNonSelfFormulaOfTransactionRootObj(obsOld: DataObj | null, obsNew: DataObj | null, compiledFormula: CompiledFormula): Promise<MapViewUpdates<string | number>[]> {
        if (!compiledFormula.triggers || compiledFormula.triggers.length == 0) return [];
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];
        let triggerValues: _.Dictionary<ScalarType> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            obsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapObserversImpactedByOneObservable.obsViewName, obsOld, obsNew));

            if (obsNew) {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.getAggValueForObserver(obsNew, triggerOfFormula);
            }
        }
        if (obsNew) {
            this.computeFormulaExpr(triggerValues, compiledFormula, obsNew);
        }

        return obsViewUpdates;
    }

    private async computeHlookups(obj: DataObj) {
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(obj._id))
        let referenceToProps: Map<string, ReferenceToProperty> = new Map();
        for (let prop of Object.values(entity?.props||{})) {
            if (prop.propType_ === Pn.REFERENCE_TO) referenceToProps.set(prop.name, prop);
        }
        for (let prop of Object.values(entity?.props||{})) {
            if (prop.propType_ === Pn.HLOOKUP) {
                let refToProp = referenceToProps.get(prop.referenceToPropertyName);
                if (!refToProp) { console.error(`Reference to column not found for ${JSON.stringify(prop)} //// ${JSON.stringify(obj)}`); continue }
                let referencedObjId = obj[refToProp.name];
                let referencedObj: DataObj | null = null;
                if (referencedObjId) {
                    referencedObj = await this.frmdbEngineStore.getDataObj(referencedObjId);
                }
                if (!referencedObj) { console.error(`Referenced record not found for ${JSON.stringify(prop)} //// ${JSON.stringify(prop)}, ${JSON.stringify(obj)} //// ${JSON.stringify(refToProp)}`); continue }
                obj[prop.name] = referencedObj[prop.referencedPropertyName];
            }
        }
    }

    private computeFormulaExpr(triggerValues: _.Dictionary<ScalarType>, compiledFormula: CompiledFormula, obsNew: DataObj): CompiledFormula[] {
        if (!compiledFormula.triggers) {
            obsNew[compiledFormula.targetPropertyName] = evalExpression(obsNew, compiledFormula.finalExpression);
        } else {
            obsNew[compiledFormula.targetPropertyName] = evalExpression(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
        }

        let selfFormulas = this.schemaDAO.getSelfFormulas(obsNew._id);
        for (let selfFormula of selfFormulas) {
            if (selfFormula.targetPropertyName === compiledFormula.targetPropertyName) continue;
            obsNew[selfFormula.targetPropertyName] = evalExpression(obsNew, selfFormula.finalExpression);
        }

        return selfFormulas;
    }

    private async applyValidations(obj: DataObj) {
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(obj._id))
        if (!entity) throw new Error(`Cannot find entity for ${obj._id}`);
        let errMsg = this.frmdbEngineStore.validateAndConvertObjFields(obj, entity);
        if (errMsg) {
            throw new FailedValidationsError([{
                validationFullName: `${entity._id}!validateColumnTypeAndRequired`,
                obsObj: obj,
                errorMessage: errMsg 
            }]);
        }

        let failedValidations = this.validateObj(obj);
        if (failedValidations.length > 0) {
            throw new FailedValidationsError(failedValidations);
        }
    }

    private async preComputeFormula(oblId: string, transacDAG: TransactionDAG, oblOld: DataObj | null, oblNew: DataObj | null, compiledFormula: CompiledFormula, obsOld: DataObj, obsNew: DataObj) {
        if (!oblOld && !oblNew) throw new Error("preComputeFormula both old and new observables cannot be null");
        let oblEntityName = parseDataObjId(oblId).entityId;
        let aggsViewUpdates: MapReduceViewUpdates<string | number>[] = [];
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];

        let triggerValues: _.Dictionary<number | string> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            if (triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId === oblEntityName) {
                aggsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, oblOld, oblNew));
                obsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapObserversImpactedByOneObservable.obsViewName, obsOld, obsNew));

                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.preComputeAggForObserverAndObservable(obsOld, oblOld, oblNew, triggerOfFormula);
            } else {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.getAggValueForObserver(obsOld, triggerOfFormula);
            }
        }

        let selfFormulas = this.computeFormulaExpr(triggerValues, compiledFormula, obsNew);
        console.log(ll(transacDAG) + "|preComputeFormula|" + oblId + " --> " + obsOld._id + "[" + compiledFormula.targetPropertyName + "] = " + obsNew[compiledFormula.targetPropertyName] + " ($TRG$=" + JSON.stringify(triggerValues) + ") = [" + compiledFormula.finalExpression.origExpr + "]");
        for (let selfFormula of selfFormulas) {
            console.log(ll(transacDAG) + "|preComputeFormula| - selfFormula: " + obsNew._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + obsNew[selfFormula.targetPropertyName]);
        }

        transacDAG.addObj(obsNew, obsOld, aggsViewUpdates, obsViewUpdates);
    }

    private async preComputeNextTransactionDAGLevel(transactionDAG: TransactionDAG) {
        let currentLevel = transactionDAG.getCurrentLevelObjs();
        transactionDAG.incrementLevel();
        for (let trObj of currentLevel) {

            // let observersTriggeredByObj: Map<string, { 
            //     obs: DataObj, 
            //     entityId: string,
            //     formulaProps: {[name: string]: {
            //         propertyName: string;
            //         formula: CompiledFormula;
            //         triggersToCompute: [{
            //             trigger: MapReduceTrigger
            //         }],
            //     }}
            //     formulaTriggeredByObj: FormulaTriggeredByObj 
            // }> = new Map();

            let observersTriggeredByObj: Map<string, { obs: DataObj, formulaTriggeredByObj: FormulaTriggeredByObj }> = new Map();
            for (let formulaTriggeredByObj of this.schemaDAO.getFormulasTriggeredByObj(trObj.objId)) {
                for (let triggerOfFormula of formulaTriggeredByObj.formula.triggers || []) {
                    let obss = await this.frmdbEngineStore.getObserversOfObservableOldAndNew(trObj.OLD, trObj.NEW, triggerOfFormula);
                    for (let obs of obss) { observersTriggeredByObj.set(obs._id, { obs, formulaTriggeredByObj }) }
                }
            }
            for (let obsTrgByObj of Array.from(observersTriggeredByObj.values())) {
                if (transactionDAG.hasObj(obsTrgByObj.obs._id)) {
                    console.warn(ll(transactionDAG) + "|preComputeNextTransactionDAGLevel| obj " + obsTrgByObj.obs._id + "already computed by this transaction");
                    continue;
                }
                let obsNew = _.cloneDeep(obsTrgByObj.obs);
                await this.preComputeFormula(trObj.objId, transactionDAG, trObj.OLD, trObj.NEW, obsTrgByObj.formulaTriggeredByObj.formula, obsTrgByObj.obs, obsNew);
            }
        };
        if (transactionDAG.currentLevelSize() > 0) {
            await this.preComputeNextTransactionDAGLevel(transactionDAG);
        }
    }
}
