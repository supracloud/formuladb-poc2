


import * as _ from 'lodash';
import { } from "";
import { Inventory__Product, Inventory__Order } from "../../../src/app/common/test/mocks/inventory-metadata";
import { Forms__ServiceForm } from "../../../src/app/common/test/mocks/forms-metadata";
import { Entity, Schema, Pn, Fn } from "../../../src/app/common/domain/metadata/entity";
import { SchemaCompiler } from "../../../src/app/common/schema_compiler";
import { FrmdbStore } from "../../../src/app/common/frmdb_store";
import { KeyValueStoreMem } from "../../../src/app/common/key_value_store_mem";
import { General__Actor, General__Currency } from '../../../src/app/common/test/mocks/mock-metadata';
import { SUM_IF_GROUP_IF_Schema, makeSchema, makeEntity } from './test_data';

describe('SchemaCompiler', () => {
    beforeEach(() => {
    });

    it('should handle nesting SUM(IF(GROUP_BY(IF)))', () => {
        let compiler = new SchemaCompiler(SUM_IF_GROUP_IF_Schema);
        // expect(compiler.compileSchema().executionPlan_).toEqual({

        // });
    });

    it('should compile mock schema correctly', () => {
    });

    it('should compile SUM correctly', () => {
        let schema = makeSchema(
            makeEntity('/R/A', {
                num: { propType_: Pn.NUMBER },
                b: { propType_: Pn.SUB_ENTITY, deepPath: '/R/B' },
            }),
            makeEntity('/R/B', {
                num: { propType_: Pn.NUMBER },
                a: { propType_: Pn.TABLE, deepPath: '/R/A', isRef: true },
                sum: { propType_: Pn.FORMULA, formula: Fn.SUM('./a/*/num') }
            }),
        );
        let compiler = new SchemaCompiler(schema);
        // expect(compiler.compileSchema().executionPlan_).toEqual({

        // });
    });

});
