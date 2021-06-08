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

import { isKeyValueError, KeyValueObjIdType, _idAsStr } from "@domain/key_value_obj";
import { generateShortUID, generateShortTimestampedUID } from "@domain/uuid";
import { CompiledFormula } from "@domain/metadata/execution_plan";
import { evalExpression } from "@functions/map_reduce_utils";
import { FrmdbEngineTools } from "./frmdb_engine_tools";
import { MapReduceViewUpdates, MapReduceView, MapViewUpdates, initMapReduceViewUpdates } from "./map_reduce_view";
import { compileFormula } from "./formula_compiler";
import { ScalarType } from "@storage/key_value_store_i";
import { Pn, ScalarFormulaProperty, Entity, ReferenceToProperty, referenceToPropsOf } from "@domain/metadata/entity";
import { scalarFormulaEvaluate, annotateScalarFormulaWithValues } from "./scalar_formula_evaluate";
import { validateAndConvertObjFields } from "@core/validate-schema-types";
import { FailedValidation, getValidationFullName } from "@domain/errors";
import { FormulaStaticCheckerTokenizer } from "./formula_static_checker_tokenizer";
import { compileFormulaWithStaticCheck } from "./formula_compiler_with_static_checking";
import { isNumericColumnTypes } from "@domain/metadata/types";
import { _throw } from "./throw";
import { KEY_SEPARATOR } from "@functions/scalar_functions_implementations";

function ll(transacDAG: TransactionDAG): string {
    return new Date().toISOString() + "|" + transacDAG.eventId + "|" + transacDAG.retry;
}
function stringifyObj(obj: DataObj | DataObj[]): string {
    let arr = obj instanceof Array ? obj : [obj];
    return arr.map(o => CircularJSON.stringify(_.omit(o, ['_revisions']))).join(", ");
}

interface TransactionDAGObjBase {
    objId: KeyValueObjIdType;
    aggsViewsUpdates: MapReduceViewUpdates<string | number>[];
    obsViewsUpdates: MapViewUpdates<string | number>[];
}
interface TransactionDAGObjForObjAdd extends TransactionDAGObjBase {
    oper: "Add",
    NEW: DataObj;
}
interface TransactionDAGObjForObjDelete extends TransactionDAGObjBase {
    oper: "Delete",
    OLD: DataObj;
}
interface TransactionDAGObjForObjModify extends TransactionDAGObjBase {
    oper: "Modify",
    OLD: DataObj;
    NEW: DataObj;
}
export type TransactionDAGObj =
    | TransactionDAGObjForObjAdd
    | TransactionDAGObjForObjDelete
    | TransactionDAGObjForObjModify
    ;

function oldTrObj(trObj: TransactionDAGObj): DataObj | null {
    if (trObj.oper === "Add") return null;
    else return trObj.OLD;
}
function newTrObj(trObj: TransactionDAGObj): DataObj | null {
    if (trObj.oper === "Delete") return null;
    else return trObj.NEW;
}
function trObjId(trObj: TransactionDAGObj): KeyValueObjIdType {
    if (trObj.oper === "Delete") return trObj.OLD._id;
    else return trObj.NEW._id;
}

class TransactionDAG {
    levels: Set<string>[] = [];
    objs: {
        [id: string]: TransactionDAGObj,
    } = {};
    currentLevel: number = 0;
    failedValidations: FailedValidation[] = [];
    finished: boolean = false;

    public clear(eventId: string, retry: string) {
        this.eventId = eventId;
        this.retry = retry;
        this.levels.length = 0;
        this.objs = {};
        this.currentLevel = 0;
        this.failedValidations = [];
        this.finished = false;
    }

    constructor(public eventId: string, public retry: string) {
    }

