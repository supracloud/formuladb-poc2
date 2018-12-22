/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { FormulaTokenizer, Token } from './formula_tokenizer';


describe('FormulaTokenizer', () => {
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
        let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', formula);

        expect(parserTokens[4]).toEqual(jasmine.objectContaining({
            columnName: "num",
            pend: 11,
            pstart: 8,
            tableName: "A",
            type: "COLUMN_NAME",
            value: "num",
            callStack: [{ functionName: "SUMIF", argumentName: "tableRange" }],
        }));
        expect(parserTokens[6]).toEqual(jasmine.objectContaining({
            columnName: token6ColName,
            // pend: 16,
            pstart: 13,
            tableName: "A",
            type: "COLUMN_NAME",
            value: token6ColName,
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        expect(parserTokens[8]).toEqual(jasmine.objectContaining({
            columnName: "b_x",
            pend: 26,
            pstart: 20,
            tableName: "B",
            type: "COLUMN_NAME",
            value: "@[b_x]",
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        expect(parserTokens[15]).toEqual(jasmine.objectContaining({
            pend: 47,
            pstart: 42,
            type: "FUNCTION_NAME",
            value: "ROUND",
            callStack: [{ functionName: "SUMIF", argumentName: "logicalExpression" }],
        }));
        expect(parserTokens[19]).toEqual(jasmine.objectContaining({
            columnName: "b_y",
            pend: 59,
            pstart: 53,
            tableName: "B",
            type: "COLUMN_NAME",
            value: "@[b_y]",
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
