/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { FormulaTokenizer, Token, TokenType } from './formula_tokenizer';
import { Schema, Pn, Entity, FormulaProperty } from './domain/metadata/entity';
import { FormulaTokenizerSchemaChecker } from './formula_tokenizer_schema_checker';


describe('FormulaTokenizer', () => {
    const schema: Schema = {
        _id: "FRMDB_SCHEMA",
        entities: {
            A: {
                _id: 'A', props: {
                    a_x: { name: "a_x", propType_: Pn.NUMBER },
                    a_y: { name: "a_y", propType_: Pn.NUMBER },
                    num: { name: "num", propType_: Pn.NUMBER },
                },
            } as Entity,
            B: {
                _id: 'B', props: {
                    b_x: { name: "b_x", propType_: Pn.NUMBER },
                    b_y: { name: "b_y", propType_: Pn.NUMBER },
                    sum: { name: "sum", propType_: Pn.FORMULA, formula: 'SUM(A.num)' } as FormulaProperty,
                },
            } as Entity,
        }
    };    
    let test1 = "should tokenize correct formula with function signature helper";
    let formula1 = 'SUMIF(A.num, a_x == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';
    let test2 = "should report non-existent column";
    let formula2 = 'SUMIF(A.num, a_  == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';
    let test3 = "should report non-existent column and not missing parenthesis";
    let formula3 = 'SUMIF(A.num, a_  == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1';
    let test4 = "should report non-existent table";
    let formula4 = 'SUMIF(C.num, a_  == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';

    beforeEach(() => {
    });

    function testFunction(formula: string, token6ColName: string) {
        let formulaStaticTypeChecker = new FormulaTokenizer();
        let formulaTokenizerSchemaChecker = new FormulaTokenizerSchemaChecker(schema);
        let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', formula);

        expect(parserTokens[4]).toEqual(jasmine.objectContaining({
            columnName: "num",
            pend: 11,
            pstart: 8,
            tableName: "A",
            type: TokenType.COLUMN_NAME,
            value: "num",
            errors: [],
            suggestions: [],
            callStack: [{ functionName: "SUMIF", argumentName: "tableRange" }],
        }));
        expect(parserTokens[6]).toEqual(jasmine.objectContaining({
            columnName: token6ColName,
            // pend: 16,
            pstart: 13,
            tableName: "A",
            type: TokenType.COLUMN_NAME,
            value: token6ColName,
            errors: [],
            suggestions: [],
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        if ('a_x' != token6ColName) {
            let suggestions = formulaTokenizerSchemaChecker.getSuggestionsForToken(parserTokens[6]);
            expect(suggestions[0]).toEqual({
                suggestion: 'a_x',
                matchedFragments: [{startPos: 0, endPos: 1}],
            });
        }
        expect(parserTokens[8]).toEqual(jasmine.objectContaining({
            columnName: "b_x",
            pend: 26,
            pstart: 20,
            tableName: "B",
            type: TokenType.COLUMN_NAME,
            value: "@[b_x]",
            errors: [],
            suggestions: [],
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        expect(parserTokens[15]).toEqual(jasmine.objectContaining({
            pend: 47,
            pstart: 42,
            type: TokenType.FUNCTION_NAME,
            value: "ROUND",
            errors: [],
            suggestions: [],
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        expect(parserTokens[19]).toEqual(jasmine.objectContaining({
            columnName: "b_y",
            pend: 59,
            pstart: 53,
            tableName: "B",
            type: TokenType.COLUMN_NAME,
            value: "@[b_y]",
            errors: [],
            suggestions: [],
            callStack: [
                { functionName: "SQRT", argumentName: "expr" },
                { functionName: "ROUND", argumentName: "expr" },
                { functionName: "SUMIF", argumentName: "logicalExpression" },
            ],
        }));
    };

    it(test1, testFunction.bind(null, formula1, 'a_x'));
    it(test2, testFunction.bind(null, formula2, 'a_'));
    it(test3, testFunction.bind(null, formula3, 'a_'));
    xit(test4, testFunction.bind(null, formula4, 'a_'));
});
