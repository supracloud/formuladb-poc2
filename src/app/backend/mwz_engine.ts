//import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
import PouchDB from 'pouchdb';

/**
 * TODO: move this class on the server, outside the web app
 * In fact not move it completely, some parts could be done on the client too:
 *  - the validations on metadata dependencies
 *  - the validations involving test data 
 */
import { BaseObj } from "../domain/base_obj";
import { Entity, Property } from "../domain/metadata/entity";
import { DataObj } from "../domain/metadata/data_obj";

import * as events from "../domain/event";

var dataDB = new PouchDB("http://localhost:5984/mwzdata");
var eventsDB = new PouchDB("http://localhost:5984/mwzevents");
var notifsDB = new PouchDB("http://localhost:5984/mwznotifs");
PouchDB.debug.enable('*');

export class MwzEngine {
    public init() {
        eventsDB.changes({
            since: 'now',//FIXME: start listening from the last action processed, implement proper queue
            include_docs: true,
            live: true
        }).on('change', change => {
            console.log(change);
            if (!change.deleted) {
                this.processEvent(change.doc);
            }
        }).on('error', err => {
            console.error(err);
        });
    }

    private processEvent(event: events.MwzEvents) {
        console.log("%c * processEvent **##$$",
        "color: cyan; font-size: 115%; font-weight: bold; text-decoration: underline;", event);
    
        switch (event.type) {
            case events.UserActionEditedFormDataN:
                this.processDataObj(event);
                break;
            case events.UserActionEditedFormN:
                this.processForm(event);
                break;
            case events.UserActionEditedTableN:
                this.processTable(event);
                break;
            default:
                console.warn("Unknown event", event);
        }
    }

    private processDataObj(event: events.UserActionEditedFormDataEvent) {
        //TODO: compute dependencies and formulas
        dataDB.put(event.obj).catch(err => console.error(err));
        event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
        delete event._rev;
        notifsDB.put(event);
    }

    private processForm(event: events.UserActionEditedFormEvent) {
        let existingForm = dataDB.get(event.form._id)
            .catch(err => { console.log(err); return; })
            .then(frm => {
                if (frm) event.form._rev = frm._rev;

                dataDB.put(event.form).catch(err => console.error(err));
                console.log("form save started");
                //TODO: validations; if there are errors, update the notif accordingly
                event.notifMsg = 'OK';
                delete event._rev;
                notifsDB.put(event);
                console.log("form notif save started");
            });
    }

    private processTable(event: events.UserActionEditedTableEvent) {
        let existingTable = dataDB.get(event.table._id)
            .catch(err => { console.log(err); return; })
            .then(tbl => {
                if (tbl) event.table._rev = tbl._rev;
                
                dataDB.put(event.table).catch(err => console.error(err));
                event.notifMsg = 'OK';//TODO; if there are errors, update the notif accordingly
                delete event._rev;
                notifsDB.put(event);
            });
    }
}
