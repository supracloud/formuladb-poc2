import { Expression, isIdentifier, isLiteral, isCallExpression, isBinaryExpression, isLogicalExpression, CallExpression, isExpression, isMemberExpression } from 'jsep';
import { compileFormulaForce, FormulaCompilerError } from './formula_compiler';
import * as _ from 'lodash';
import Fuse from 'fuse.js';
import * as FuseConstructor from 'fuse.js';
import { CircularJSON } from "@domain/json-stringify";

import { isCompiledFormula } from '@domain/metadata/execution_plan';
import { $s2e } from '@functions/s2e';
import { getFunctionSignature, FunctionSignature, FunctionParameter } from './functions_signature_decorator';
import { ScalarFunctionsImplementations } from '@functions/scalar_functions_implementations';
import { LookupFunctionNames, FunctionsList, ScalarFunctions, MapReduceFunctionSignatures, LookupFunctionSignatures, ScalarFunctionsSignatures, PropertyTypeFunctions, PropertyTypeFunctionsSignatures } from './functions_compiler';
import { Schema, EntityProperty, Entity, isEntity, Pn, isEntityProperty } from '@domain/metadata/entity';
import { astNodeReturnType, astNodeReturnTypeStr, ExpressionWithReturn, astNodeWithRetType, isExpressionWithReturn, isArithmeticBinaryExpression, isBooleanBinaryExpression } from '@domain/metadata/expressions';
import { isScalarValueTypes, ScalarValueTypes, ScalarValueTypeNames, types2str, isAssignableTo, AstNodeReturnTypes, FunctionReturnTypeNames, FormulaReturnTypes, isFormulaReturnTypes, ColumnInputTypes, UndefinedType, AstNodeAllowedPartialTypesSet, AnyType, types2set, putTypeInSet, PartialType, hasTypeInSet } from '@domain/metadata/types';
import { getActualType, getReferencedTableAndColumFromHlookup, getReferenceToTable } from './formula_types_utils';

interface StaticCheckerContext {
    currentTableName: string;
    caretPos: number | undefined;
    parentNode?: Expression;
    compilerErr?: FormulaCompilerError;
    expectedType?: FunctionParameter;
    referencedTableName?: string;
}
export interface SuggestionNotMatched {
    text: string;
    inlineHelp?: string;
}

export interface Suggestion extends SuggestionNotMatched {
    matchedFragments?: { startPos: number, endPos: number }[];
}

export class ValuesAndSuggestions {
    suggestions: Suggestion[] = [];
    allowedValues: SuggestionNotMatched[] = [];
    notAllowedValues: SuggestionNotMatched[] = [];
}
export class AllowedValuesAndSuggestions {
    currentRecordColumns: ValuesAndSuggestions = new ValuesAndSuggestions();
    inputFunctions: ValuesAndSuggestions = new ValuesAndSuggestions();
    singleRecordFunctions: ValuesAndSuggestions = new ValuesAndSuggestions();
    tables: ValuesAndSuggestions = new ValuesAndSuggestions();
    referencedTableColumns: ValuesAndSuggestions = new ValuesAndSuggestions();
    rollupFunctions: ValuesAndSuggestions = new ValuesAndSuggestions();
    lookupFunctions: ValuesAndSuggestions = new ValuesAndSuggestions();
    actionFunctions: ValuesAndSuggestions = new ValuesAndSuggestions();
}
export class AstNodeToken {
    readonly type = "AstNodeToken";
    constructor(
        public tokenizer: FormulaStaticCheckerTokenizer,
        public astNode: ExpressionWithReturn,
        private value: string | undefined,
        public pstart: number,
        public pend: number,
        public tokenErrors?: string[],
    ) { }
    get inputValue(): string | undefined { return this.value; }
    set forceValue(s: string) { this.value = s }
    get text(): string {
        return this.value || this.astNode.origExpr;
    }
    get returnDetails(): AstNodeReturnTypeDetails | undefined {
        let ast = this.astNode;
        if (ast) return this.tokenizer.details(ast);
        else return undefined;
    }
    get errors(): string[] { return this.returnDetails?.errors || this.tokenErrors || []; }
    get allowedValuesAndSuggestions(): AllowedValuesAndSuggestions {
        return this.tokenizer.getSuggestionsForToken(this);
    }
    get tableName(): string | undefined {
        if (!this.astNode) return undefined;
        for (let retTy of (this.astNode.returnType?.types || [])) {
            if (
                retTy.name === "TableNameType"
                || retTy.name === "TableAndColumnNameType"
                || retTy.name === "CurrentTableColumnNameType"
                || retTy.name === "ReferencedTableColumnNameType"
            ) return retTy.tableName;
        }
        return undefined;
    }
    get columnName(): string | undefined {
        if (!this.astNode) return undefined;
        for (let retTy of (this.astNode.returnType?.types || [])) {
            if (
                retTy.name === "TableAndColumnNameType"
                || retTy.name === "CurrentTableColumnNameType"
                || retTy.name === "ReferencedTableColumnNameType"
            ) return retTy.columnName;
        }
        return undefined;
    }
}

