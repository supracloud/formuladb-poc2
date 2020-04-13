/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, isFormulaProperty, Schema, FormulaValidation, Pn, EntityProperty } from "@domain/metadata/entity";
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
import { isMetadataObject, isMetadataEntity, isMetadataStoreObject } from "@domain/metadata/default-metadata";
import { getOptionsForReferenceToProperty } from "./getOptionsForReferenceToProperty";
import { App } from "@domain/app";
import { FullPageOpts } from "@domain/url-utils";

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

    public processEventAnonymous(event: events.MwzEvents): Promise<events.MwzEvents> {
        return this.processEvent('$ANONYMOUS', 'AnounymousUserId', event);
    }
    public processEvent(userRole: string, userId: string, event: events.MwzEvents): Promise<events.MwzEvents> {
        event._id = Date.now() + '_' + generateUUID();
        console.log(new Date().toISOString() + "|" + event._id + "|BEGIN|" + CircularJSON.stringify(event));

        switch (event.type_) {
            case "ServerEventModifiedFormData":
                if (isMetadataStoreObject(event.obj)) {
                    throw new Error('Save data in record storage not allowed for metadata objects ' + JSON.stringify(event));
                }
                event.obj._role = userRole;
                event.obj._owner = userId;
                return this.transactionRunner.computeFormulasAndSave(event);
            case "ServerEventDeletedFormData":
                if (isMetadataStoreObject(event.obj)) {
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
            case "ServerEventSetApp":
                return this.setApp(event);
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
        let fullPageOpts = event.pageOpts.look ? event.pageOpts as FullPageOpts 
            : await await this.frmdbEngineStore.kvsFactory.metadataStore.fullPageOptsFromMandatory(event.pageOpts);
        let app: App | null = await this.frmdbEngineStore.kvsFactory.metadataStore.getApp(event.pageOpts.appName);
        if (app) {
            let dirty: boolean = false;
            if (app.defaultLook != fullPageOpts.look) {
                app.defaultLook = fullPageOpts.look;
                dirty = true;
            }
            if (app.defaultPrimaryColor != fullPageOpts.primaryColor) {
                app.defaultPrimaryColor = fullPageOpts.primaryColor;
                dirty = true;
            }
            if (app.defaultSecondaryColor != fullPageOpts.secondaryColor) {
                app.defaultSecondaryColor = fullPageOpts.secondaryColor;
                dirty = true;
            }
            if (app.defaultTheme != fullPageOpts.theme) {
                app.defaultTheme = fullPageOpts.theme;
                dirty = true;
            }
            if (dirty) {
                await this.frmdbEngineStore.kvsFactory.metadataStore.putApp(event.pageOpts.appName, app);
            }
        }
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
        let fullPageOpts = event.pageOpts.look ? event.pageOpts as FullPageOpts 
            : await await this.frmdbEngineStore.kvsFactory.metadataStore.fullPageOptsFromMandatory(event.pageOpts);
        await this.frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(fullPageOpts, event.pageObj, event.startPageName);
        return event;
    }

    private async setApp(event: events.ServerEventSetApp): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.setApp(
            event.appName,
            event.category,
            event.description,
            event.basedOnApp);
        return event;
    }

    private async deletePage(event: events.ServerEventDeletePage): Promise<events.MwzEvents> {
        await this.frmdbEngineStore.kvsFactory.metadataStore.deletePage(event.pageName);
        return event;
    }

    private async newEntity(event: events.ServerEventNewEntity): Promise<events.MwzEvents> {
        if (!event.entityId.match(/[a-zA-Z_]+/)) return Promise.resolve({...event, state_: "ABORT", notifMsg_: "incorrect table name"});
        let newEntity: Entity = { _id: event.entityId, props: {
            _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
            owner: { name: "owner", propType_: Pn.STRING, allowNull: false } as EntityProperty,
            role: { name: "role", propType_: Pn.STRING, allowNull: false } as EntityProperty,
            _rev: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        } };

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
