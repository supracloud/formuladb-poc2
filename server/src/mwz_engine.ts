import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
// import PouchDB from 'pouchdb';//use this when running on webpack in za browser

/**
 * TODO: move this class on the server, outside the web app
 * In fact not move it completely, some parts could be done on the client too:
 *  - the validations on metadata dependencies
 *  - the validations involving test data 
 */
import { BaseObj } from "../../src/app/domain/base_obj";
import { Entity, Property } from "../../src/app/domain/metadata/entity";
import { DataObj } from "../../src/app/domain/metadata/data_obj";

import * as events from "../../src/app/domain/event";

var dataDB = new PouchDB("http://localhost:5984/mwzdata");
var eventsDB = new PouchDB("http://localhost:5984/mwzevents");
var notifsDB = new PouchDB("http://localhost:5984/mwznotifs");
PouchDB.debug.enable('*');

export class MwzEngine {

    public processEvent(event: events.MwzEvents): Promise<events.MwzEvents> {
        console.log("%c ****** processEvent ***********************************************",
        "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", event);
    
        switch (event.type) {
            case events.UserActionEditedFormDataN:
                return this.processDataObj(event);
            case events.UserActionEditedFormN:
                return this.processForm(event);
            case events.UserActionEditedTableN:
                return this.processTable(event);
            default:
                console.warn("Unknown event", event);
                return null;
        }
    }

    private processDataObj(event: events.UserActionEditedFormDataEvent): Promise<events.MwzEvents> {
        //TODO: compute dependencies and formulas
        dataDB.put(event.obj).catch(err => console.error(err));
        event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
        delete event._rev;
        return Promise.resolve(event);
    }

    private processForm(event: events.UserActionEditedFormEvent): Promise<events.MwzEvents> {
        return dataDB.get(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                dataDB.put(event.form).catch(err => console.error(err));
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg = 'OK';
                delete event._rev;
                return event;
            });
    }

    private processTable(event: events.UserActionEditedTableEvent): Promise<events.MwzEvents> {
        return dataDB.get(event.table._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;
                
                dataDB.put(event.table).catch(err => console.error(err));
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                return event;
            });
    }
}
