/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, isFormulaProperty, Schema, FormulaValidation } from "./domain/metadata/entity";
import { SchemaDAO } from "./domain/metadata/schema_dao";
import { DataObj, parseDataObjId, isNewDataObjId } from "./domain/metadata/data_obj";

import { FrmdbEngineStore, RetryableError } from "./frmdb_engine_store";

import * as events from "./domain/event";
import * as _ from 'lodash';
import { isKeyValueError, KeyValueObj } from "./domain/key_value_obj";
import { SchemaCompiler } from "./schema_compiler";
import { generateUUID } from "./domain/uuid";
import { CompiledFormula } from "./domain/metadata/execution_plan";
import { evalExprES5 } from "./map_reduce_utils";
import { FailedValidation, FrmdbEngineTools } from "./frmdb_engine_tools";

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
        },
    } = {};
    currentLevel: number = 0;
    haveFailedValidations: boolean = false;
    finished: boolean = false;

    constructor(public eventId: string, public retry: string) {
    }

    public addObj(newObj: DataObj, oldObj: DataObj | null) {
        console.log(ll(this) + "|addObj|level=" + this.currentLevel + "|" + newObj._id + "/" + newObj._rev + "/" + stringifyObj(newObj) + " in " + JSON.stringify(this.levels));

        if (oldObj && newObj._id !== oldObj._id) throw new Error("expected OLD id to equal NEW id " + JSON.stringify(newObj) + " // " + JSON.stringify(oldObj));
        if (this.objs[newObj._id]) {
            throw new Error("Circular dependency found for " + JSON.stringify(newObj) + ", current " + JSON.stringify(this.objs, null, 4));
        }

        this.objs[newObj._id] = {
            OLD: oldObj,
            NEW: newObj,
        };
        while (this.levels.length - 1 < this.currentLevel) {
            this.levels.push([]);
        }
        this.levels[this.currentLevel].push(newObj._id);
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
    public getLevels() { return this.levels }
}

class FailedValidationsError {
    error = "FailedValidationsError";

    constructor(public failedValidations: FailedValidation[]) { }
}

class TransactionAbortedError {
    constructor(public event: events.UserActionEditedFormDataEvent) {}
}

export class FrmdbEngine {
    private schemaDAO: SchemaDAO;
    public frmdbEngineTools: FrmdbEngineTools;
    constructor(private frmdbEngineStore: FrmdbEngineStore, schema: Schema) {
        this.schemaDAO = new SchemaCompiler(schema).compileSchema();
        this.frmdbEngineTools = new FrmdbEngineTools(this.schemaDAO);
    }

    public async init(installFormulas: boolean = true) {
        console.log("Starting FormulaDBEngine...");

        for (let ent of this.schemaDAO.entities()) {
            for (let prop of _.values(ent.props)) {
                if (isFormulaProperty(prop)) {
                    if (prop.compiledFormula_ && installFormulas) {
                        await this.frmdbEngineStore.installFormula(prop.compiledFormula_);
                    } else console.warn("Found formula property that is not compiled: ", prop);
                }
            }
        };

        // this.frmdbEngineStore.eventsDB.changes({
        //     since: 'now',//FIXME: start listening from the last action processed, implement proper queue
        //     include_docs: true,
        //     live: true
        // }).on('change', change => {
        //     console.log(change);
        //     if (!change.deleted) {
        //         this.handleEvent(change.doc);
        //     }
        // }).on('error', err => {
        //     console.error(err);
        // });
    }


    public processEvent(event: events.MwzEvents): Promise<events.MwzEvents> {
        event._id = Date.now() + '_' + generateUUID();
        console.log(new Date().toISOString() + "|" + event._id + "|BEGIN|" + JSON.stringify(event));

        switch (event.type_) {
            case events.UserActionEditedFormDataN:
                return this.computeFormulasAndSave(event);
            case events.UserActionEditedFormN:
                return this.processForm(event);
            case events.UserActionEditedTableN:
                return this.processTable(event);
            case events.UserActionNewEntityN:
                return this.newEntity(event)
            case events.UserActionDeleteEntityN:
                return this.deleteEntity(event);
            case events.UserActionEditedEntityN:
                return this.processEntity(event);
            default:
                return Promise.reject("n/a event");
        }
    }

