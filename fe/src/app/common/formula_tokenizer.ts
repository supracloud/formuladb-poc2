import { Expression, isIdentifier, isLiteral } from 'jsep';
import { compileFormula, parseFormula } from './formula_compiler';
import { ScalarFunctions, MapFunctions, MapReduceFunctions } from './functions_compiler';
import * as _ from 'lodash';


export enum TokenType {
    NONE = 'NONE',
    SPACE = 'SPACE',
    NLINE = 'NLINE',
    PUNCTUATION = 'PUNCTUATION',
    LITERAL = 'LITERAL',
    TABLE_NAME = 'TABLE_NAME',
    COLUMN_NAME = 'COLUMN_NAME',
    FUNCTION_NAME = 'FUNCTION_NAME',
}

export interface Suggestion {
    suggestion: string;
    matchedFragments: {startPos: number, endPos: number}[];
}
export interface Token {
    type: TokenType;
    pstart: number;
    pend: number;
    value: string;
    errors: string[];
    suggestions: Suggestion[];
    callStack: {functionName: string, argumentName: string}[];
    tableName?: string;
    columnName?: string;
    foundInSchema?: boolean;
}

export const DEFAULT_TOKEN: Token = {
    pstart: 0,
    pend: 0,
    type: TokenType.NONE,
    suggestions: [],
    errors: [],
    callStack: [],
    value: '',
}
export interface TokenizedFormula {
    tokens: Token[];
    functionsSignaturesTokens: Token[];
}

export class FormulaTokenizer {

    private expr2token(type: TokenType, node: Expression, context: {}): Token {
        let ret: Token = {
            ..._.cloneDeep(DEFAULT_TOKEN), 
            type: type,
            pstart: node.startIndex,
            pend: node.endIndex,
            value: node.origExpr
        };
        
        return ret;
    }
    private punctuationToken(pstart: number, token: string, context: {}): Token {
        return {..._.cloneDeep(DEFAULT_TOKEN), type: TokenType.PUNCTUATION,
            pstart: pstart,
            pend: pstart + token.length,
            value: token};
    }

    public tokenizeAndStaticCheckFormula(targetEntityName: string, propJsPath: string, formulaStr: string, caretPos?: number): Token[] {
        let ast: Expression;
        let compilerFatalError;
        try {
            ast = compileFormula(targetEntityName, propJsPath, formulaStr, true).rawExpr;
        } catch (err) {
            compilerFatalError = '' + err;
            ast = parseFormula(formulaStr, true);
        }

        let tokens = this.walkAST(ast, {targetEntityName: targetEntityName, caretPos: caretPos});
        if (compilerFatalError && tokens.length > 0) {
            tokens[0].errors.push("Cannot compile formula: " + compilerFatalError.split(/\n/)[0]);
        }
        return tokens;
    }
    private walkAST(node: Expression, context: {targetEntityName: string, caretPos: number | undefined}): Token[] {
        let ret: Token[] = [];
        switch (node.type) {

            case 'ArrayExpression':
                return [this.punctuationToken(node.startIndex, '[', context)]
                    .concat(node.elements.reduce((arr, e) => arr.concat(this.walkAST(e, context)), [] as Token[]))
                    .concat(this.punctuationToken(node.endIndex - 1, ']', context));

            case 'BinaryExpression':
                return this.walkAST(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, ' ' + node.operator + ' ', context))
                    .concat(this.walkAST(node.right, context));

            case 'CallExpression':
                ret = [];
                let functionName = node.callee.origExpr;
                if (isIdentifier(node.callee)) {
                    ret.push(this.expr2token(TokenType.FUNCTION_NAME, node.callee, context));
                } else {
                    ret.push.apply(ret, this.walkAST(node.callee, context));
                }
                ret.push(this.punctuationToken(node.callee.endIndex, '(', context));
                let endParanthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
                for (var i = 0; i < node.arguments.length; i++) {
                    let tokensForArgument = this.walkAST(node.arguments[i], context);
                    this.setCallStackFrame(tokensForArgument, functionName, i);
                    ret = [...ret, ...tokensForArgument];
                    if (i < node.arguments.length - 1) ret.push(this.punctuationToken(node.endIndex, ', ', context));
                }
                ret.push(this.punctuationToken(endParanthesisPos, ')', context));
                return ret;

            case 'ConditionalExpression':
                return this.walkAST(node.test, context)
                    .concat(this.walkAST(node.consequent, context))
                    .concat(this.walkAST(node.alternate, context))
                    ;

            case 'Identifier':
                return [{
                    ...this.expr2token(TokenType.COLUMN_NAME, node, context),
                    tableName: node.parent || context.targetEntityName,
                    columnName: node.name
                }];

            case 'NumberLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'StringLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'Literal':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'LogicalExpression':
                return this.walkAST(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, node.operator, context))
                    .concat(this.walkAST(node.right, context));

            case 'MemberExpression':
                ret = [];
                let tableName;
                if (isLiteral(node.object) && node.object.raw === '@') {
                    if (!isIdentifier(node.property)) throw new Error("Computed MemberExpression is not allowed at " + node.origExpr);
                    ret.push({
                        ...this.expr2token(TokenType.COLUMN_NAME, node, context),
                        tableName: context.targetEntityName,
                        columnName: node.property.name,
                    });

                } else {
                    if (isIdentifier(node.object)) {
                        tableName = node.object.name;
                        ret.push({
                            ...this.expr2token(TokenType.TABLE_NAME, node.object, context),
                            tableName: tableName,
                        });
                    } else {
                        ret.push.apply(ret, this.walkAST(node.object, context));
                    }
                    if (isIdentifier(node.property)) {
                        ret.push(this.punctuationToken(node.endIndex, '.', context));
                        ret.push({
                            ...this.expr2token(TokenType.COLUMN_NAME, node.property, context),
                            tableName: tableName,
                            columnName: node.property.name
                        });
                    } else {
                        ret.push(this.punctuationToken(node.endIndex, '.', context));
                        ret.push.apply(ret, this.walkAST(node.property, context));
                    }
                }
                return ret;

            case 'ThisExpression':
                return [];

            case 'UnaryExpression':
                return [this.punctuationToken(node.argument.startIndex - 1, node.operator, context)]
                    .concat(this.walkAST(node.argument, context));

            case 'Compound':
                throw new Error("Compound expr are not supported: " + node.origExpr);

            default:
                throw new Error("Unknown expression: " + JSON.stringify(node));
        }
    }

    private setCallStackFrame(tokens: Token[], functionName: string, argumentIdx: number) {
        let fn = ScalarFunctions[functionName] || MapFunctions[functionName] || MapReduceFunctions[functionName];
        let errors: string[] = [];
        let argumentName: string | undefined = undefined;

        if (!fn) {
            errors.push("Function " + functionName + " does not have " + (argumentIdx + 1) + " arguments");
        } else {
            let m = fn.toString().match(/function (\w+)\(fc, (.*)\)/);
            if (m && m.length == 3) {
                let args: string[] = m[2].split(/\s*,\s*/);
                if (args.length <= argumentIdx) {
                    errors.push("Function " + functionName + " does not have " + (argumentIdx + 1) + " arguments");
                } else {
                    argumentName = args[argumentIdx];
                }
            } else {
                errors.push("Unknown function " + functionName);
                console.error("Cannot parse function signature: ", functionName, fn, m);
            }
        }
        for (let token of tokens) {
            if (errors.length > 0) {
                token.errors = token.errors.concat(errors);
            }
            if (argumentName) {
                token.callStack.push({functionName, argumentName});
            }
        }
        console.log(tokens);
    }
}
