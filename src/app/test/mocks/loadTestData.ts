import * as PouchDB from 'pouchdb';

import { MockMetadata } from "./mock-metadata";
import { MockData } from "./mock-data";
import { Forms__ServiceForm_Form_ } from "./mock-ui-metadata";

var db = new PouchDB("http://localhost:5984/mwzhistory");
PouchDB.debug.enable('*');

var mockMetadata = new MockMetadata();

async function loadData() {
    try {
        var result = await db.allDocs({
            include_docs: true,
            attachments: false
        });

        result.rows.map(async (row) => {
            await db.remove(row.id, row.value.rev);
        });

        mockMetadata.entities.forEach(async (entity) => {
            await db.put(entity);
        });

        new MockData(mockMetadata.entitiesMap).getAll().forEach(async (obj) => {
            await db.put(obj);
        });

        [Forms__ServiceForm_Form_].forEach(async (formUiMeta) => {
            await db.put(formUiMeta);
        });
    } catch (err) {
        console.error(err);
    }
}

loadData();
   