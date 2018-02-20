


import * as _ from 'lodash';
import { } from "";
import { Inventory__Product, Inventory__Order } from "../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../src/app/common/test/mocks/forms-metadata";
import { Entity, Schema, Pn, Fn, Mn, Rn } from "../../../src/app/common/domain/metadata/entity";
import { SchemaCompiler } from "../../../src/app/common/schema_compiler";
import { FrmdbStore } from "../../../src/app/common/frmdb_store";
import { KeyValueStoreMem } from "../../../src/app/common/key_value_store_mem";
import { General__Actor, General__Currency } from '../../../src/app/common/test/mocks/mock-metadata';
import { SUM_IF_GROUP_IF_Schema, makeSchema, makeEntity } from './test_data';
import { StoredProcedureRunner } from './stored_procedure_runner';
import { Sn } from './domain/metadata/stored_procedure';

describe('SchemaCompiler', () => {
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

    it('should handle nesting SUM(IF(GROUP_BY(IF)))', () => {
        let compiler = new SchemaCompiler(SUM_IF_GROUP_IF_Schema);
        // expect(compiler.compileSchema().executionPlan_).toEqual({

        // });
    });

    it('should compile mock schema correctly', () => {
    });

    it('SUM absolute path', () => {
        let schema = makeSchema(
            makeEntity('/R/A', {
                type: { propType_: Pn.STRING },
                num: { propType_: Pn.NUMBER },
            }),
            makeEntity('/R/B', {
                type: { propType_: Pn.STRING },
                sum: { propType_: Pn.FORMULA, formula: Fn.SUM('/R/A[type = {{type}}]/num') }
            }),
        );

        schema.executionPlan_ = {
            triggers: [
                ['/R/B/type', '/R/B[_id = {{_id}}]/type' ],
                ['/R/A/type', '/R/B[type = {{type}}]/sum' ],
                ['/R/A/num', '/R/B[type = {{type}}]/sum' ],
            ],
            formulas: {
                '/R/B/sum': {
                    observables: '/R/A[type = {{type}}]/num',
                    map: Mn.MAP_DEEP_PATH('/R/B/sum', '/R/A[type = {{type}}]/num'),
                    reduce: Rn._sum,
                },
            }
        };

        let compiler = new SchemaCompiler(schema);
    });

    it('SUM with relative path', () => {
        let schema = makeSchema(
            makeEntity('/R/A', {
                num: { propType_: Pn.NUMBER },
                b: { propType_: Pn.SUB_ENTITY, deepPath: '/R/B', foreignKey: 'a' },
            }),
            makeEntity('/R/B', {
                a: { propType_: Pn.TABLE, deepPath: '/R/A', foreignKey: 'b' },
                sum: { propType_: Pn.FORMULA, formula: Fn.SUM('./a/num') }
            }),
        );
        let compiler = new SchemaCompiler(schema);

        schema.executionPlan_ = {
            triggers: [
                ['/R/A/num', '/R/B[_id = {{b.ref_}}]/sum' ],
            ],
            formulas: {
                '/R/B/sum': {
                    observables: '/R/A[b/ref_ = {{_id}}]/num',
                    map: Mn.MAP_DEEP_PATH('/R/B/sum', '/R/A[b/ref_ = {{_id}}]/num'),
                    reduce: Rn._sum,
                },
            }
        };
    });
});
