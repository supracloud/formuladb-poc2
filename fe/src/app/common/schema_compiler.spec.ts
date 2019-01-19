/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Entity, Schema, Pn, FormulaProperty } from "./domain/metadata/entity";
import { SchemaCompiler } from "./schema_compiler";

describe('SchemaCompiler', () => {

    it('should create a formula DAG correctly', async (done) => {
        let schema = {
            _id: "FRMDB_SCHEMA",
            entities: {
                A: {
                    _id: 'A', props: {
                        B$b: { name: "B$b", propType_: Pn.REFERENCE_TO, referencedEntityName: 'B', snapshotCurrentValueOfProperties: ['_id'] },
                        val: { name: "val", propType_: Pn.NUMBER },
                    }
                } as Entity,
                B: {
                    _id: 'B', props: {
                        sum__: { name: "sum__", propType_: Pn.FORMULA, formula: 'SUMIF(A.val, B$b._id == @[_id])' } as FormulaProperty,
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
