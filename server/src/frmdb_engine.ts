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
import { StorageService } from "./storage.service";
import { TransactionCoordinatorService } from "./transaction_coordinator.service";

import { userActionEditedFormDataHandler } from "./handlers/userActionEditedFormDataHandler";

export class FrmdbEngine {

    private eventsQueueProcessor: Promise<events.MwzEvents> = null;
    private storageService: StorageService;
    private transactionCoordinatorService: TransactionCoordinatorService;

    constructor() {
        this.storageService = new StorageService();
        this.transactionCoordinatorService = new TransactionCoordinatorService(this.storageService);
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

        return this.storageService.startTransaction(event)
        .then(ev => {
            switch (ev.type_) {
                case events.UserActionEditedFormDataN:
                return  userActionEditedFormDataHandler(this.storageService, ev);
                case events.UserActionEditedFormN:
                return  this.processForm(ev);
                case events.UserActionEditedTableN:
                return  this.processTable(ev);
                case events.UserActionNewEntityN:
                return  this.newEntity(ev)
                case events.UserActionDeleteEntityN:
                return  this.deleteEntity(ev);
                case events.UserActionEditedEntityN:
                    return this.processEntity(ev);
                default:
                    return Promise.reject("n/a event");
            }
        });
    }

    private processForm(event: events.UserActionEditedFormEvent): Promise<events.MwzEvents> {
        return this.storageService.getForm(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                return this.storageService.dataDB.put(event.form).catch(err => console.error(err));
            })
            .then(() => {
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg_ = 'OK';
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            ;
    }

    private processTable(event: events.UserActionEditedTableEvent): Promise<events.MwzEvents> {
        return this.storageService.dataDB.get(event.table._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;

                return this.storageService.dataDB.put(event.table).catch(err => console.error(err));
            })
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            ;
    }

    private newEntity(event: events.UserActionNewEntity): Promise<events.MwzEvents> {
        let newEntity = new Entity();
        newEntity._id = event.path;

        return this.storageService.dataDB.put(newEntity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(() => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }

    private deleteEntity(event: events.UserActionDeleteEntity): Promise<events.MwzEvents> {
        event.entity._deleted = true;
        return this.storageService.dataDB.put(event.entity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.storageService.dataDB.put(event.entity)
            .then(() => {
                event.notifMsg_ = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }
}