    public addObjForModify(
        oldObj: DataObj,
        newObj: DataObj,
        aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
        obsViewsUpdates: MapViewUpdates<string | number>[],
    ) {
        if (oldObj && newObj && newObj._id !== oldObj._id) throw new Error("expected OLD id to equal NEW id " + JSON.stringify(newObj) + " // " + JSON.stringify(oldObj));
        if (this.objs[_idAsStr(newObj._id)]) {
            throw new Error("Circular dependency found for " + JSON.stringify(newObj) + ", current " + JSON.stringify(this.objs, null, 4));
        }
        this.addObj({
            objId: oldObj._id,
            aggsViewsUpdates,
            obsViewsUpdates,
            oper: "Modify",
            OLD: oldObj,
            NEW: newObj,
        });
    }

    public addObjForAdd(
        newObj: DataObj,
        aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
        obsViewsUpdates: MapViewUpdates<string | number>[],
    ) {
        if (this.objs[_idAsStr(newObj._id)]) {
            throw new Error("Circular dependency found for " + JSON.stringify(newObj) + ", current " + JSON.stringify(this.objs, null, 4));
        }
        this.addObj({
            objId: newObj._id,
            aggsViewsUpdates,
            obsViewsUpdates,
            oper: "Add",
            NEW: newObj,
        });
    }

    public addObjForDelete(
        oldObj: DataObj,
        aggsViewsUpdates: MapReduceViewUpdates<string | number>[],
        obsViewsUpdates: MapViewUpdates<string | number>[],
    ) {

        this.addObj({
            objId: oldObj._id,
            aggsViewsUpdates,
            obsViewsUpdates,
            oper: "Delete",
            OLD: oldObj,
        });
    }