const EmptyAllowedValuesAndSuggestions = new AllowedValuesAndSuggestions();
export class TextToken {
    readonly type = "TextToken";
    constructor(
        public tokenizer: FormulaStaticCheckerTokenizer,
        public value: string,
        public pstart: number,
        public pend: number,
    ) { }
    get inputValue(): string { return this.value; }
    set forceValue(s: string) { this.value = s }
    get text(): string { return this.value; }
    get astNode(): ExpressionWithReturn | undefined { return undefined; }
    get returnDetails(): AstNodeReturnTypeDetails | undefined { return undefined; }
    get errors(): string[] { return []; }
    get allowedValuesAndSuggestions(): AllowedValuesAndSuggestions { return EmptyAllowedValuesAndSuggestions; }
    get tableName(): string | undefined { return undefined; }
    get columnName(): string | undefined { return undefined; }
}

export type Token = AstNodeToken | TextToken;

export class AstNodeReturnTypeDetails {
    constructor(private node: ExpressionWithReturn) { }
    get retType(): ExpressionWithReturn['returnType'] { return this.node.returnType }
    exactTypeConstraints: AstNodeAllowedPartialTypesSet = {};
    assignableTypeConstraints: AstNodeAllowedPartialTypesSet = {};
    errors: string[] = [];
    allowedValuesAndSuggestions: AllowedValuesAndSuggestions = new AllowedValuesAndSuggestions();

    setExactTypeConstraints(...tys: PartialType<AnyType>[]) {
        for (let t of tys) {
            putTypeInSet(this.exactTypeConstraints, t);
        }
    }
    matchesExactTypeConstraints(...tys: PartialType<AnyType>[]): boolean {
        if (Object.keys(this.exactTypeConstraints).length === 0) return true;
        return this.hasExactTypeConstraints(...tys);
    }
    hasExactTypeConstraints(...tys: PartialType<AnyType>[]): boolean {
        for (let t of tys) {
            if (!hasTypeInSet(this.exactTypeConstraints, t)) return false;
        }
        return true;
    }
    setAssignableTypeConstraints(...tys: PartialType<AnyType>[]) {
        for (let t of tys) {
            putTypeInSet(this.assignableTypeConstraints, t);
        }
    }
    matchesAssignableTypeConstraints(...tys: PartialType<AnyType>[]): boolean {
        if (Object.keys(this.assignableTypeConstraints).length === 0) return true;
        for (let t of tys) {
            if (!hasTypeInSet(this.assignableTypeConstraints, t)) return false;
            //TODO, assignable has more complex semantics than exact type matching
        }
        return true;
    }
    isAssignableTo(...tys: PartialType<AnyType>[]): boolean {
        for (let t of tys) {
            let matchesConstraints = hasTypeInSet(this.assignableTypeConstraints, t);
            let matchesRetType = isAssignableTo(this.node.returnType.types, [t]);
            if (!matchesConstraints && !matchesRetType) return false;
        }
        return true;
    }
    matchesTypeConstraints(...tys: PartialType<AnyType>[]): boolean {
        return this.matchesExactTypeConstraints(...tys) && this.matchesAssignableTypeConstraints(...tys);
    }
}

