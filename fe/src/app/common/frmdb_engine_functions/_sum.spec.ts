/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "../frmdb_lodash";
import { FrmdbEngineStore } from "../frmdb_engine_store";
import { KeyValueObjStore } from "../key_value_store_i";

import { UserActionEditedFormDataN } from "../domain/event";
import { Fn } from "../domain/metadata/functions";
import { MapFunctionN, CompiledFormula } from "../domain/metadata/execution_plan";
import { compileFormula } from "../formula_compiler";
import { KeyValueStoreMem } from "../key_value_store_mem";

describe('FrmdbEngineStore _sum', () => {
    let dataKVS: KeyValueObjStore;
    let locksKVS: KeyValueObjStore;
    let transactionsKVS: KeyValueObjStore;
    let frmdbTStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;


    beforeEach(async (done) => {
        transactionsKVS = new KeyValueStoreMem();
        dataKVS = new KeyValueStoreMem();
        locksKVS = new KeyValueStoreMem();
        await dataKVS.clearDB();
        await locksKVS.clearDB();
        frmdbTStore = new FrmdbEngineStore(transactionsKVS, dataKVS, locksKVS);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
        done();
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    xit("TODO add more complex SUM tests", async (done) => {
        //TODO: only one worker should get the lock and finish processing the crashed transaction
    });

});
