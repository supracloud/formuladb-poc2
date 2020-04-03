/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, isFormulaProperty, Schema, FormulaValidation, Pn } from "@domain/metadata/entity";
import { SchemaDAO } from "@domain/metadata/schema_dao";
import { DataObj, parseDataObjId, isNewDataObjId } from "@domain/metadata/data_obj";
import { CircularJSON } from "@domain/json-stringify";

import { FrmdbEngineStore, RetryableError } from "./frmdb_engine_store";

import * as events from "@domain/event";
import * as _ from 'lodash';
import { SchemaCompiler } from "./schema_compiler";
import { generateUUID } from "@domain/uuid";
import { FrmdbEngineTools } from "./frmdb_engine_tools";
import { FrmdbTransactionRunner } from "./frmdb_transaction_runner";
import { I18nStore } from "./i18n-store";
import { isMetadataObject, isMetadataEntity } from "@domain/metadata/default-metadata";
import { getOptionsForReferenceToProperty } from "./getOptionsForReferenceToProperty";

export class FrmdbEngine {
    private transactionRunner: FrmdbTransactionRunner;
    private schemaDAO: SchemaDAO;
    public frmdbEngineTools: FrmdbEngineTools;
    i18nStore: I18nStore;

    constructor(public frmdbEngineStore: FrmdbEngineStore) {
        this.schemaDAO = new SchemaCompiler(this.frmdbEngineStore.schema).compileSchema();
        this.frmdbEngineTools = new FrmdbEngineTools(this.schemaDAO);
        this.transactionRunner = new FrmdbTransactionRunner(this.frmdbEngineStore, this.frmdbEngineTools);
        this.i18nStore = new I18nStore(this);
    }

    public async init(installFormulas: boolean = true) {
        console.log("init store...");
        await this.frmdbEngineStore.init(this.frmdbEngineStore.schema);
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
    }

    public async putSchema(appName: string, schema: Schema): Promise<Schema> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.putSchema(appName, schema);
        this.schemaDAO = new SchemaCompiler(this.frmdbEngineStore.schema).compileSchema();
        this.frmdbEngineTools = new FrmdbEngineTools(this.schemaDAO);
        this.transactionRunner = new FrmdbTransactionRunner(this.frmdbEngineStore, this.frmdbEngineTools);
        return Promise.resolve(schema);
    }

    public processEvent(event: events.MwzEvents): Promise<events.MwzEvents> {
        event._id = Date.now() + '_' + generateUUID();
        console.log(new Date().toISOString() + "|" + event._id + "|BEGIN|" + CircularJSON.stringify(event));

        switch (event.type_) {
            case "ServerEventModifiedFormData":
                if (isMetadataObject(event.obj._id)) {
                    throw new Error('Save data in record storage not allowed for metadata objects ' + JSON.stringify(event));
                }
                return this.transactionRunner.computeFormulasAndSave(event);
            case "ServerEventDeletedFormData":
                if (isMetadataObject(event.obj._id)) {
                    throw new Error('Delete data in record storage not allowed for metadata objects ' + JSON.stringify(event));
                }
                return this.transactionRunner.computeFormulasAndSave(event);
            case "ServerEventNewEntity":
                return this.newEntity(event)
            case "ServerEventDeleteEntity":
                return this.deleteEntity(event);
            case "ServerEventPreviewFormula":
                return this.transactionRunner.previewFormula(event);
            case "ServerEventSetProperty":
                if (isMetadataEntity(event.targetEntity._id)) {
                    throw new Error('Modification of metadata entities not allowed ' + JSON.stringify(event));
                }
                return this.transactionRunner.setEntityProperty(event);
            case "ServerEventDeleteProperty":
                if (isMetadataEntity(event.targetEntity._id)) {
                    throw new Error('Deletion of metadata entities not allowed ' + JSON.stringify(event));
                }
                return this.transactionRunner.deleteEntityProperty(event);
            case "ServerEventPutPageHtml":
                return this.putPageHtml(event);
            case "ServerEventPutMediaObject":
                return this.putMediaObject(event);
            case "ServerEventPutIcon":
                return this.putIcon(event);
            case "ServerEventSetPage":
                return this.setPage(event);
            case "ServerEventDeletePage":
                return this.deletePage(event);
            case "ServerEventNewApp":
                return this.newApp(event);
            default:
                return Promise.reject("n/a event");
        }
    }

    public async getOptionsForReferenceToProperties(event: events.ServerEventPreComputeFormData, referencedTableAlias: string) {
        let ret = await getOptionsForReferenceToProperty(
            this.transactionRunner, 
            this.frmdbEngineStore,
            this.frmdbEngineTools, 
            event,
            referencedTableAlias
        );
        return ret;
    }

    private async putPageHtml(event: events.ServerEventPutPageHtml): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.savePageHtml(event.pageOpts, event.pageHtml);
        return event;
    }

    private async putMediaObject(event: events.ServerEventPutMediaObject): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.saveMediaObject(event.appName, event.fileName, event.base64Content);
        return event;
    }

    private async putIcon(event: events.ServerEventPutIcon): Promise<events.MwzEvents> {
        let iconClass = await this.frmdbEngineStore.kvsFactory.metadataStore.saveIcon(event.appName, event.iconId);
        event.savedIconClass = iconClass;
        return event;
    }

    private async setPage(event: events.ServerEventSetPage): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(event.pageOpts, event.pageObj, event.startPageName);
        return event;
    }

    private async newApp(event: events.ServerEventNewApp): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.newApp(
            event.appName,
            event.basedOnApp);
        return event;
    }

    private async deletePage(event: events.ServerEventDeletePage): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.deletePage(event.deletedPagePath);
        return event;
    }

    private async newEntity(event: events.ServerEventNewEntity): Promise<events.MwzEvents> {
        if (!event.path.match(/[a-zA-Z_]+/)) return Promise.resolve({...event, state_: "ABORT", notifMsg_: "incorrect table name"});
        let newEntity: Entity = { _id: event.path, props: {} };

        return this.frmdbEngineStore.kvsFactory.metadataStore.putEntity(newEntity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
        ;
    }

    private deleteEntity(event: events.ServerEventDeleteEntity): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.kvsFactory.metadataStore.delEntity(event.entityId)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    public async putDataObjAndUpdateViews(oldObj: DataObj | null, newObj: DataObj) {
        if (oldObj && oldObj._id !== newObj._id) throw new Error("old and new id(s) do not match " + CircularJSON.stringify({oldObj, newObj}));
        await this.frmdbEngineStore.putDataObj(newObj);
        await this.updateViewsForObj(oldObj, newObj);
    }
    public async updateViewsForObj(oldObj: DataObj | null, newObj: DataObj) {
        if (oldObj && oldObj._id !== newObj._id) throw new Error("old and new id(s) do not match " + CircularJSON.stringify({oldObj, newObj}));
        for (let formulaTriggeredByObj of this.schemaDAO.getFormulasTriggeredByObj(newObj._id)) {

            for (let triggerOfFormula of formulaTriggeredByObj.formula.triggers || []) {
                let viewUpdates = await this.frmdbEngineStore.preComputeViewUpdateForObj(triggerOfFormula.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName, oldObj, newObj);
                await this.frmdbEngineStore.updateViewForObj(viewUpdates);
            }
        }

        for (let obsViewName of this.schemaDAO.getObsViewNamesUpdatedByObj(newObj._id)) {
            let viewUpdates = await this.frmdbEngineStore.preComputeViewUpdateForObj(obsViewName, oldObj, newObj);
            await this.frmdbEngineStore.updateViewForObj(viewUpdates);
        }
    }

}