export interface TokenizedFormula {
    tokens: Token[];
    functionsSignaturesTokens: Token[];
}

type ScalarCallExpression = CallExpression;
function isScalarCallExpression(param: Expression): param is ScalarCallExpression {
    if (!isCallExpression(param)) return false;
    if (!isIdentifier(param.callee)) return false;
    return ScalarFunctionsImplementations[param.callee.name] != null;
}

export class FormulaStaticCheckerTokenizer {

    public ast: Expression;
    public tokens: Token[];

    constructor(private schema: Schema, private targetEntityName: string, propJsPath: string, formulaStr: string, caretPos?: number) {
        let { ast, tokens } = this.tokenizeAndStaticCheckFormula(targetEntityName, propJsPath, formulaStr, caretPos);
        this.ast = ast;
        this.tokens = tokens;
    }
    public get errors(): string[] {
        return this.tokens.reduce((errs, t) => errs.concat(t.errors), [] as string[]);
    }

    astNodeDetailsMap: Map<ExpressionWithReturn, AstNodeReturnTypeDetails> = new Map();
    details(astNode: ExpressionWithReturn): AstNodeReturnTypeDetails {
        let ret = this.astNodeDetailsMap.get(astNode);
        if (!ret) {
            ret = new AstNodeReturnTypeDetails(astNode);
            this.astNodeDetailsMap.set(astNode, ret);
        }
        return ret;
    }

    private expr2token(node: Expression, context: StaticCheckerContext, value?: string): Token {
        let ret = new AstNodeToken(
            this,
            node,
            value,
            node.startIndex,
            node.endIndex,
        );
        return ret;
    }
    private punctuationToken(pstart: number, token: string, context: StaticCheckerContext): Token {
        return new TextToken(this,
            token,
            pstart,
            pstart + token.length,
        );
    }

