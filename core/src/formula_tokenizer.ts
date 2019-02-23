import { Expression, isIdentifier, isLiteral, isCallExpression, isBinaryExpression, isLogicalExpression } from 'jsep';
import { compileFormulaForce, FormulaCompilerError, $s2e } from './formula_compiler';
import { ScalarFunctions, MapFunctions, MapReduceFunctions, FunctionsDict } from './functions_compiler';
import * as _ from 'lodash';
import { isCompiledFormula, isScalarCallExpression } from './domain/metadata/execution_plan';


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

interface StaticCheckerContext {
    targetEntityName: string;
    caretPos: number | undefined;
    parentNode?: Expression;
    compilerErr?: FormulaCompilerError;
}
export interface Suggestion {
    suggestion: string;
    matchedFragments: {startPos: number, endPos: number}[];
}
export interface Token {
    astNode: Expression;
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
    astNode: $s2e('DEFAULT_TOKEN'),
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
            astNode: node,
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
        try {
            let ast: Expression;
            let compilerErr: FormulaCompilerError | undefined = undefined;
            let compilerFatalError;
            
            let compileResult = compileFormulaForce(targetEntityName, propJsPath, formulaStr);
            if (isCompiledFormula(compileResult)) {
                ast = compileResult.rawExpr;
            } else {
                ast = compileResult.ast;
                compilerErr = compileResult.err;
            }

            let tokens = this.walkASTAndStaticCheck(ast, {targetEntityName: targetEntityName, caretPos: caretPos, compilerErr});
            if (compilerErr) {
                for (let token of tokens) {
                    if (token.astNode === compilerErr.node) {
                        token.errors.push(compilerErr.message);
                    }
                }
            }
            if (compilerFatalError && tokens.length > 0) {
                tokens[0].errors.push("Cannot compile formula: " + compilerFatalError.split(/\n/)[0]);
            }
            return tokens;
        } catch (err) {
            return [{
                ...DEFAULT_TOKEN,
                errors: ['' + err]
            }];
        }
    }
    private walkASTAndStaticCheck(node: Expression, context: StaticCheckerContext): Token[] {
        let ret: Token[] = [];
        switch (node.type) {

            case 'ArrayExpression':
                return [this.punctuationToken(node.startIndex, '[', context)]
                    .concat(node.elements.reduce((arr, e) => arr.concat(this.walkASTAndStaticCheck(e, {...context, parentNode: node})), [] as Token[]))
                    .concat(this.punctuationToken(node.endIndex - 1, ']', context));

            case 'BinaryExpression':
                return this.walkASTAndStaticCheck(node.left, {...context, parentNode: node})
                    .concat(this.punctuationToken(node.left.endIndex, ' ' + node.operator + ' ', context))
                    .concat(this.walkASTAndStaticCheck(node.right, {...context, parentNode: node}));

            case 'CallExpression':
                ret = [];
                let functionName = node.callee.origExpr;
                if (isIdentifier(node.callee)) {
                    ret.push(this.expr2token(TokenType.FUNCTION_NAME, node.callee, context));
                } else {
                    ret.push.apply(ret, this.walkASTAndStaticCheck(node.callee, {...context, parentNode: node}));
                }
                ret.push(this.punctuationToken(node.callee.endIndex, '(', context));
                let endParanthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
                for (var i = 0; i < node.arguments.length; i++) {
                    let tokensForArgument = this.walkASTAndStaticCheck(node.arguments[i], {...context, parentNode: node});
                    this.setCallStackFrame(tokensForArgument, functionName, i);
                    ret = [...ret, ...tokensForArgument];
                    if (i < node.arguments.length - 1) ret.push(this.punctuationToken(node.endIndex, ', ', context));
                }
                ret.push(this.punctuationToken(endParanthesisPos, ')', context));
                if (context.compilerErr && context.compilerErr.node === node) {
                    ret[0].errors.push(context.compilerErr.message);
                } else this.checkFunction(ret);
                return ret;

            case 'ConditionalExpression':
                return this.walkASTAndStaticCheck(node.test, {...context, parentNode: node})
                    .concat(this.walkASTAndStaticCheck(node.consequent, {...context, parentNode: node}))
                    .concat(this.walkASTAndStaticCheck(node.alternate, {...context, parentNode: node}))
                    ;

            case 'Identifier':
                let token: Token;
                if (node.startIndex == 0) {
                    token = this.expr2token(TokenType.FUNCTION_NAME, node, context);
                    if (FunctionsDict[token.value]) {
                        token.errors.push("Function " + token.value + " is missing ( *parameters )");
                    } else {
                        token.errors.push("Uknown function " + token.value);
                    }
                    return [token];
                }
                else if (context.parentNode && (
                    isBinaryExpression(context.parentNode) 
                    || isLogicalExpression(context.parentNode) 
                    || isScalarCallExpression(context.parentNode) 
                )) {
                    return [{
                        ...this.expr2token(TokenType.COLUMN_NAME, node, context),
                        tableName: node.belongsTo || context.targetEntityName,
                        columnName: node.name
                    }];
                } 
                else {
                    return [{
                        ...this.expr2token(TokenType.TABLE_NAME, node, context),
                        tableName: node.name,
                    }];
                }

            case 'NumberLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'StringLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'Literal':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'LogicalExpression':
                return this.walkASTAndStaticCheck(node.left, {...context, parentNode: node})
                    .concat(this.punctuationToken(node.left.endIndex, node.operator, context))
                    .concat(this.walkASTAndStaticCheck(node.right, {...context, parentNode: node}));

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
                        ret.push.apply(ret, this.walkASTAndStaticCheck(node.object, {...context, parentNode: node}));
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
                        ret.push.apply(ret, this.walkASTAndStaticCheck(node.property, {...context, parentNode: node}));
                    }
                }
                return ret;

            case 'ThisExpression':
                return [];

            case 'UnaryExpression':
                return [this.punctuationToken(node.argument.startIndex - 1, node.operator, context)]
                    .concat(this.walkASTAndStaticCheck(node.argument, {...context, parentNode: node}));

            case 'Compound':
                throw new Error("Compound expr are not supported: " + node.origExpr);

            default:
                throw new Error("Unknown expression: " + JSON.stringify(node));
        }
    }

    private checkFunction(tokens: Token[]) {
        let functionDef = FunctionsDict[tokens[0].value];
        if (tokens.length != functionDef.length - 1 /*the fc context*/ + 3 /*3 tokens: function name, (, ) */) {
            if (tokens[0].errors.length == 0) {
                tokens[0].errors.push("Function " + tokens[0].value + " expects " + functionDef.length + " arguments but found " + (tokens.length - 3));
            }
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
