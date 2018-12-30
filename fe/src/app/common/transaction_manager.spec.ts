/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "./frmdb_lodash";
import { TransactionManager } from "./transaction_manager";

describe('TransactionManager', () => {
    beforeEach(async (done) => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    it("Should serialize concurrent conflicting transactions", async (done) => {
        let counter = 1;
        let transactionManager = new TransactionManager();

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
