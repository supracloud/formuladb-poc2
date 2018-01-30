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

export class FrmdbEngine {

    private eventsQueueProcessor: Promise<events.MwzEvents> = null;
    private storageService: StorageService;

    constructor() {
        this.storageService = new StorageService();
    }

    public init() {
        console.log("Starting FormulaDBEngine...");
        this.storageService.eventsDB.changes({
            since: 'now',//FIXME: start listening from the last action processed, implement proper queue
            include_docs: true,
            live: true
        }).on('change', change => {
            console.log(change);
            if (!change.deleted) {
                this.handleEvent(change.doc);
            }
        }).on('error', err => {
            console.error(err);
        });
    }


    private handleEvent(event: events.MwzEvents): Promise<events.MwzEvents> {
        let ret: Promise<events.MwzEvents> = null;
        console.log("%c ****** processEvent ***********************************************",
            "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", event);

        switch (event.type) {
            case events.UserActionEditedFormDataN:
                ret = this.processDataObj(event);
                break;
            case events.UserActionEditedFormN:
                ret = this.processForm(event);
                break;
            case events.UserActionEditedTableN:
                ret = this.processTable(event);
                break;
            case events.UserActionNewEntityN:
                ret = this.newEntity(event)
                break;
            case events.UserActionDeleteEntityN:
                ret = this.deleteEntity(event);
                break;
            case events.UserActionEditedEntityN:
                ret = this.processEntity(event);
                break;
            default:
                console.warn("Unknown event", event);
        }

        return ret;
    }

    private async processDataObj(event: events.UserActionEditedFormDataEvent): Promise<events.MwzEvents> {
        let entity = await this.storageService.dataDB.get(event.obj.mwzType);
        
        //TODO: get entities that depend on this entity
        //TODO: get entities that depend on this entity

        //TODO: compute dependencies and formulas
        return this.storageService.forcePut(event.obj._id, event.obj)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }

    private processForm(event: events.UserActionEditedFormEvent): Promise<events.MwzEvents> {
        return this.storageService.dataDB.get(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                return this.storageService.dataDB.put(event.form).catch(err => console.error(err));
            })
            .then(() => {
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg = 'OK';
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
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
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
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
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
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.storageService.dataDB.put(event.entity)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .then(event => this.storageService.notifsDB.put(event))
            .catch(err => console.error(err));
    }
}
