/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { BinaryExpression, LogicalExpression } from 'jsep';
import * as jsep from "jsep";

import { Inventory___Product, Inventory___Order } from "./test/mocks/inventory-metadata";
import { Forms___ServiceForm } from "./test/mocks/forms-metadata";
import { Entity, Schema, Pn, FormulaProperty } from "./domain/metadata/entity";
import { SchemaCompiler } from "./schema_compiler";
import { General___Actor, General___Currency } from './test/mocks/mock-metadata';
import { Sn } from './domain/metadata/stored_procedure';
import { CompiledFormula, MapReduceTrigger, ExecPlanN, 
    CompiledScalarN,
    MapKeyN,
    MapFunctionN,
    MapFunctionAndQueryN,
    MapReduceKeysAndQueriesN,
    MapReduceKeysQueriesAndValueN,
    MapReduceTriggerN,
    CompiledFormulaN,
} from './domain/metadata/execution_plan';
import { matchesTypeES5, evalExprES5, packMapFunctionAndQuery, jsonPathMapGetterExpr, generateMapFunctionAndQuery } from './map_reduce_utils';
import { Fn } from './domain/metadata/functions';
import { MapReduceQueryOptions } from './key_value_store_i';

describe('SchemaCompiler', () => {

    it('should create a formula DAG correctly', async (done) => {
        let schema = {
            _id: "FRMDB_SCHEMA",
            entities: {
                A: {
                    _id: 'A', props: {
                        B$b: { name: "B$b", propType_: Pn.REFERENCE_TO, referencedEntityName: 'B', snapshotCurrentValueOfProperties: [] },
                        val: { name: "val", propType_: Pn.NUMBER },
                    }
                } as Entity,
                B: {
                    _id: 'B', props: {
                        sum__: { name: "sum__", propType_: Pn.FORMULA, formula: 'SUM(A__of__b.val)' } as FormulaProperty,
                        x__: { name: "x__", propType_: Pn.FORMULA, formula: '10 - sum__' } as FormulaProperty,
                    }
                } as Entity,
            }
        } as Schema;
        let schemaDAO = new SchemaCompiler(schema).compileSchema();
        expect(schemaDAO.formulaDAG.roots.map(r => r.obj.id)).toEqual(["A.B$b", "A.val"]);

        let arr: string[] = [];
        await schemaDAO.formulaDAG.traverseFrom("A.B$b", x => arr.push(x.id));
        expect(arr).toEqual(["B.sum__", "B.x__"]);

        arr = [];
        await schemaDAO.formulaDAG.traverseFrom("A.val", x => arr.push(x.id));
        expect(arr).toEqual(["B.sum__", "B.x__"]);
        
        done();
    });

});