    private processForm(event: events.UserActionEditedFormEvent): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.getForm(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                return this.frmdbEngineStore.setObj(event.form).catch(err => console.error(err));
            })
            .then(() => {
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg_ = 'OK';
                delete event._rev;
                return event;
            })
            ;
    }

    private processTable(event: events.UserActionEditedTableEvent): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.getTable(event.table._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;

                return this.frmdbEngineStore.setObj(event.table).catch(err => console.error(err));
            })
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private newEntity(event: events.UserActionNewEntity): Promise<events.MwzEvents> {
        let newEntity: Entity = { _id: event.path, props: {} };

        return this.frmdbEngineStore.setObj(newEntity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private deleteEntity(event: events.UserActionDeleteEntity): Promise<events.MwzEvents> {
        event.entity._deleted = true;
        return this.frmdbEngineStore.setObj(event.entity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.setObj(event.entity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
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

    private async haveConflicts(transacDAG: TransactionDAG, objs: DataObj[]): Promise<boolean> {
        let objRevs = await this.frmdbEngineStore.getAllObjRevs(objs.map(o => o._id));
        for (let i = 0; i < objs.length; i++) {
            if (objs[i]._rev != objRevs[i]._rev) {
                console.log(ll(transacDAG) + "|checkConflicts|conflict: expected " + stringifyObj(objs[i]) + " found " + JSON.stringify(objRevs[i]));
                return true;
            }
        }
        return false;
    }

    private async computeFormulasAndSave(
        event: events.UserActionEditedFormDataEvent): Promise<events.MwzEvents> {

        let transacDAG: TransactionDAG;
        try {

            let newObj: boolean = false;
            if (isNewDataObjId(event.obj._id)) {
                event.obj._id = event.obj._id + generateUUID();
                newObj = true;
            }
            let originalObj = _.cloneDeep(event.obj);

            let getObjectIdsToSave = async (retryNb: number) => {
                Object.assign(event.obj, originalObj, { _rev: event.obj._rev });
                for (let selfFormula of this.schemaDAO.getSelfFormulas(event.obj._id)) {
                    event.obj[selfFormula.targetPropertyName] = evalExprES5(event.obj, selfFormula.finalExpression);
                    console.log(new Date().toISOString() + "|" + event._id + "||computeFormulasAndSave| - selfFormula: " + event.obj._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + event.obj[selfFormula.targetPropertyName]);
                }
                for (let failedValidationRetry = 1; failedValidationRetry <= 2; failedValidationRetry++) {
                    transacDAG = new TransactionDAG(event._id, retryNb + "|" + failedValidationRetry);
                    let oldObj: DataObj | null = null;
                    if (!newObj) {
                        oldObj = await this.frmdbEngineStore.getObj(event.obj._id);
                        if (oldObj._rev != event.obj._rev) {
                            //Someone has updated the object before us, we need to do auto-merging and overwrite only fields changed by us
                            //Currently we don't have this in our use-cases, the contention is on the computed formulas not on the observable objects (like OrderItem or FinancialTransaction)
                            //TODO
                            throw new Error("Auto-merging needed for " + [event.obj._id, oldObj._rev, event.obj._rev].join(", "));
                        }
                    }
                    transacDAG.addObj(event.obj, oldObj);

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

                return transacDAG.getAllObjects().map(obj => obj._id);
            }

            let saveObjects = async () => {
                let objsToSave = transacDAG.getAllObjects();
                if (await this.haveConflicts(transacDAG, objsToSave)) {
                    throw new RetryableError("have conflicts");
                } else {
                    console.log(ll(transacDAG) + "|computeFormulasAndSave|saveObjects: " + stringifyObj(objsToSave));
                    let results = await this.frmdbEngineStore.putAllObj(objsToSave);
                    for (let res of results) {
                        if (isKeyValueError(res)) throw new Error("Unexpected error in saveObjects " + JSON.stringify(res) + "; full results: " + JSON.stringify(results));                        
                    }
                    transacDAG.finished = true;
                }
            }

            let recoveredDeadTransaction = async (eventId: string) => {
                //TODO
            };

            await this.frmdbEngineStore.withLock(event._id, 
                0,
                getObjectIdsToSave, 
                saveObjects, 
                recoveredDeadTransaction, 
                20, 
                50
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
            event.error_ = "" + JSON.stringify(ex);
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

    private async preComputeFormula(transacDAG: TransactionDAG, oblOld: DataObj | null, oblNew: DataObj, compiledFormula: CompiledFormula, obsOld: DataObj, obsNew: DataObj) {
        let oblEntityName = parseDataObjId(oblNew._id).entityName;

        let triggerValues: _.Dictionary<number | string> = {};
        for (let triggerOfFormula of compiledFormula.triggers || []) {
            if (triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName === oblEntityName) {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.preComputeAggForObserverAndObservable(obsOld, oblOld, oblNew, triggerOfFormula);
            } else {
                triggerValues[triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName] =
                    await this.frmdbEngineStore.getAggValueForObserver(oblOld, triggerOfFormula);
            }
        }

        if (!compiledFormula.triggers) {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(obsNew, compiledFormula.finalExpression);
        } else if (compiledFormula.triggers.length === 1) {
            obsNew[compiledFormula.targetPropertyName] = triggerValues[compiledFormula.triggers[0].mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName];
        } else {
            obsNew[compiledFormula.targetPropertyName] = evalExprES5(Object.assign({}, { $TRG$: triggerValues }, obsNew), compiledFormula.finalExpression);
        }
        console.log(ll(transacDAG) + "|preComputeFormula|" + oblNew._id + " --> " + obsOld._id + "[" + compiledFormula.targetPropertyName + "] = [" + compiledFormula.finalExpression.origExpr + "] = " + obsNew[compiledFormula.targetPropertyName]);

        for (let selfFormula of this.schemaDAO.getSelfFormulas(obsNew._id)) {
            obsNew[selfFormula.targetPropertyName] = evalExprES5(obsNew, selfFormula.finalExpression);
            console.log(ll(transacDAG) + "|preComputeFormula| - selfFormula: " + obsNew._id + "[" + selfFormula.targetPropertyName + "] = [" + selfFormula.finalExpression.origExpr + "] = " + obsNew[selfFormula.targetPropertyName]);
        }

        let failedValidations = this.validateObj(obsNew);

        if (failedValidations.length > 0) {
            throw new FailedValidationsError(failedValidations);
        }

        transacDAG.addObj(obsNew, obsOld);
    }

    private async preComputeNextTransactionDAGLevel(transactionDAG: TransactionDAG) {
        let currentLevel = transactionDAG.getCurrentLevelObjs();
        transactionDAG.incrementLevel();
        for (let trObj of currentLevel) {
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
