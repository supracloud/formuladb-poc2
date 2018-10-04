/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { keyValueStoreSpecs } from "./key_value_store_i.spec";
import { KeyValueStoreI } from "./key_value_store_i";
import { KeyValueStorePouchDB, PouchDB } from "./key_value_store_pouchdb";
import { diffObj } from "./domain/base_obj";

describe('KeyValueStorePouchDB', () => {
    let context: { kvs?: KeyValueStoreI } = {};

    beforeEach(() => {
        context.kvs = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs'));
    });

    it('better document bulkDocs API with unit test', async (done) => {
        var db = new PouchDB('pouch_db_specs');
        await new KeyValueStorePouchDB(db).removeAll();

        await db.bulkDocs([
            { title: 'Lisa Says' },
            { title: 'Space Oddity' }
        ]);

        let docs = (await db.allDocs({include_docs: true})).rows.map(r => r.doc);

        await db.bulkDocs([
            { title: 'BlaBla' },
        ].concat(docs)).then(function (result) {
            expect(result[0].ok).toEqual(true);
            expect(result[1].ok).toEqual(true);
            expect(result[2].ok).toEqual(true);
        });

        await db.bulkDocs([
            { title: 'BlaBlaBlaBla222' },
        ].concat(docs)).then(function (result) {
            expect(result[0]).toEqual(jasmine.objectContaining({
                ok: true,
                id: jasmine.any(String),
                rev: jasmine.any(String),
            }));
            expect(result[1]).toEqual(jasmine.objectContaining({
                error: true,
                status: 409,
                name: 'conflict',
                id: docs[0]._id,
            }));
            expect(result[2]).toEqual(jasmine.objectContaining({
                error: true,
                status: 409,
                name: 'conflict',
                id: docs[1]._id,
            }));
        });

        done();
    });

    it('PouchDB map-reduce queries sould work correctly', async (done) => {
        var pouch = new PouchDB('pouch_db_specs');
        await new KeyValueStorePouchDB(pouch).removeAll();

        await pouch.put({
            "_id": "_design/user_webinars",
            "language": "javascript",
            "views": {
                "user_webinars": {
                    "map": "function(doc) { emit([doc.dateCreated, doc.user.token], doc) }"
                }
            }
        }).then(function () {
            return pouch.put({ _id: 'baz', dateCreated: '2014-08-18T11:50:45.672Z', user: { token: 'charlie' } });
        }).then(function () {
            return pouch.query('user_webinars', { keys: [['2014-08-18T11:50:45.672Z', 'charlie']] });
        }).then(function (results) {
            expect(results).toEqual(jasmine.objectContaining({ "total_rows": 1 }));
            expect(results.rows[0].key).toEqual(["2014-08-18T11:50:45.672Z", "charlie"]);
            expect(results.rows[0].id).toEqual("baz");
            expect(results.rows[0].value).toEqual(jasmine.objectContaining({
                "dateCreated": "2014-08-18T11:50:45.672Z",
                "user": {
                    "token": "charlie"
                },
                "_id": "baz",
            }));
            let expectedResults = {
                "total_rows": 1,
                "offset": 0,
                "rows": [
                    {
                        "key": [
                            "2014-08-18T11:50:45.672Z",
                            "charlie"
                        ],
                        "id": "baz",
                        "value": {
                            "dateCreated": "2014-08-18T11:50:45.672Z",
                            "user": {
                                "token": "charlie"
                            },
                            "_id": "baz",
                        }
                    }
                ]
            };
            let diff = diffObj(results, expectedResults);
        }).catch(e => {
            console.error(JSON.stringify(e, null, 2));
        });

        done();
    })

    describe("KeyValueStorePouchDB - common KVS specs", () => {
        keyValueStoreSpecs(context);
    });
});
