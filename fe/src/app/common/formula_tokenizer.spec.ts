/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { FormulaTokenizer, Token } from './formula_tokenizer';


describe('FormulaTokenizer', () => {

    beforeEach(() => {
    });

    it('should tokenize complex formula', () => {
        let formula = 'SUMIF(A.num, a_x == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';
        let formulaStaticTypeChecker = new FormulaTokenizer();
        let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', formula);

        expect(parserTokens[6]).toEqual(jasmine.objectContaining({
            columnName: "a_x",
            pend: 16,
            pstart: 13,
            tableName: "A",
            type: "COLUMN_NAME",
            value: "a_x",
        }));

        expect(parserTokens[8]).toEqual(jasmine.objectContaining({
            columnName: "b_x",
            pend: 26,
            pstart: 20,
            tableName: "B",
            type: "COLUMN_NAME",
            value: "@[b_x]",
        }));

        //TODO add more assertions
    });

    fit('should give suggestions about the function signatures of the current formula and highlight the token at caret', () => {
        let formula = 'SUMIF(A.num, a_' /* incomplete token here */ + ' == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';
        let formulaStaticTypeChecker = new FormulaTokenizer();
        let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', formula, 15);
    });

    fit('should give suggestions if the token at caret position is incomplete or not-found', () => {
        let formula = 'SUMIF(A.num, a_' /* incomplete token here */ + ' == @[b_x] && FACT(a_y) < ROUND(SQRT(@[b_y]) + 1))';
        let formulaStaticTypeChecker = new FormulaTokenizer();
        let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', formula, 15);
    });
});
