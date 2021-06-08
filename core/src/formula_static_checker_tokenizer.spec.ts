/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const fetchMock = require('fetch-mock');
import * as _ from 'lodash';
import { FormulaStaticCheckerTokenizer, ValuesAndSuggestions, AllowedValuesAndSuggestions } from './formula_static_checker_tokenizer';
import { Schema, Pn, Entity, ScalarFormulaProperty, EntityProperty, AggregateFormulaProperty } from "@domain/metadata/entity";
import { assertDeepContains } from '@domain/spec-utils.spec';


describe('FormulaTokenizer', () => {

    const _schema = {
        _id: "FRMDB_SCHEMA~~",
        entities: {
            A: {
                _id: 'A', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: { name: "TextType" } } as EntityProperty,
                    a_x: { name: "a_x", propType_: Pn.INPUT, actualType: { name: "NumberType" } } as EntityProperty,
                    a_y: { name: "a_y", propType_: Pn.INPUT, actualType: { name: "NumberType" } } as EntityProperty,
                    num: { name: "num", propType_: Pn.INPUT, actualType: { name: "NumberType" } } as EntityProperty,
                },
            },
            B: {
                _id: 'B', props: {
                    _id: { name: "_id", propType_: Pn.INPUT, actualType: { name: "TextType" } } as EntityProperty,
                    b_x: { name: "b_x", propType_: Pn.INPUT, actualType: { name: "NumberType" } } as EntityProperty,
                    b_y: { name: "b_y", propType_: Pn.INPUT, actualType: { name: "NumberType" } } as EntityProperty,
                },
            },
        }
    };
    const schema: Schema = _schema;

    function test(msg: string, targetTableName: string, targetColName: string, formula: string, expectedTokens: { [n: number]: string | {} }) {
        return _test(it, msg, targetTableName, targetColName, formula, expectedTokens);
    }
    function ftest(msg: string, targetTableName: string, targetColName: string, formula: string, expectedTokens: { [n: number]: string | {} }) {
        return _test(fit, msg, targetTableName, targetColName, formula, expectedTokens);
    }
    function _test(func, msg: string, targetTableName: string, targetColName: string, formula: string, expectedTokens: { [n: number]: any }) {
        func(msg, () => {
            let formulaStaticTypeChecker = new FormulaStaticCheckerTokenizer(schema, targetTableName, targetColName, formula);
            let { ast, tokens } = formulaStaticTypeChecker;
            for (let [idx, expectedToken] of Object.entries(expectedTokens)) {
                if (tokens.length <= parseInt(idx)) {
                    fail(`token ${idx} not found, too few tokens ${tokens.length}`);
                    return;
                }
                if (typeof expectedToken === "string") {
                    expect(tokens[parseInt(idx)].text).toEqual(expectedToken);
                } else if (typeof expectedToken === "object") {
                    let foundToken = tokens[parseInt(idx)];
                    assertDeepContains(`Token ${foundToken.text}`, foundToken, expectedToken);
                    // for (let k of Object.keys(expectedToken)) {
                    //     if (k in foundToken) {
                    //         let foundVal = foundToken[k];
                    //         let expectedVal = expectedToken[k];
                    //         if (typeof expectedVal === "object") {
                    //             if (k === "allowedValuesAndSuggestions") {
                    //                 for (let k2 of Object.keys(expectedVal)) {
                    //                     expect(foundVal[k2]).withContext(`${k}.${k2}`).toBeDefined();
                    //                     for (let k3 of Object.keys(expectedVal[k2])) {
                    //                         if (typeof expectedVal[k2][k3] === "object") {
                    //                             expect(typeof foundVal[k2][k3]).withContext(`${k}.${k2}.${k3} object`).toEqual("object");
                    //                             expect(foundVal[k2][k3]).withContext(`${k}.${k2}.${k3}`).toEqual(jasmine.objectContaining(expectedVal[k2][k3]));
                    //                         }
                    //                     }
                    //                 }
                    //             } else {
                    //                 expect(foundVal).toEqual(jasmine.objectContaining(expectedVal));
                    //             }
                    //         } else {
                    //             expect(foundVal).toEqual(expectedVal);
                    //         }
                    //     } else throw new Error(`key ${k} not found in token ${foundToken.text} at position ${idx}`);
                    // }
                } else throw new Error(`unknown expected token ${JSON.stringify(expectedToken)}`);
            }

            for (let [tidx, token] of tokens.entries()) {
                if (token.errors.length > 0 && !expectedTokens[tidx]?.errors) {
                    fail(`Token ${token.text} at position ${tidx} has unexpected errors ${token.errors.join(';')}`)
                }
            }
        });
    }

    test("should tokenize correct formula with function signature helper",
        _schema.entities.B._id, "some_sum",
        'SUMIF(A.num, AND(a_x = @[b_x], FACT(a_y) < ROUND(SQRT(@[b_y]) + 1)))',
        {
            2: { pstart: 6, pend: 11, text: 'A.num' },
            6: { text: 'a_x', tableName: 'A', columnName: 'a_x' },
        }
    );

    test("should report non-existent column",
        _schema.entities.B._id, "some_sum",
        'SUMIF(A.num, AND(a_ = @[b_x], FACT(a_y) < ROUND(SQRT(@[b_y]) + 1)))',
        {
            2: { pstart: 6, pend: 11, text: 'A.num' },
            6: {
                text: 'a_', errors: [
                    `a_ does not match any of the expected types FunctionName, CurrentTableColumnName, ReferencedTableColumnName, TableName`
                ],
                allowedValuesAndSuggestions: {
                    referencedTableColumns: {
                        suggestions: [{text: "a_x"}, {text: "a_y"}],
                        allowedValues: [{ text: "num"}],
                        notAllowedValues: [{text: "_id"}],
                    } as ValuesAndSuggestions,
                    rollupFunctions: {
                        notAllowedValues: [{text: "SUMIF"}]
                    }
                } as Partial<AllowedValuesAndSuggestions>
            },
        }
    );

    test("should report non-existent column and not missing parenthesis",
        _schema.entities.B._id, "some_sum",
        'SUMIF(A.num, AND(a_  = @[b_x], FACT(a_y) < ROUND(SQRT(@[b_y]) + 1)',
        {
            2: { pstart: 6, pend: 11, text: 'A.num' },
            6: {
                text: 'a_', errors: [
                    `a_ does not match any of the expected types FunctionName, CurrentTableColumnName, ReferencedTableColumnName, TableName`
                ],
                allowedValuesAndSuggestions: {
                    referencedTableColumns: {
                        suggestions: [{text: "a_x"}, {text: "a_y"}],
                        allowedValues: [{ text: "num"}],
                        notAllowedValues: [{text: "_id"}],
                    } as ValuesAndSuggestions,
                    rollupFunctions: {
                        notAllowedValues: [{text: "SUMIF"}]
                    }
                } as Partial<AllowedValuesAndSuggestions>
            },
        }
    );
    
    test("should report non-existent table",
        _schema.entities.B._id, "some_sum",
        'SUMIF(C.num, a_x = @[b_x]',
        {
            2: { pstart: 6, pend: 11, text: 'C.num', errors: ["Table C not found, available tables: A, B"] },
            4: {
                text: 'a_x', errors: [
                    `a_x does not match any of the expected types FunctionName, CurrentTableColumnName, ReferencedTableColumnName, TableName`
                ],
            }
        }
    );

    test("should suggest function names",
        _schema.entities.B._id, "some_sum",
        'suf(A.num',
        {
            0: { pstart: 0, pend: 3, text: 'suf', errors: ["Unknown function suf"] ,
                allowedValuesAndSuggestions: {
                    rollupFunctions: {
                        suggestions: [{text: "SUMIF"}]
                    }
                } as Partial<AllowedValuesAndSuggestions>,
            },
        }
    );

    //FIXME: test each one of these function types: 
    //   fn = ScalarFunctions[node.callee.name] || MapFunctions[node.callee.name] || MapReduceFunctions[node.callee.name] || PropertyTypeFunctions[node.callee.name];


    // it ("should suggest function names", () => {
    //     let formulaStaticTypeChecker = new FormulaTokenizer(schema);
    //     let { ast, tokens } = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', "suf(A.num");
    //     let parserTokens: Token[] = tokens;
    //     expect(parserTokens[0]).toEqual(jasmine.objectContaining({
    //         callStack: [],
    //         errors:["Unknown function: suf(A.num)"],
    //         pend: 3,
    //         pstart: 0,
    //         //types: [TokenType.FUNCTION_NAME],
    //         value: "suf",
    //     }));
    //     let suggestions = parserTokens[0]);
    //     expect(suggestions[0]).toEqual({
    //         suggestion: 'SUBSTITUTE',
    //         matchedFragments: [{ startPos: 0, endPos: 1 }, { startPos: 3, endPos: 3 }, { startPos: 7, endPos: 7 }],
    //     });
    //     expect(suggestions[1]).toEqual({
    //         suggestion: 'SUM',
    //         matchedFragments: [{ startPos: 0, endPos: 1 }],
    //     });
    //     expect(suggestions[2]).toEqual({
    //         suggestion: 'SUMIF',
    //         matchedFragments: [{ startPos: 0, endPos: 1 }, { startPos: 4, endPos: 4 }],
    //     });
    // });

    // const test = (it: any, expr: string, tokens: any[]) => {
    //     it ('test ' + expr, () => {
    //         let formulaStaticTypeChecker = new FormulaTokenizer(schema);
    //         let { ast, tokens } = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula('B', 'sum', expr);
    //         let parserTokens: Token[] = tokens;
    //         for (let [i, token] of tokens.entries()) {
    //             formulaTokenizerSchemaChecker.checkToken(parserTokens[i]);
    //             expect(parserTokens[i]).toEqual(jasmine.objectContaining(token));
    //         }
    //         for (let [i, suggs] of suggestions.entries()) {
    //             if (!suggs) continue;
    //             let suggsForToken = formulaTokenizerSchemaChecker.getSuggestionsForToken(parserTokens[i]);
    //             for (let [j, s] of suggs.entries()) {
    //                 if (undefined === s) expect(suggsForToken[j]).toBeUndefined()
    //                 else expect(suggsForToken[j]).toEqual(jasmine.objectContaining(s));
    //             }
    //         }
    //     });
    // }

    // test(it, "REF", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REF",
    //     errors: ["Unknown function REF"]
    // }], [
    //     [{suggestion: "REFERENCE_TO"}]
    // ]);

    // test(it, "REFERENCE_TO", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REFERENCE_TO",
    //     errors: ["Function REFERENCE_TO is missing ( *parameters )"]
    // }], [
    //     [{suggestion: "REFERENCE_TO"}]
    // ]);

    // test(it, "REFERENCE_TO(", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REFERENCE_TO",
    //     errors: ["REFERENCE_TO expects an TableName.column_name as argument"]
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: "(",
    // }], [
    //     [{suggestion: "REFERENCE_TO"}]
    // ]);

    // test(it, "REFERENCE_TO(Bla", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REFERENCE_TO",
    //     errors: ["REFERENCE_TO expects an TableName.column_name as argument"]
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: "(",
    // }], [
    //     [{suggestion: "REFERENCE_TO"}],
    //     null,
    //     [{suggestion: "A"}, {suggestion: "B"}]
    // ]);

    // test(it, "REFERENCE_TO(B.", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REFERENCE_TO",
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: "(",
    // }, {
    //     //types: [TokenType.TABLE_NAME],
    //     value: "B",
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: ".",
    // }, {
    //     //types: [TokenType.CURRENT_RECORD_COLUMN_NAME],
    //     value: "identifier_expected",
    //     errors: ["Unknown column identifier_expected for table B"]
    // }], [
    //     [{suggestion: "REFERENCE_TO"}],
    //     null,
    //     null,
    //     null,
    //     [{suggestion: "_id"}, {suggestion: "b_x"}, {suggestion: "b_y"}, {suggestion: "sum"}]
    // ]);


    // test(it, "REFERENCE_TO(B.i", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "REFERENCE_TO",
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: "(",
    // }, {
    //     //types: [TokenType.TABLE_NAME],
    //     value: "B",
    // }, {
    //     //types: [TokenType.PUNCTUATION],
    //     value: ".",
    // }, {
    //     //types: [TokenType.COLUMN_NAME],
    //     value: "i",
    //     errors: ["Unknown column i for table B"]
    // }], [
    //     [{suggestion: "REFERENCE_TO"}],
    //     null,
    //     null,
    //     null,
    //     [{suggestion: "_id"}, undefined]
    // ]);

    // test(it, "num", [{
    //     //types: [TokenType.FUNCTION_NAME],
    //     value: "num",
    // }], [
    //     [{suggestion: "NUMRANGE"}, {suggestion: "NUMBER"}]
    // ]);

});
