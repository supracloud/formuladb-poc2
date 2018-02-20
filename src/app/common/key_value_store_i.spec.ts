import { KeyValueStoreI } from "./key_value_store_i";

function emit(...args) {
    throw "this should never be called, only used to define PouchDB views";
}

export function keyValueStoreSpecs(context: { kvs: KeyValueStoreI }) {
    let kvs: KeyValueStoreI;

    describe('KeyValueStoreI', () => {
        beforeEach(async (done) => {
            kvs = context.kvs;
            await kvs.removeAll();
            done();
        });
        it('map-reduce queries should work correctly', async (done) => {
            try {
                await kvs.put({ _id: '1', type: 'A', subtype: 'A.x' });
                await kvs.put({ _id: '2', type: 'A', subtype: 'A.x' });
                await kvs.put({ _id: '3', type: 'A', subtype: 'A.y' });
                await kvs.put({ _id: '4', type: 'B', subtype: 'B.x' });
                await kvs.put({ _id: '5', type: 'B', subtype: 'B.x' });
                await kvs.put({ _id: '6', type: 'B', subtype: 'B.y' });
                await kvs.putMapReduceQuery('mr1',
                    ((doc) => emit([doc.type, doc.subtype], 1)),
                    '_count'
                );

                let doc1 = await kvs.get('1');
                expect(doc1).toEqual(jasmine.objectContaining({ _id: '1', type: 'A', subtype: 'A.x' }));
                let qRes = await kvs.mapReduceQuery('mr1');
                expect(qRes).toEqual({"rows": [{"value": 6,"key": null}]});
                done();
            } catch (e) {
                console.error(JSON.stringify(e, null, 2));
            }
        });
    });
}