    private tokenizeAndStaticCheckFormula(targetEntityName: string, propJsPath: string, formulaStr: string, caretPos?: number): { ast: Expression, tokens: Token[] } {
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

            this.walkASTAndStaticCheck(ast, { currentTableName: targetEntityName, caretPos: caretPos, compilerErr });
            let tokens = this.serializeAst(ast, { currentTableName: targetEntityName, caretPos: caretPos, compilerErr });
            if (compilerErr) {
                let foundErrToken = false;
                for (let token of tokens) {
                    if (token.astNode === compilerErr.node) {
                        token.errors.push(compilerErr.message);
                        foundErrToken = true;
                    }
                }
                if (!foundErrToken) tokens[0].errors.push(compilerErr.message);
            }
            if (compilerFatalError && tokens.length > 0) {
                tokens[0].errors.push("Cannot compile formula: " + compilerFatalError.split(/\n/)[0]);
            }

            return { ast, tokens };
        } catch (err) {
            console.error(err);
            let errAstNode = $s2e(`"ERR ${err}"`);
            return { ast: errAstNode, tokens: [new AstNodeToken(this, errAstNode, undefined, 0, 0, [err])] };
        }
    }

    private walkASTAndStaticCheck(node: Expression, context: StaticCheckerContext): ExpressionWithReturn {
        let ret = astNodeWithRetType(node);

        try {
            switch (node.type) {

                case 'ArrayExpression':
                    throw new FormulaCompilerError(node, "Arrays not currently supported " + node.origExpr);

                case 'CallExpression': {
                    let referencedTableName: string | undefined = context.referencedTableName;
                    let functionName = node.callee.origExpr;
                    let fnSgn = getFunctionSignature(functionName);
                    let args: ExpressionWithReturn[] = [];
                    if (!fnSgn) {
                        this.details(node.callee).errors.push(`Unknown function ${functionName}`);
                        this.details(node.callee).setExactTypeConstraints("FunctionNameType");
                        ret.returnType = {
                            types: [{ name: "UndefinedType" }],
                            dependsOn_: [],
                        };
                        return ret;
                    } else {
                        if (isIdentifier(node.callee)) {
                        } else {
                            this.details(node.callee).errors.push(`Function ${functionName} does not exist`);
                            ret.returnType = {
                                types: [{ name: "UndefinedType" }],
                                dependsOn_: [],
                            };
                            return ret;
                        }

                        for (var i = 0; i < node.arguments.length; i++) {
                            let arg = this.walkASTAndStaticCheck(node.arguments[i], {
                                ...context,
                                parentNode: node,
                                referencedTableName,
                            });
                            this.sematicCheckFunctionArgument(fnSgn, arg, i);
                            args.push(arg);

                            for (let retTy of arg.returnType.types) {
                                if (retTy.name === "TableNameType"
                                    || retTy.name === "TableAndColumnNameType"
                                ) {
                                    referencedTableName = retTy.tableName;
                                } else if (retTy.name === "RefToColumnNameType") {
                                    referencedTableName = retTy.referencedTableName;
                                }
                            }
                        }
                    }
                    ret.returnType = {
                        types: fnSgn.ret.types,
                        dependsOn_: _.flatMap(args, a => a.returnType.dependsOn_),
                    };
                    astNodeWithRetType(node.callee).returnType = ret.returnType;
                    this.details(node.callee).setExactTypeConstraints("FunctionNameType");
                    return ret;
                }
                case 'ConditionalExpression': {
                    this.walkASTAndStaticCheck(node.test, { ...context, parentNode: node });
                    let trueVal = this.walkASTAndStaticCheck(node.consequent, { ...context, parentNode: node });
                    let falseVal = this.walkASTAndStaticCheck(node.alternate, { ...context, parentNode: node });
                    ret.returnType = {
                        types: trueVal.returnType.types.concat(falseVal.returnType.types),
                        dependsOn_: trueVal.returnType.dependsOn_.concat(falseVal.returnType.dependsOn_),
                    };
                    return ret;
                }
                case 'Identifier': {
                    let token: Token;
                    if (node.startIndex == 0) {
                        if (getFunctionSignature(node.origExpr)) {
                            this.details(node).errors.push("Function " + node.origExpr + " is missing parameters: " + getFunctionSignature(node.origExpr));
                        } else {
                            this.semanticCheckAstNode(ret, context, ["FunctionNameType",
                                "CurrentTableColumnNameType"]);
                        }
                    } else {
                        this.semanticCheckAstNode(ret, context, ["FunctionNameType",
                            "CurrentTableColumnNameType", "ReferencedTableColumnNameType", "TableNameType"]);
                    }

                    return ret;
                }
                case 'NumberLiteral':
                    ret.returnType = {
                        types: [{ name: "NumberType" }],
                        dependsOn_: [],
                    };
                    return ret;

                case 'StringLiteral':
                    ret.returnType = {
                        types: [{ name: "TextType" }],
                        dependsOn_: [],
                    }
                    return ret;

                case 'Literal':
                    ret.returnType = {
                        types: [{ name: "TextType" }, { name: "NumberType" }, { name: "BooleanType" }],
                        dependsOn_: []
                    };
                    return ret;

                case 'LogicalExpression':
                    throw new Error("Binary Logical operators (&& || !) not currently supported, please use AND/OR/NOT functions instead");

                case 'BinaryExpression': {
                    let left = this.walkASTAndStaticCheck(node.left, { ...context, parentNode: node });
                    let right = this.walkASTAndStaticCheck(node.right, { ...context, parentNode: node });

                    ret.returnType = {
                        types: [{ name: "NumberType" }],
                        dependsOn_: left.returnType.dependsOn_.concat(right.returnType.dependsOn_),
                    };

                    if (isArithmeticBinaryExpression(node)) {
                        this.details(left).setAssignableTypeConstraints("NumberType");
                        this.details(right).setAssignableTypeConstraints("NumberType");
                    } else if (isBooleanBinaryExpression(node)) {
                        this.ensureAssignableType(left, right);
                    }


                    return ret;
                }
                case 'MemberExpression': {
                    if (isLiteral(node.object) && node.object.raw === '@') {
                        if (!isIdentifier(node.property)) {
                            throw new Error(`Expected @[column_name] but found ${node.origExpr}`);
                        } else {
                            let tblName = context.currentTableName;
                            let colName = node.property.name;
                            let entityForToken = this.schema.entities[tblName];
                            this.details(node).setExactTypeConstraints("CurrentTableColumnNameType");
                            if (entityForToken) {
                                let col = entityForToken.props[colName];
                                if (col) {
                                    ret.returnType.types = [{
                                        name: "CurrentTableColumnNameType",
                                        tableName: tblName,
                                        columnName: colName,
                                        actualType: getActualType(this.schema, entityForToken._id, col.name),
                                    }];

                                    ret.returnType.dependsOn_ = [{
                                        entity: entityForToken,
                                        property: col,
                                    }];
                                } else {
                                    this.details(ret).errors.push(`Column @${colName} not found in current table ${tblName}`);
                                }
                            } else {
                                this.details(ret).errors.push(`Current Table ${tblName} not found, available tables: ${Object.keys(this.schema.entities).join(', ')}`);
                            }
                            return ret;
                        }
                    } else {
                        if (isIdentifier(node.object) && isIdentifier(node.property)) {
                            let tblName = node.object.origExpr;
                            let colName = node.property.origExpr;
                            let entityForToken = this.schema.entities[tblName];
                            if (entityForToken) {
                                let col = entityForToken.props[colName];
                                if (col) {
                                    ret.returnType.types.push({
                                        name: "TableAndColumnNameType",
                                        tableName: tblName,
                                        columnName: colName,
                                        actualType: getActualType(this.schema, entityForToken._id, col.name),
                                    });
                                    this.details(node).setExactTypeConstraints("TableAndColumnNameType");
                                    ret.returnType.dependsOn_ = [{
                                        entity: entityForToken,
                                        property: col,
                                    }];
                                } else {
                                    this.details(ret).errors.push(`Column ${colName} not found in referenced table ${tblName}`);
                                }
                            } else {
                                this.details(ret).errors.push(`Table ${tblName} not found, available tables: ${Object.keys(this.schema.entities).join(', ')}`);
                            }

                            return ret;
                        } else {
                            throw new Error(`Expected Table_Name.column_name but found ${node.origExpr}`);
                        }
                    }
                }
                case 'ThisExpression':
                    throw new Error(`This expression not supported`);

                case 'UnaryExpression': {
                    if (node.operator === "!") {
                        throw new Error("Unary logical operators (!) not currently supported, please use AND/OR/NOT logical functions instead");
                    }
                    let arg = this.walkASTAndStaticCheck(node.argument, { ...context, parentNode: node });
                    this.details(arg).setAssignableTypeConstraints("NumberType");
                    ret.returnType = {
                        types: [{ name: "NumberType" }],
                        dependsOn_: arg.returnType.dependsOn_,
                    };
                    return ret;
                }
                case 'Compound':
                    throw new Error("Unknown expr compound: " + node.origExpr);

                default:
                    throw new Error("Unknown expression: " + CircularJSON.stringify(node));
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }


    private serializeAst(node: Expression, context: StaticCheckerContext): Token[] {
        try {
            let ret: Token[] = [];
            switch (node.type) {

                case 'ArrayExpression':
                    return [this.punctuationToken(node.startIndex, '[', context)]
                        .concat(node.elements.reduce((arr, e) => arr.concat(this.serializeAst(e, { ...context, parentNode: node })), [] as Token[]))
                        .concat(this.punctuationToken(node.endIndex - 1, ']', context));

                case 'BinaryExpression':
                    return this.serializeAst(node.left, { ...context, parentNode: node })
                        .concat(this.punctuationToken(node.left.endIndex, ' ' + node.operator + ' ', context))
                        .concat(this.serializeAst(node.right, { ...context, parentNode: node }));

                case 'CallExpression':
                    ret = [];
                    ret.push(this.expr2token(node.callee, context));
                    ret.push(this.punctuationToken(node.callee.endIndex, '(', context));
                    let endParenthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
                    for (var i = 0; i < node.arguments.length; i++) {
                        let tokensForArgument = this.serializeAst(node.arguments[i], {
                            ...context,
                            parentNode: node
                        });
                        ret = [...ret, ...tokensForArgument];
                        if (i < node.arguments.length - 1) ret.push(this.punctuationToken(node.endIndex, ', ', context));
                    }
                    ret.push(this.punctuationToken(endParenthesisPos, ')', context));
                    return ret;

                case 'ConditionalExpression':
                    return this.serializeAst(node.test, { ...context, parentNode: node })
                        .concat(this.serializeAst(node.consequent, { ...context, parentNode: node }))
                        .concat(this.serializeAst(node.alternate, { ...context, parentNode: node }))
                        ;

                case 'Identifier':
                    return [this.expr2token(node, context)];

                case 'NumberLiteral':
                    return [this.expr2token(node, context)];

                case 'StringLiteral':
                    return [this.expr2token(node, context)];

                case 'Literal':
                    return [this.expr2token(node, context)];

                case 'LogicalExpression':
                    return this.serializeAst(node.left, { ...context, parentNode: node })
                        .concat(this.punctuationToken(node.left.endIndex, node.operator, context))
                        .concat(this.serializeAst(node.right, { ...context, parentNode: node }));

                case 'MemberExpression':
                    return [this.expr2token(node, context)];

                case 'ThisExpression':
                    return [];

                case 'UnaryExpression':
                    return [this.punctuationToken(node.argument.startIndex - 1, node.operator, context)]
                        .concat(this.serializeAst(node.argument, { ...context, parentNode: node }));

                case 'Compound':
                    throw new Error("Compound expr are not supported: " + node.origExpr);

                default:
                    throw new Error("Unknown expression: " + CircularJSON.stringify(node));
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    private sematicCheckFunctionArgument(fnSgn: FunctionSignature, argNode: ExpressionWithReturn, argIdx: number) {
        if (fnSgn.params.length <= argIdx) {
            this.details(argNode).errors.push(`Function ${fnSgn.name} has only ${fnSgn.params.length} arguments`);
        } else {
            let paramSgn = fnSgn.params[argIdx];
            if (!paramSgn) {
                this.details(argNode).errors.push(`Function ${fnSgn.name}, missing definition for argument ${argIdx}`);
            }
            else if (!isAssignableTo(paramSgn.types, argNode.returnType.types)) {
                this.details(argNode).setExactTypeConstraints(...paramSgn.types);
                this.details(argNode).errors.push(`Expected type ${types2str(paramSgn.types)} for argument ${paramSgn.name} but found ${astNodeReturnTypeStr(argNode)}`);
            }
        }
    }

    private ensureAssignableType(node1: ExpressionWithReturn, node2: ExpressionWithReturn) {
        this._ensureAssignableType(node1, node2);
        this._ensureAssignableType(node2, node1);
    }
    private _ensureAssignableType(node1: ExpressionWithReturn, node2: ExpressionWithReturn) {
        if (this.details(node1).isAssignableTo("NumberType")) {
            if (!this.details(node2).isAssignableTo("NumberType") && !this.details(node2).isAssignableTo("NumberAggType")) {
                this.details(node2).errors.push(`${node2.origExpr} is not assignable to ${node1.origExpr}`);
                this.details(node2).setAssignableTypeConstraints("NumberType");
            }
        }
    }

    private semanticCheckAstNode(astNode: ExpressionWithReturn, context: StaticCheckerContext, astNodePossibleTypes: PartialType<AstNodeReturnTypes>[]) {
        let errors: string[] = [];
        let found = false;

        this.details(astNode).setExactTypeConstraints(...astNodePossibleTypes);
        let allowedTypesSet = this.details(astNode).exactTypeConstraints;

        if (allowedTypesSet.FunctionNameType) {
        }

        if (allowedTypesSet.TableNameType) {
            let entityForToken = this.schema.entities[astNode.origExpr];
            if (entityForToken) {
                astNode.returnType.types.push({ name: "TableNameType", tableName: astNode.origExpr });
                found = true;
            } else {
                errors.push(`Referred to Table ${astNode.origExpr} does not exist in schema`);
            }
        }

        if (allowedTypesSet.CurrentTableColumnNameType) {
            let tblName = context.currentTableName;
            let entityForToken = this.schema.entities[tblName];
            if (entityForToken) {
                let col = entityForToken.props[astNode.origExpr];
                if (col) {
                    let actualType = getActualType(this.schema, entityForToken._id, col.name);

                    if (col.propType_ === Pn.REFERENCE_TO) {
                        let referencedEntity = getReferenceToTable(this.schema, entityForToken, col);

                        astNode.returnType.types.push({
                            name: "RefToColumnNameType",
                            tableName: context.currentTableName,
                            columnName: astNode.origExpr,
                            referencedTableName: referencedEntity._id,
                            actualType,
                        });
                    } else {
                        astNode.returnType.types.push({
                            name: "CurrentTableColumnNameType",
                            tableName: context.currentTableName,
                            columnName: astNode.origExpr,
                            actualType,
                        });
                    }
                    putTypeInSet(allowedTypesSet, actualType);
                    astNode.returnType.dependsOn_ = [{
                        entity: entityForToken,
                        property: col,
                    }]
                    found = true;
                } else {
                    allowedTypesSet.CurrentTableColumnNameType.tableName = tblName;
                    errors.push(`Column ${astNode.origExpr} not found in table ${context.currentTableName}`);
                }
            } else {
                errors.push(`Table ${context.currentTableName} not found, available tables: ${Object.keys(this.schema.entities).join(', ')}`);
            }
        }

        if (allowedTypesSet.ReferencedTableColumnNameType) {
            if (!context.referencedTableName) {
                errors.push(`Referenced table not found for node ${astNode.origExpr}, with parent ${context.parentNode?.origExpr}`);
            } else {
                let tblName = context.referencedTableName;
                let entityForToken = this.schema.entities[tblName];
                if (entityForToken) {
                    let col = entityForToken.props[astNode.origExpr];
                    if (col) {
                        let actualType = getActualType(this.schema, entityForToken._id, col.name);

                        astNode.returnType.types.push({
                            name: "ReferencedTableColumnNameType",
                            tableName: tblName,
                            columnName: astNode.origExpr,
                            actualType,
                        });
                        putTypeInSet(allowedTypesSet, actualType);
                        astNode.returnType.dependsOn_ = [{
                            entity: entityForToken,
                            property: entityForToken.props[astNode.origExpr],
                        }];
                        found = true;
                    } else {
                        allowedTypesSet.ReferencedTableColumnNameType.tableName = tblName;
                        errors.push(`Column ${astNode.origExpr} not found in referenced table ${tblName}`);
                    }
                } else {
                    errors.push(`Table ${tblName} not found, available tables: ${Object.keys(this.schema.entities).join(', ')}`);
                }
            }
        }

        if (!found) {
            this.details(astNode).errors.push(`${astNode.origExpr} does not match any of the expected types ${types2str(astNodePossibleTypes)}`, ...errors);
        }
    }

    public getSuggestionsForToken(token: AstNodeToken): AllowedValuesAndSuggestions {

        let vals = new AllowedValuesAndSuggestions();
        if (!vals) return new AllowedValuesAndSuggestions();

        let exactTypeConstraints = token.returnDetails?.exactTypeConstraints || {};
        for (let retTy of Object.values(exactTypeConstraints)) {
            if (!retTy) continue;
            if (retTy.name === "FunctionNameType") {
                let matcher = (item: FunctionSignature) => token.returnDetails?.matchesAssignableTypeConstraints(...item.ret.types);
                let mapper = (fs: FunctionSignature) => ({text: fs.name, inlineHelp: fs.description, item: fs});
                vals.inputFunctions = this.getSuggestionsWithFuse(token.text, 
                    PropertyTypeFunctionsSignatures.map(mapper), matcher);
                vals.singleRecordFunctions = this.getSuggestionsWithFuse(token.text, 
                    ScalarFunctionsSignatures.map(mapper), matcher);
                vals.rollupFunctions = this.getSuggestionsWithFuse(token.text, 
                    MapReduceFunctionSignatures.map(mapper), matcher);
                vals.lookupFunctions = this.getSuggestionsWithFuse(token.text, 
                    LookupFunctionSignatures.map(mapper), matcher);
            }

            let tablesList = Object.values(this.schema.entities)
                .map(t => ({text: t._id, inlineHelp: t.description, item: t}));
            if (retTy.name === "TableNameType") {
                vals.tables = this.getSuggestionsWithFuse(token.text, tablesList, () => true);
            } else {
                vals.tables = this.getSuggestionsWithFuse(token.text, tablesList, () => true);
            }

            let currentEntity = this.schema.entities[this.targetEntityName];
            if (currentEntity) {
                let currentColList = Object.values(currentEntity.props)
                    .map(c => ({text: `@[${c.name}]`, inlineHelp: c.description, item: c}));
                if (retTy.name === "CurrentTableColumnNameType") {
                    let matcher = (item: EntityProperty) => {
                        let colType = getActualType(this.schema, currentEntity?._id || '', item.name);
                        return token.returnDetails?.matchesAssignableTypeConstraints(colType);
                    }
                    vals.currentRecordColumns = this.getSuggestionsWithFuse(token.text,
                        currentColList, matcher);
                } else {
                    vals.currentRecordColumns = this.getSuggestionsWithFuse('',
                    currentColList, () => false);
                }
            }

            if (retTy.name === "ReferencedTableColumnNameType") {
                let referencedTableName = "tableName" in retTy ? retTy.tableName : undefined;
                if (!referencedTableName) {
                    for (let r of token.astNode.returnType.types) {
                        if (r.name === "ReferencedTableColumnNameType") {
                            referencedTableName = r.tableName;
                        }
                    }
                }
                if (referencedTableName) {
                    let entityForToken = this.schema.entities[referencedTableName];
                    if (entityForToken) {
                        let matcher = (item: EntityProperty) => {
                            let colType = getActualType(this.schema, entityForToken._id, item.name);
                            return token.returnDetails?.matchesAssignableTypeConstraints(colType);
                        }
                        let colsList = Object.values(entityForToken.props)
                            .map(c => ({text: c.name, inlineHelp: c.description, item: c}));
                        vals.referencedTableColumns = this.getSuggestionsWithFuse(token.text,
                            colsList, matcher);
                    }
                }
            }
        }
        return vals;
    }

    private getFuseOptions<T extends FunctionSignature | Entity | EntityProperty>(x: T): Fuse.IFuseOptions<T> {
        let baseFuseOptions = {
            shouldSort: true,
            includeMatches: true,
            threshold: 0.2,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: undefined,
        };
        if (isEntity(x)) return {
            ...baseFuseOptions,
            keys: ["_id"]
        }
        else return {
            ...baseFuseOptions,
            keys: ['name'],
        }
    }

    private getSuggestionsWithFuse<T extends FunctionSignature | Entity | EntityProperty>(
        tokenValue: string, 
        list: {text: string, inlineHelp: string | undefined, item: T}[], 
        matchesConstraints: (item: T) => boolean | undefined): ValuesAndSuggestions 
    {
        let ret = new ValuesAndSuggestions();
        if (list.length == 0) return ret;

        let fuseConstructor = (typeof FuseConstructor === "function") ? FuseConstructor : Fuse;
        let fuse = new (
            //workaround for "fuse_1.default is not a constructor"
            fuseConstructor as any
        )(list, {
            shouldSort: true,
            includeMatches: true,
            threshold: 0.35,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ['text'],
        });

        let fuseResults: Fuse.FuseResult<{text: string, inlineHelp: string | undefined, item: T}>[] = fuse.search(tokenValue) as any;

        for (let li of list) {
            let suggestionNotMatched: SuggestionNotMatched = {
                text: li.text,
                inlineHelp: li.inlineHelp,
            }
            let fuseResult = fuseResults.find(s => s.item === li);
            let matchesTypeConstraints = matchesConstraints(li.item);

            if (fuseResult) {
                if (matchesTypeConstraints) {
                    ret.suggestions.push({
                        ...suggestionNotMatched,
                        matchedFragments: fuseResult.matches?.[0]?.indices.map(fuseIdx => { return { startPos: fuseIdx[0], endPos: fuseIdx[1] } })
                    });
                } else {
                    ret.notAllowedValues.push(suggestionNotMatched)
                }
            } else {
                if (matchesTypeConstraints) {
                    ret.allowedValues.push(suggestionNotMatched);
                } else {
                    ret.notAllowedValues.push(suggestionNotMatched)
                }
            }
        }
        return ret;
    }
}