    private addObj(trObj: TransactionDAGObj) {
        let start = Date.now();
        let objId = _idAsStr(trObj.objId);
        this.objs[objId] = trObj;
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push(new Set());
        }
        this.levels[this.currentLevel].add(objId);
        console.log(ll(this) + "|addObj|" + (Date.now() - start) + "ms; level=" +
            this.currentLevel + "|" + objId + "/" +
            JSON.stringify(trObj) +
            " in " + JSON.stringify(this.levels));
    }
    public hasObj(id: KeyValueObjIdType) {
        return this.objs[_idAsStr(id)] != null;
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
    public getCurrentLevelObjs(): TransactionDAGObj[] {
        return Array.from(this.levels[this.currentLevel].values()).map(objId => this.objs[objId]);
    }
    public getLevelObjs(level: string[]) {
        return level.map(objId => this.objs[objId]);
    }
    public getAllObjectsToSave(): DataObj[] {
        let ret: DataObj[] = [];
        for (let trObj of _.values(this.objs)) {
            if (trObj.oper === "Delete") {
                //TODO, support multiple deletions per transaction
            } else ret.push(trObj.NEW);
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
            trObj => ([_idAsStr(trObj.objId)])
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

export class FrmdbEngineTransactionRunner {
    private get schemaDAO(): SchemaDAO {
        return this.frmdbEngineTools.schemaDAO;
    }
    constructor(private frmdbEngineStore: FrmdbEngineStore, private frmdbEngineTools: FrmdbEngineTools) {
    }

    private computeAutoCorrections(transacDAG: TransactionDAG, obj: DataObj, ex: FailedValidationsError): boolean {
        let objOLD = _.cloneDeep(obj);
        let saveObj = false;
        for (let failedValidation of ex.failedValidations) {
            for (let autoCorrection of Object.values(this.schemaDAO.getAutoCorrections(obj._id, failedValidation.tableName, failedValidation.invalidColName))) {
                obj[autoCorrection.targetPropertyName] = scalarFormulaEvaluate(
                    Object.assign({ $ROW$: failedValidation.obj, $OLD$: objOLD }, obj),
                    autoCorrection.scalarFormula);
                if (obj[autoCorrection.targetPropertyName] != objOLD[autoCorrection.targetPropertyName]) {
                    saveObj = true;
                }
                console.log(ll(transacDAG) + "|computeAutoCorrections: "
                    + obj._id + "[" + autoCorrection.targetPropertyName + "] = [" + autoCorrection.scalarFormula + "] = "
                    + obj[autoCorrection.targetPropertyName]);
            }
        }

        return saveObj;
    }

    checkAndCompileFormula(targetEntityName: string, targetPropertyName: string, formula: string) {
        return compileFormulaWithStaticCheck(this.schemaDAO.schema, targetEntityName, targetPropertyName, formula);
    }

    public async previewFormula(event: events.ServerEventPreviewFormula) {
        try {
            let compiledFormula = this.checkAndCompileFormula(event.targetEntity._id, event.targetPropertyName, event.formula).compiledFormula_;
            let triggerValues: _.Dictionary<ScalarType> = {};
            for (let triggerOfFormula of compiledFormula.triggers || []) {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.mapReduceAdHocQuery(event.currentDataObj,
                        triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                        triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.reduceFun);
            }

            await this.computeHlookups(event.currentDataObj);
            this.computeFormulaExpr(triggerValues, compiledFormula, event.currentDataObj);
            await this.applyValidations(event.currentDataObj);

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

            if (Pn.SCALAR_FORMULA == event.property.propType_ || Pn.AGGREGATE_FORMULA == event.property.propType_) {
                let { compiledFormula_, returnType_ } = this.checkAndCompileFormula(event.targetEntity._id, event.property.name, event.property.formula);
                let oldProp = event.targetEntity.props[event.property.name];
                let oldCompiledFormula;
                if (Pn.SCALAR_FORMULA == oldProp.propType_ || Pn.AGGREGATE_FORMULA == oldProp.propType_) {
                    oldCompiledFormula = this.checkAndCompileFormula(event.targetEntity._id, oldProp.name, oldProp.formula);
                }
                await this.frmdbEngineStore.installFormula(compiledFormula_, true);

                event.property.compiledFormula_ = compiledFormula_;
                event.property.returnType_ = returnType_;
                modifiedEntity.props[event.property.name] = event.property;
                //FIXME: formula and objects must be part of a transaction
                await this.frmdbEngineStore.putEntity(modifiedEntity);

                if (oldCompiledFormula) {
                    // await this.frmdbEngineStore.uninstallFormula(oldCompiledFormula);
                    //FIXME: the view name is the actual formula which may be still in use !?
                }

                //FIXME re-compute data asynchronously, not wait for all objects to be re-computed and then reply to the server
                await this.frmdbEngineStore.initViewsForNewFormula(oldCompiledFormula, compiledFormula_);
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
            if (Pn.SCALAR_FORMULA == oldProp.propType_ || Pn.AGGREGATE_FORMULA == oldProp.propType_) {
                let oldCompiledFormula = this.checkAndCompileFormula(event.targetEntity._id, oldProp.name, oldProp.formula);
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
        let allObsViewUpdates: MapViewUpdates<string | number>[] = [];
        let allAggsViewUpdates: MapReduceViewUpdates<string | number>[] = [];
        for (let compiledFormula of this.schemaDAO.getFormulas(newObj._id)) {
            let { aggsViewUpdates, obsViewUpdates } = await this.preComputeFormula(transacDAG, null, compiledFormula, newObj, null);
            allObsViewUpdates.push(...obsViewUpdates);
            allAggsViewUpdates.push(...aggsViewUpdates);
        }
        //TODO: this is not transactional
        for (let childObj of (await this.getChildObjects(newObj))) {
            let childDelEvent = new events.ServerEventDeletedFormData(childObj);
            childDelEvent._id = transacDAG.eventId + '__';
            await this.computeFormulasAndSave(childDelEvent);
        }
        transacDAG.addObjForDelete(newObj, allAggsViewUpdates, allObsViewUpdates);
    }

    private async prepareModifyAddObj(
        transacDAG: TransactionDAG,
        trObj: TransactionDAGObj | null,
        newObj: DataObj,
        oldObj: DataObj | null
    ) {
        let allObsViewUpdates: MapViewUpdates<string | number>[] = [];
        let allAggsViewUpdates: MapReduceViewUpdates<string | number>[] = [];
        for (let compiledFormula of this.schemaDAO.getFormulas(newObj._id)) {
            await this.ensureAggregationsAreInitialized(newObj);
            let { aggsViewUpdates, obsViewUpdates } = await this.preComputeFormula(transacDAG, trObj, compiledFormula, oldObj, newObj);
            allObsViewUpdates.push(...obsViewUpdates);
            allAggsViewUpdates.push(...aggsViewUpdates);
        }
        await this.computeHlookups(newObj);
        for (let selfFormula of this.schemaDAO.getSelfFormulas(newObj._id)) {
            newObj[selfFormula.targetPropertyName] = evalExpression(newObj, selfFormula.finalExpression);
            console.log(new Date().toISOString() + "|" + newObj + "||computeFormulasAndSave| - selfFormula: " + newObj._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + newObj[selfFormula.targetPropertyName]);
        }

        await this.applyValidations(newObj);

        if (oldObj) transacDAG.addObjForModify(oldObj, newObj, allAggsViewUpdates, allObsViewUpdates);
        else transacDAG.addObjForAdd(newObj, allAggsViewUpdates, allObsViewUpdates);
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
                    await this.prepareModifyAddObj(transacDAG, null, event.obj, oldObj);
                }
            }

            try {
                await this.preComputeNextTransactionDAGLevel(transacDAG);
            } catch (ex) {
                if (ex instanceof FailedValidationsError) {
                    transacDAG.failedValidations = ex.failedValidations;
                    this.computeAutoCorrections(transacDAG, event.obj, ex);
                    continue;
                }
                else throw ex;
            }
            transacDAG.failedValidations = [];
            break;
        }
        if (transacDAG.failedValidations.length > 0) {
            throw new RetryableError("still haveFailedValidations after retries:" + JSON.stringify(transacDAG.failedValidations));
        }

        return transacDAG.getAllImpactedObjectIdsAndViewKeys();
    }

    public async preComputeOnly(event: events.ServerEventPreComputeFormData) {
        let oldObj = await this.computeIds(event);
        let originalObj = _.cloneDeep(event.obj);
        let transacDAG = new TransactionDAG(event._id, '|0');
        await this.prepareTransaction(events.ServerEventModifiedFormData.fromPreComputeEvent(event),
            transacDAG, originalObj, oldObj);
        return event;
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
            else event.obj._id = _idAsStr(event.obj._id).replace('$AUTOID', '') + generateShortUID();
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
                event.error_ = ex.failedValidations;
            } else {
                event.reason_ = 'ABORT_ON_ERROR';
                event.error_ = ex?.message || ex;
            }
            this.handleError(new TransactionAbortedError(event));
            console.log(new Date().toISOString() + "|" + event._id + "|" + (null != transacDAG! ? transacDAG!.retry : -1) + "|FINISH|" + CircularJSON.stringify(event));
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

    private async computeHlookups(obj: DataObj) {
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(obj._id));
        if (!entity) throw new FailedValidationsError([{
            tableName: entityNameFromDataObjId(obj._id),
            obj,
            errorMessage: `Table definition not found for ${obj._id}`
        }]);
        let referenceToProps = referenceToPropsOf(entity);
        for (let prop of Object.values(entity?.props || {})) {
            if (prop.propType_ === Pn.HLOOKUP) {
                let refToProp = referenceToProps.get(prop.referenceToPropertyName);
                if (!refToProp) {
                    throw new FailedValidationsError([{
                        tableName: entityNameFromDataObjId(obj._id),
                        obj,
                        errorMessage: `${prop.referenceToPropertyName} column definition not found, for obj ${obj._id}`
                    }]);
                }
                let referencedObjId = obj[refToProp.name];
                let referencedObj: DataObj | null = null;
                if (referencedObjId) {
                    referencedObj = await this.frmdbEngineStore.getDataObj(referencedObjId);
                }
                if (!referencedObj) {
                    if (refToProp.required) {
                        throw new FailedValidationsError([{
                            tableName: entityNameFromDataObjId(obj._id),
                            obj,
                            errorMessage: `Record ${referencedObjId} not found, but it is referenced by ${refToProp.propType_} column ${refToProp.name} and needed by HLOOKUP ${prop.name}`
                        }]);
                    } else continue;
                }
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
        let errs = validateAndConvertObjFields(obj, entity, this.frmdbEngineTools.schemaDAO.schema);
        if (errs.length > 0) {
            console.info(`FailedValidationsError`, errs)
            throw new FailedValidationsError(errs);
        }

        let failedValidations = this.frmdbEngineTools.validateObj(obj);//TODO: replace this with VALIDATE_RECORD properties
        if (failedValidations.length > 0) {
            console.info(`FailedValidationsError2`, errs)
            throw new FailedValidationsError(failedValidations);
        }
    }

    private async preComputeFormula(
        transacDAG: TransactionDAG,
        trObj: TransactionDAGObj | null,
        compiledFormula: CompiledFormula,
        obsOld: DataObj | null,
        obsNew: DataObj | null
    ):
        Promise<{
            aggsViewUpdates: MapReduceViewUpdates<string | number>[],
            obsViewUpdates: MapViewUpdates<string | number>[]
        }> {
        let oblId = trObj ? trObjId(trObj) : null;
        let oblEntityName = oblId ? entityNameFromDataObjId(oblId) : null;
        let aggsViewUpdates: MapReduceViewUpdates<string | number>[] = [];
        let obsViewUpdates: MapViewUpdates<string | number>[] = [];

        let triggerValues: _.Dictionary<number | string> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            obsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(
                triggerOfFormula.mapObserversImpactedByOneObservable.obsViewName,
                obsOld, obsNew));

            if (trObj && triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId === oblEntityName) {
                aggsViewUpdates.push(await this.frmdbEngineStore.preComputeViewUpdateForObj(
                    triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName,
                    oldTrObj(trObj), newTrObj(trObj)));

                if (obsNew) {
                    triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                        await this.frmdbEngineStore.preComputeAggForObserverAndObservable(
                            obsNew, oldTrObj(trObj), newTrObj(trObj), triggerOfFormula);
                }
            } else {
                if (obsNew) {
                    triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                        await this.frmdbEngineStore.getAggValueForObserver(obsNew, triggerOfFormula);
                }
            }
        }

        if (obsNew) {
            let selfFormulas = this.computeFormulaExpr(triggerValues, compiledFormula, obsNew);
            await this.applyValidations(obsNew);
            console.log(ll(transacDAG) + "|preComputeFormula|" + oblId + " --> " + obsNew._id + "." +
                compiledFormula.targetPropertyName + " = " +
                obsNew[compiledFormula.targetPropertyName] + " ($TRG$=" +
                JSON.stringify(triggerValues) + ") = [" + compiledFormula.finalExpression.origExpr + "]");
            for (let selfFormula of selfFormulas) {
                console.log(ll(transacDAG) + "|preComputeFormula| - selfFormula: " + obsNew._id +
                    "." + selfFormula.targetPropertyName + " = [" + selfFormula.finalExpression.origExpr +
                    "] = " + obsNew[selfFormula.targetPropertyName]);
            }
        }

        return { aggsViewUpdates, obsViewUpdates };
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

            let observersTriggeredByObj: Map<KeyValueObjIdType, { obs: DataObj, formulasTriggeredByObj: FormulaTriggeredByObj[] }> = new Map();
            for (let formulaTriggeredByObj of this.schemaDAO.getAggFormulasTriggeredByObj(trObj.objId)) {
                for (let triggerOfFormula of formulaTriggeredByObj.formula.triggers || []) {
                    let obss = await this.frmdbEngineStore.getObserversOfObservableOldAndNew(oldTrObj(trObj), newTrObj(trObj), triggerOfFormula);
                    for (let obs of obss) {
                        let x = observersTriggeredByObj.get(obs._id);
                        if (!x) {
                            x = { obs, formulasTriggeredByObj: [formulaTriggeredByObj] };
                            observersTriggeredByObj.set(obs._id, x);
                        } else {
                            x.formulasTriggeredByObj.push(formulaTriggeredByObj);
                        }
                    }
                }
            }
            for (let obsTrgByObj of Array.from(observersTriggeredByObj.values())) {
                let obsOld = _.cloneDeep(obsTrgByObj.obs);
                let obsNew = _.cloneDeep(obsOld);
                this.computeHlookups(obsNew);
                let aggsViewUpdatesFinal: MapReduceViewUpdates<string | number>[] = [];
                let obsViewUpdatesFinal: MapViewUpdates<string | number>[] = [];
                for (let formula of obsTrgByObj.formulasTriggeredByObj.map(f => f.formula)) {
                    await this.ensureAggregationsAreInitialized(obsNew);
                    let { aggsViewUpdates, obsViewUpdates } = await this.preComputeFormula(transactionDAG, trObj, formula, obsOld, obsNew);
                    aggsViewUpdatesFinal.push(...aggsViewUpdates);
                    obsViewUpdatesFinal.push(...obsViewUpdates);
                    Object.assign(obsOld, obsNew);
                }
                transactionDAG.addObjForModify(obsTrgByObj.obs, obsNew, aggsViewUpdatesFinal, obsViewUpdatesFinal);
            }

            await this.computedRecords(transactionDAG, trObj);
        };

        if (transactionDAG.currentLevelSize() > 0) {
            await this.preComputeNextTransactionDAGLevel(transactionDAG);
        }
    }

    async ensureAggregationsAreInitialized(obj: DataObj) {
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(obj._id));
        if (!entity) throw new Error("Cannot find table definition for " + obj._id);
        for (let prop of Object.values(entity.props)) {
            let propVal = obj[prop.name];
            if (prop.propType_ === Pn.AGGREGATE_FORMULA && isNumericColumnTypes(prop.returnType_)
                && (propVal == null || propVal == "")) {
                obj[prop.name] = 0;
            }
        }
    }

    async computedRecords(transactionDAG: TransactionDAG, trObj: TransactionDAGObj) {
        let obj: DataObj = oldTrObj(trObj) || newTrObj(trObj) || _throw(`Object ${trObj.objId} not found in transaction`);
        let entity = await this.frmdbEngineStore.getEntity(entityNameFromDataObjId(trObj.objId));
        if (!entity) throw new FailedValidationsError([{
            tableName: entityNameFromDataObjId(trObj.objId),
            obj,
            errorMessage: `Table definition not found for ${obj._id}`
        }]);

        let groupEntities = this.schemaDAO.getComputedRecordsTriggeredByObj(obj._id);
        for (let groupEntity of groupEntities) {
            let groupRecordsProp = groupEntity.props._id;
            let obsIdValue = scalarFormulaEvaluate(obj, groupRecordsProp.formula);
            if (null == obsIdValue) throw new FailedValidationsError([{
                tableName: entityNameFromDataObjId(obj._id),
                obj,
                errorMessage: `Obj ${obj._id}, empty value for COMPUTED_RECORD formula (${groupEntity._id}, ${groupRecordsProp.formula})`,
            }]);
            let obsId: KeyValueObjIdType = `${groupEntity._id}~~${obsIdValue}`;

            if (transactionDAG.hasObj(obsId)) continue;//no need to compute group, it has already been computed

            let oldObs = await this.frmdbEngineStore.getDataObj(obsId);
            let newObs = oldObs ? oldObs : { _id: obsId };
            if (!oldObs) oldObs = { _id: obsId };
            
            for (let prop of Object.values(groupEntity.props)) {
                if (prop.propType_ === Pn.COMPUTED_RECORD_VALUE) {
                    newObs[prop.name] = scalarFormulaEvaluate(obj, prop.formula);
                }
            }

            await this.prepareModifyAddObj(transactionDAG, trObj, newObs, oldObs);
        }
    }
}
