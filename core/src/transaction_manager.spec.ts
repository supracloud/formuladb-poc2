/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "./frmdb_lodash";
import { TransactionManager } from "./transaction_manager";
import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';

describe('TransactionManager', () => {
    beforeEach(async (done) => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        done();
    });

    it("Should serialize concurrent conflicting transactions", async (done) => {
        let counter = 1;
        let transactionManager = new TransactionManager(await getKeyValueStoreFactory());

        async function incrementCounter() {
            return new Promise(resolve => setTimeout(() => {
                counter = counter + 1;
                resolve();
            }, Math.random() * 200))
        }

        async function parallelWorker(eventId) {
            await transactionManager.runTransaction("tr" + eventId, () => Promise.resolve(["obj1"]), incrementCounter);
        }
        let workers: Promise<void>[] = [];
        for (var i = 0; i < 20; i++) {
            workers.push(parallelWorker(i));
        }
        await Promise.all(workers);

        expect(counter).toEqual(21);

        done();
    });

});
