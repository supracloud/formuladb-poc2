/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "../frmdb_lodash";
import { FrmdbEngineStore } from "../frmdb_engine_store";

import { MapFunctionN, CompiledFormula } from "@core/domain/metadata/execution_plan";
import { getFrmdbEngineStore } from '@storage/key_value_store_impl_selector';

describe('FrmdbEngineStore _sum', () => {
    let frmdbTStore: FrmdbEngineStore;
    let originalTimeout;
    let compiledFormula: CompiledFormula;

    beforeEach(async (done) => {

        frmdbTStore = await getFrmdbEngineStore({_id: "FRMDB_SCHEMA", entities: {}});
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
