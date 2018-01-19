import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
// import PouchDB from 'pouchdb';//use this when running on webpack in za browser
PouchDB.debug.enable('*');

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

import { PersistenceService } from "../../src/app/persistence.service";

export class FormuladbEngine {

    private eventsQueueProcessor: Promise<events.MwzEvents> = null;
    private persistenceService = null;

    constructor() {
        this.persistenceService = new PersistenceService();
        this.persistenceService.dataDB = new PouchDB("http://localhost:5984/mwzdata");
    }

    /**
     * Events are queued and are processed in the order in which they arrive
     * @param event the event from client
     */
    public processEvent(event: events.MwzEvents): Promise<events.MwzEvents> {

        if (null == this.eventsQueueProcessor) {
            this.eventsQueueProcessor = this.handleEvent(event);
        } else {
            this.eventsQueueProcessor = this.eventsQueueProcessor.then(() => this.handleEvent(event));
        }
        return this.eventsQueueProcessor;
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
        let entity = await this.persistenceService.this.persistenceService.dataDB.get(event.obj.mwzType);
        
        //TODO: get entities that depend on this entity
        //TODO: get entities that depend on this entity

        //TODO: compute dependencies and formulas
        return this.persistenceService.dataDB.put(event.obj)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .catch(err => console.error(err));
    }

    private processForm(event: events.UserActionEditedFormEvent): Promise<events.MwzEvents> {
        return this.persistenceService.dataDB.get(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                return this.persistenceService.dataDB.put(event.form).catch(err => console.error(err));
            })
            .then(() => {
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg = 'OK';
                delete event._rev;
                return event;
            });
    }

    private processTable(event: events.UserActionEditedTableEvent): Promise<events.MwzEvents> {
        return this.persistenceService.dataDB.get(event.table._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;

                return this.persistenceService.dataDB.put(event.table).catch(err => console.error(err));
            })
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            });
    }

    private newEntity(event: events.UserActionNewEntity): Promise<events.MwzEvents> {
        let newEntity = new Entity();
        newEntity._id = event.path;

        return this.persistenceService.dataDB.put(newEntity)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .catch(err => console.error(err));
    }

    private deleteEntity(event: events.UserActionDeleteEntity): Promise<events.MwzEvents> {
        event.entity._deleted = true;
        return this.persistenceService.dataDB.put(event.entity)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .catch(err => console.error(err));
    }

    private processEntity(event: events.UserActionEditedEntity): Promise<events.MwzEvents> {
        return this.persistenceService.dataDB.put(event.entity)
            .then(() => {
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            })
            .catch(err => console.error(err));
    }
}
