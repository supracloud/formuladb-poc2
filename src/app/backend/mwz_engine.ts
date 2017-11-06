//import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
import PouchDB from 'pouchdb';

//TODO: move this code on the server, outside the web app
import { Entity, Property } from "../domain/metadata/entity";

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
        }).on('change', function (change) {
            console.log(change);
        }).on('error', function (err) {
            console.error(err);
        });
    }
}

// async function loadData() {
//     try {
//         var result = await db.allDocs({
//             include_docs: true,
//             attachments: false
//         });

//         result.rows.map(async (row) => {
//             await db.remove(row.id, row.value.rev);
//         });

//         mockMetadata.entities.forEach(async (entity) => {
//             await db.put(entity);
//         });

//         new MockData(mockMetadata.entitiesMap).getAll().forEach(async (obj) => {
//             await db.put(obj);
//         });

//         serializedForms.forEach(async (formUiMeta) => {
//             await db.put(parserService.parseForm(formUiMeta.entity, formUiMeta.formText));
//         });
//     } catch (err) {
//         console.error(err);
//     }
// }

// loadData();
