import * as moment from "moment";
import * as _ from "lodash";

import { KeyValueStoreMem } from "./key_value_store_mem";
import { FrmdbStore } from "./frmdb_store";

describe('ExecutionPlanRunner', () => {
    let transactionsDB: KeyValueStoreMem;
    let historyDB: KeyValueStoreMem;
    let frmdbStore: FrmdbStore;
    
    beforeEach(() => {
        transactionsDB = new KeyValueStoreMem();
        historyDB = new KeyValueStoreMem();
        frmdbStore = new FrmdbStore(transactionsDB, historyDB);
    });

    it('SUM absolute path', async (done) => {
        await historyDB.put({ "_id": "/R/A@1", "aType": "x" });
        await historyDB.put({ "_id": "/R/A@2", "aType": "x" });
        await historyDB.put({ "_id": "/R/A@3", "aType": "y" });
        await historyDB.put({ "_id": "/R/A@3", "aType": "y" });
        await historyDB.put({ "_id": "/R/B@1", "bType": "x" });
        await historyDB.put({ "_id": "/R/B@2", "bType": "x" });
        await historyDB.put({ "_id": "/R/B@3", "bType": "y" });

        done();
    });

    it('SUM with relative path', () => {
    });
});
