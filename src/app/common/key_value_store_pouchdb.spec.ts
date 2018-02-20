import { keyValueStoreSpecs } from "./key_value_store_i.spec";
import { KeyValueStoreI } from "./key_value_store_i";
import { KeyValueStorePouchDB } from "./key_value_store_pouchdb";
import * as ZaPouchDB from 'pouchdb';//use this when running on webpack in the browser
import { diffObj } from "./domain/base_obj";

let PouchDB = null;
if (typeof module !== 'undefined' && module.exports) {
    PouchDB = ZaPouchDB;
} else {
    PouchDB = ZaPouchDB['default'];
}

fdescribe('KeyValueStorePouchDB', () => {
    let context: { kvs: KeyValueStoreI } = { kvs: null };

    beforeEach(() => {
        context.kvs = new KeyValueStorePouchDB(new PouchDB('pouch_db_specs'));
    });

    it('PouchDB map-reduce queries sould work correctly', async (done) => {
        var pouch = new PouchDB('pouch_db_foo');
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
            expect(results).toEqual(jasmine.objectContaining({"total_rows": 1}));
            expect(results.rows[0].key).toEqual(["2014-08-18T11:50:45.672Z","charlie"]);
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

    keyValueStoreSpecs(context);
});
