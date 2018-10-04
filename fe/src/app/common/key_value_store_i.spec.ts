/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { KeyValueStoreI, MapReduceI, MapReduceResponseI } from "./key_value_store_i";
declare var emit: any;

export function keyValueStoreSpecs(context: { kvs?: KeyValueStoreI }) {
    let kvs: KeyValueStoreI;

    describe('KeyValueStoreI', () => {
        beforeEach(async (done) => {
            kvs = context.kvs!;
            await kvs.removeAll();
            done();
        });

        xit('basic key value store functionality should work correctly', async (done) => {
            //TODO: get/put/post
            //TODO: range queries
            //TODO: get objects of type
            //TODO: get children of object
        });

        it('map-reduce queries should work correctly', async (done) => {
            try {
                /*
                # quick test with couchdb
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "1", "type": "A", "subtype": "A.x" }'
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "2", "type": "A", "subtype": "A.x" }'
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "3", "type": "A", "subtype": "A.y" }'
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "4", "type": "B", "subtype": "B.x" }'
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "5", "type": "B", "subtype": "B.x" }'
                curl -XPUT localhost:5984/mwzhistory -d '{ "_id": "6", "type": "B", "subtype": "B.y" }'
                curl -XPUT localhost:5984/mwzhistory/_design/test-es6 -d '{
                    "_id": "_design/test-es6",
                    "views": {
                      "test-es6": {
                        "map": "function(doc){emit(doc.subtype.split(/(.)/).filter(x => x != \".\").join(\"-\"),1)}",
                        "reduce": "_count"
                      }
                    },
                    "language": "javascript",
                }'
                ### CouchDB does not support lambdas
                */

                await kvs.put({ "_id": "1", "type": "A", "subtype": "A.x" });
                await kvs.put({ "_id": "2", "type": "A", "subtype": "A.x" });
                await kvs.put({ "_id": "3", "type": "A", "subtype": "A.y" });
                await kvs.put({ "_id": "4", "type": "B", "subtype": "B.x" });
                await kvs.put({ "_id": "5", "type": "B", "subtype": "B.x" });
                await kvs.put({ "_id": "6", "type": "B", "subtype": "B.y" });
                await kvs.putMapReduceQuery('mr1',
                    ((doc) => emit([(doc as any).type, (doc as any).subtype], 1)),
                    '_count'
                );

                let doc1 = await kvs.get('1');
                expect(doc1).toEqual(jasmine.objectContaining({ _id: '1', type: 'A', subtype: 'A.x' }));

                let qRes = await kvs.mapReduceQuery('mr1');
                let expQRes: MapReduceResponseI = { "rows": [{ "value": 6, "key": null }] };
                expect(qRes).toEqual(expQRes);

                qRes = await kvs.mapReduceQuery('mr1', { key: ['A', 'A.x'] });
                expect(qRes).toEqual({ "rows": [{ "value": 2, "key": null }] });

                qRes = await kvs.mapReduceQuery('mr1', { key: ['B', 'B.y'] });
                expect(qRes).toEqual({ "rows": [{ "value": 1, "key": null }] });

                qRes = await kvs.mapReduceQuery('mr1', { startkey: ['A', ''], endkey: ['A', '~'] });
                expect(qRes).toEqual({ "rows": [{ "value": 3, "key": null }] });

                qRes = await kvs.mapReduceQuery('mr1', { endkey: ['B', 'B.x'] });
                expect(qRes).toEqual({ "rows": [{ "value": 5, "key": null }] });

                qRes = await kvs.mapReduceQuery('mr1', { group_level: 1 });
                expect(qRes).toEqual({ "rows": [{ "value": 3, "key": ["A"] }, { "value": 3, "key": ["B"] }] });

                qRes = await kvs.mapReduceQuery('mr1', { group_level: 1, endkey: ['A', 'B.y'] });
                expect(qRes).toEqual({ "rows": [{ "value": 3, "key": ["A"] }] });

                qRes = await kvs.mapReduceQuery('mr1', { group_level: 2 });
                expect(qRes).toEqual({
                    "rows": [
                        { "value": 2, "key": ["A", "A.x"] },
                        { "value": 1, "key": ["A", "A.y"] },
                        { "value": 2, "key": ["B", "B.x"] },
                        { "value": 1, "key": ["B", "B.y"] }
                    ]
                });

                qRes = await kvs.mapReduceQuery('mr1', { group_level: 2, startkey: ["A", "A.y"], endkey: ["B", "B.x"] });
                expect(qRes).toEqual({
                    "rows": [
                        { "value": 1, "key": ["A", "A.y"] },
                        { "value": 2, "key": ["B", "B.x"] },
                    ]
                });

                //!!!! SpiderMonkey 1.8.5 used by CouchDB does not support lambdas, we need to use regular function(){} calls
                await kvs.putMapReduceQuery('mr-with-lambda',
                    ((doc) => {
                        let key = "bla bla {{type}} blu bli".split(/(\{\{.*?\}\})/)
                            .map(str => {
                                if (str.slice(0, 2) == '{{' && str.slice(-2) == '}}') {
                                    return doc[str.slice(2, -2)]
                                } else return str;
                            })
                            .join('');
                        emit(key, 1);
                    }),
                    '_count'
                );

                qRes = await kvs.mapReduceQuery('mr-with-lambda', { group_level: 1 });
                expect(qRes).toEqual({ "rows": [{ "value": 3, "key": "bla bla A blu bli" }, { "value": 3, "key": "bla bla B blu bli" }] });

                done();
            } catch (e) {
                console.error(JSON.stringify(e, null, 2));
            }
        });


    });
}
