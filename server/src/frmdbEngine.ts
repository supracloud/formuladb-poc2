/**
 * TODO: move this class on the server, outside the web app
 * In fact not move it completely, some parts could be done on the client too:
 *  - the validations on metadata dependencies
 *  - the validations involving test data 
 */
import { BaseObj } from "../../src/app/domain/base_obj";
import { Entity, EntityProperty } from "../../src/app/domain/metadata/entity";
import { DataObj } from "../../src/app/domain/metadata/data_obj";

import * as events from "../../src/app/domain/event";
import { TransactionalStore, TransactionalCallback,StoreViewAtTransaction } from "./transactionalStore";

import { userActionEditedFormDataHandler } from "./handlers/userActionEditedFormDataHandler";

export class FrmdbEngine {

    private eventsQueueProcessor: Promise<events.MwzEvents> = null;
    private storageService: TransactionalStore;

    constructor() {
        this.storageService = new TransactionalStore();
    }

    public init() {
        console.log("Starting FormulaDBEngine...");
        // this.storageService.eventsDB.changes({
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
        let ret: Promise<events.MwzEvents> = null;
        console.log(`%c 
        ###########################################################################################################################################
        #  processEvent
        ###########################################################################################################################################`,
            "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", new Date(), event);

        let handler: TransactionalCallback;
        switch (event.type_) {
            case events.UserActionEditedFormDataN:
                handler = userActionEditedFormDataHandler;
                break;
            default:
                handler = ((event, storage, cache) => this.dummyTemporaryHandlerUntillAllLogicIsImplemented(event, storage, cache));
        }
        
        return this.storageService.withTransaction(event, handler);
    }

    private dummyTemporaryHandlerUntillAllLogicIsImplemented(event: events.MwzEvents, storage: StoreViewAtTransaction, cache: Map<string, BaseObj>): Promise<events.MwzEvents> {
        switch (event.type_) {
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
        return this.storageService.getFormForTr(event.form._id, event._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                return this.storageService.setObjForTr(event.form, event._id).catch(err => console.error(err));
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
        return this.storageService.getTableForTr(event.table._id, event._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;

                return this.storageService.setObjForTr(event.table, event._id).catch(err => console.error(err));
            })
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private newEntity(event: events.UserActionNewEntity): Promise<events.MwzEvents> {
        let newEntity = new Entity();
        newEntity._id = event.path;

        return this.storageService.setObjForTr(newEntity, event._id)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private deleteEntity(event: events.UserActionDeleteEntity): Promise<events.MwzEvents> {
        event.entity._deleted = true;
        return this.storageService.setObjForTr(event.entity, event._id)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.storageService.setObjForTr(event.entity, event._id)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            ;
    }
}
