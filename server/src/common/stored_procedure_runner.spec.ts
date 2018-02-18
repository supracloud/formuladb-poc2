import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import * as moment from "moment";
import * as _ from "lodash";
import { StoredProcedureRunner } from '../../../src/app/common/stored_procedure_runner';
import { FrmdbStore } from '../../../src/app/common/frmdb_store';
import { KeyValueStoreMem } from '../../../src/app/common/key_value_store_mem';
import { SUM_IF_GROUP_IF_Schema } from './test_data';
import { Schema } from '../../../src/app/common/domain/metadata/entity';

describe('StoredProcedureRunner', () => {
    let transactionsDB: KeyValueStoreMem;
    let historyDB: KeyValueStoreMem;
    let frmdbStore: FrmdbStore;
    let spRunner: StoredProcedureRunner;

    beforeEach(() => {
        transactionsDB = new KeyValueStoreMem();
        historyDB = new KeyValueStoreMem();
        frmdbStore = new FrmdbStore(transactionsDB, historyDB);
        spRunner = new StoredProcedureRunner(frmdbStore);
    });

    it('should handle nesting SUM(IF(GROUP_BY(IF)))', async () => {
        await frmdbStore.setSchema(SUM_IF_GROUP_IF_Schema);
        let schema = await frmdbStore.getSchema();
        expect(schema).to.eql(SUM_IF_GROUP_IF_Schema);
    });
});
