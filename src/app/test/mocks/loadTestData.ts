import * as PouchDB from 'pouchdb';

import { MockMetadata } from "./mock-metadata";
import { MockData } from "./mock-data";
import { serializedForms } from "./mock-ui-metadata";
import { MwzParser } from "../../mwz-parser";

var db = new PouchDB("http://localhost:5984/mwzdata");
PouchDB.debug.enable('*');

var mockMetadata = new MockMetadata();
var parserService = new MwzParser();

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

        serializedForms.forEach(async (formUiMeta) => {
            await db.put(parserService.parseForm(formUiMeta.entity, formUiMeta.formText));
        });
    } catch (err) {
        console.error(err);
    }
}

loadData();
