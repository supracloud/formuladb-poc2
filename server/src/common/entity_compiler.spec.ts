import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import * as _ from 'lodash';
import {  } from "";
import { Inventory__Product, Inventory__Order } from "../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../src/app/common/test/mocks/forms-metadata";
import { Entity } from "../../../src/app/common/domain/metadata/entity";
import { EntityCompiler } from "../../../src/app/common/entity_compiler";
import { FrmdbStore } from "../../../src/app/common/frmdb_store";
import { KeyValueStoreMem } from "../../../src/app/common/key_value_store_mem";
import { General__Actor, General__Currency } from '../../../src/app/common/test/mocks/mock-metadata';

describe('entity_compiler', () => {
  beforeEach(() => {
  });

  it('compile entity correctly', () => {
    let transactionsDB = new KeyValueStoreMem();
    let historyDB = new KeyValueStoreMem();
    historyDB.put(General__Actor);
    historyDB.put(General__Currency);
    historyDB.put(Inventory__Product);
    historyDB.put(Inventory__Order);

    let frmdbStore = new FrmdbStore(transactionsDB, historyDB);

    let compiler = new EntityCompiler(frmdbStore);
    let compiledEntity = _.cloneDeep(Forms__ServiceForm.service_form_units);
  });
});
