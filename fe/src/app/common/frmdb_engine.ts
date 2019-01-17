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
import { SchemaCompiler } from "./schema_compiler";
import { generateUUID } from "./domain/uuid";
import { FrmdbEngineTools } from "./frmdb_engine_tools";
import { FrmdbTransactionRunner } from "./frmdb_transaction_runner";

export class FrmdbEngine {
    private transactionRunner: FrmdbTransactionRunner;
    private schemaDAO: SchemaDAO;
    public frmdbEngineTools: FrmdbEngineTools;
    constructor(private frmdbEngineStore: FrmdbEngineStore, schema: Schema) {
        this.schemaDAO = new SchemaCompiler(schema).compileSchema();
        this.frmdbEngineTools = new FrmdbEngineTools(this.schemaDAO);
        this.transactionRunner = new FrmdbTransactionRunner(frmdbEngineStore, this.frmdbEngineTools);
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
    }


    public processEvent(event: events.MwzEvents): Promise<events.MwzEvents> {
        event._id = Date.now() + '_' + generateUUID();
        console.log(new Date().toISOString() + "|" + event._id + "|BEGIN|" + JSON.stringify(event));

        switch (event.type_) {
            case events.UserActionEditedFormDataN:
                return this.transactionRunner.computeFormulasAndSave(event);
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

                return this.frmdbEngineStore.putForm(event.form).catch(err => console.error(err));
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

                return this.frmdbEngineStore.putTable(event.table).catch(err => console.error(err));
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

        return this.frmdbEngineStore.putEntity(newEntity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private deleteEntity(event: events.UserActionDeleteEntity): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.delObj(event.entity._id)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.frmdbEngineStore.putEntity(event.entity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }
}
