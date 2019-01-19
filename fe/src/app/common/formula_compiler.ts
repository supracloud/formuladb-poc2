/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import {
    Expression, CallExpression, BinaryExpression, isExpression, isIdentifier,
    LogicalExpression, isBinaryExpression, isNumberLiteral, isMemberExpression, MemberExpression, isLogicalExpression, isArrayExpression, UnaryExpression, isLiteral, Identifier
} from "jsep";
import * as jsep from 'jsep';
jsep.addLiteral('@', '@');

import {
    FormulaExpression
} from "./domain/metadata/entity";
import {
    CompiledFormula, MapReduceTrigger, isMapFunctionAndQuery,
    isMapReduceTrigger, isCompiledFormula, MapReduceKeysAndQueries, ExecPlanN,
    MapQuery, isCompiledScalar, CompiledScalarN,
    MapFunctionAndQueryN,
    MapReduceKeysAndQueriesN,
    MapReduceKeysQueriesAndValueN,
    CompiledFormulaN,
    MapValueN,
    ExecPlanCompiledExpression,
    isMapValue,
    includesMapReduceKeysAndQueriesN,
    MapKeyAndQueryN,
    MapKeyAndQuery,
    isMapKeyAndQuery,
    includesMapFunctionAndQuery,
    CompiledScalar,
} from "./domain/metadata/execution_plan";
import { ScalarFunctions, MapFunctions, MapReduceFunctions } from "./functions_compiler";
import { Identifiers } from "@angular/compiler";
import { logCompileFormula } from "./test/test_utils";


export class FormulaCompilerContextType {
    targetEntityName: string;
    targetPropertyName: string;
    currentEntityName?: string;
}

export class FuncCommon {
    context: FormulaCompilerContextType;
    funcExpr: CallExpression;
}

/**
 * The compiler must produce execution plans for entities
 */

function mergeBinaryNodes(node: BinaryExpression | LogicalExpression, left: ExecPlanCompiledExpression, right: ExecPlanCompiledExpression, context: FormulaCompilerContextType): ExecPlanCompiledExpression {
    return combine2Nodes(node, 'left', left, 'right', right, context);
}

const logicalOperators = ['==', '!=', '<', '<=', '>', '>='];
function isLogicalOpBinaryExpression(expr: Expression): expr is BinaryExpression {
    return isBinaryExpression(expr) && logicalOperators.includes(expr.operator);
}


export function getQueryKeys(op: string, node: Expression, reverse?: boolean): MapQuery {
    //FIXME: CouchDB does not have inclusive_start ... should emulate it by adding something to the end of the key
    switch (op) {
        case '==':
            return { startkeyExpr: [node], endkeyExpr: [node], inclusive_start: true, inclusive_end: true };
        case '<':
            return !reverse ?
                { startkeyExpr: [$s2e(`''`)], endkeyExpr: [node], inclusive_start: false, inclusive_end: false }
                : { startkeyExpr: [node], endkeyExpr: [$s2e(`'\ufff0'`)], inclusive_start: false, inclusive_end: false };
        case '<=':
            return !reverse ?
                { startkeyExpr: [$s2e(`''`)], endkeyExpr: [node], inclusive_start: false, inclusive_end: true }
                : { startkeyExpr: [node], endkeyExpr: [$s2e(`'\ufff0'`)], inclusive_start: true, inclusive_end: false };
        case '>':
            return !reverse ?
                { startkeyExpr: [node], endkeyExpr: [$s2e(`'\ufff0'`)], inclusive_start: false, inclusive_end: false }
                : { startkeyExpr: [$s2e(`''`)], endkeyExpr: [node], inclusive_start: false, inclusive_end: false };
        case '>=':
            return !reverse ?
                { startkeyExpr: [node], endkeyExpr: [$s2e(`'\ufff0'`)], inclusive_start: true, inclusive_end: false }
                : { startkeyExpr: [$s2e(`''`)], endkeyExpr: [node], inclusive_start: false, inclusive_end: true };
        default: throw new Error("Expected logical binary operator but found " + op + '; ' + JSON.stringify([op, node], null, 4));
    }
}

export function extractKeysAndQueriesFromBinaryExpression(logicalOpBinaryExpr: BinaryExpression, context: FormulaCompilerContextType): MapReduceKeysAndQueries {
    if (!isLogicalOpBinaryExpression(logicalOpBinaryExpr)) throw new Error("Expected logical binary expression but found " + JSON.stringify(logicalOpBinaryExpr, null, 4));
    let left = compileExpression(logicalOpBinaryExpr.left, context, CompiledScalarN);
    let right = compileExpression(logicalOpBinaryExpr.right, context, CompiledScalarN);
    if (!isCompiledScalar(left) || !isCompiledScalar(right)) throw new Error("operands of logical BinaryExpression must be scalar expressions, at: " + JSON.stringify(logicalOpBinaryExpr, null, 4));
    if (left.has$Identifier && right.has$Identifier) throw new Error("@[] (local row) cannot be used in both left and right operands of a logical BinaryExpression, at: " + JSON.stringify(logicalOpBinaryExpr, null, 4));
    if (left.hasNon$Identifier && right.hasNon$Identifier) throw new Error("accessing remote rows cannot be done in both left and right operands of a logical BinaryExpression, at: " + JSON.stringify(logicalOpBinaryExpr, null, 4));

    let op = logicalOpBinaryExpr.operator;
    return {
        type_: MapReduceKeysAndQueriesN,
        rawExpr: logicalOpBinaryExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            map: {
                keyExpr: [left.hasNon$Identifier ? left.rawExpr : right.rawExpr],
                query: left.has$Identifier ? getQueryKeys(op, left.rawExpr, true) : getQueryKeys(op, right.rawExpr),
            },
        },
        mapObserversImpactedByOneObservable: {
            keyExpr: [left.has$Identifier ? left.rawExpr : right.rawExpr],
            query: left.hasNon$Identifier ? getQueryKeys(op, left.rawExpr, true) : getQueryKeys(op, right.rawExpr),
        },
    };
}

export function extractKeysAndQueriesFromLogicalExpression(logicalExpr: LogicalExpression, context: FormulaCompilerContextType): MapReduceKeysAndQueries {
    if (logicalExpr.operator !== '&&') throw new Error(`Only && operator is supported currently. 
            If you need ||, please create 2 different properties and combine them with another formula. 
            For example SUMIF(..., x < @[someVal] || y > @[otherVal]) can be: p1=SUMIF(..., x < @[someVal]), p2=SUMIF(y > @[otherVal]), p3 = p1 + p2
            At ` + logicalExpr.origExpr);
    if (!isLogicalOpBinaryExpression(logicalExpr.left) || !isLogicalOpBinaryExpression(logicalExpr.right))
        throw new Error("Only logical operators are currently allowed inside LogicalExpession, at: " + logicalExpr.origExpr);
    let left = extractKeysAndQueriesFromBinaryExpression(logicalExpr.left, context);
    let right = extractKeysAndQueriesFromBinaryExpression(logicalExpr.right, context);

    if (logicalExpr.left.operator !== '==') throw new Error(`Currently first operator for a LogicalExpession must be "==", at ` + logicalExpr.origExpr);

    return {
        type_: MapReduceKeysAndQueriesN,
        rawExpr: logicalExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            map: {
                keyExpr: left.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr
                    .concat(right.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr),
                query: {
                    startkeyExpr: left.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr
                        .concat(right.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr),
                    endkeyExpr: left.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr
                        .concat(right.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr),
                    inclusive_start: left.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                    inclusive_end: right.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                }
            },
        },
        mapObserversImpactedByOneObservable: {
            keyExpr: left.mapObserversImpactedByOneObservable.keyExpr
                .concat(right.mapObserversImpactedByOneObservable.keyExpr),
            query: {
                startkeyExpr: left.mapObserversImpactedByOneObservable.query.startkeyExpr
                    .concat(right.mapObserversImpactedByOneObservable.query.startkeyExpr),
                endkeyExpr: left.mapObserversImpactedByOneObservable.query.endkeyExpr
                    .concat(right.mapObserversImpactedByOneObservable.query.endkeyExpr),
                inclusive_start: left.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                inclusive_end: right.mapObserversImpactedByOneObservable.query.inclusive_end,
            }
        },
    }
}

export function compileExpression(node: Expression, context: FormulaCompilerContextType, requestedRetType: ExecPlanN): ExecPlanCompiledExpression {

    switch (node.type) {

        case 'ArrayExpression':
            let has$Identifier = node.elements.map(x => x.origExpr.indexOf('@[') >= 0).reduce((acc, x) => acc || x), 
                hasNon$Identifier = node.elements.map(x => x.origExpr.indexOf('@[') < 0).reduce((acc, x) => acc || x);

            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: has$Identifier,
                hasNon$Identifier: hasNon$Identifier,
            };

        case 'BinaryExpression':
            if (MapReduceKeysAndQueriesN === requestedRetType) {
                return extractKeysAndQueriesFromBinaryExpression(node, context);
            }
            else if (CompiledScalarN === requestedRetType) {
                return mergeBinaryNodes(node, compileExpression(node.left, context, CompiledScalarN), compileExpression(node.right, context, CompiledScalarN), context);
            }
            else return mergeBinaryNodes(node, compileExpression(node.left, context, CompiledFormulaN), compileExpression(node.right, context, CompiledFormulaN), context);

        case 'CallExpression':
            var fn: (...args) => ExecPlanCompiledExpression;
            if (!isIdentifier(node.callee)) throw new Error("Expected function name but found " + JSON.stringify(node.callee, null, 4));
            fn = ScalarFunctions[node.callee.name] || MapFunctions[node.callee.name] || MapReduceFunctions[node.callee.name];
            if (fn != null) {
                return fn.call(null, {
                    context: context,
                    funcExpr: node,
                } as FuncCommon, ...node.arguments);
            } else throw new Error("Unknown function: " + node.origExpr);

        case 'ConditionalExpression':
            throw new Error("ConditionalExpression(s) are not supported (yet): " + node.origExpr);

        case 'Identifier':
            node.parent = context.currentEntityName;
            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: false,
                hasNon$Identifier: true,
            };

        case 'NumberLiteral':
            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: false,
                hasNon$Identifier: false,
            };

        case 'StringLiteral':
            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: false,
                hasNon$Identifier: false,
            };

        case 'Literal':
            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: node.raw === '@',
                hasNon$Identifier: false,
            };

        case 'LogicalExpression':
            if (requestedRetType === CompiledScalarN) {
                return mergeBinaryNodes(node, compileExpression(node.left, context, CompiledScalarN), compileExpression(node.right, context, CompiledScalarN), context);
            } else if (includesMapReduceKeysAndQueriesN(requestedRetType)) {
                return extractKeysAndQueriesFromLogicalExpression(node, context);
            } else throw new Error("Unknown context:" + node.origExpr);

        case 'MemberExpression':
            if (!isIdentifier(node.property)) throw new Error('Calculated MemberExpression property is not allowed at ' + node.origExpr);
            if (!(isLiteral(node.object) && node.object.raw === '@') && !isIdentifier(node.object) && !isMemberExpression(node.object)) throw new Error('Calculated MemberExpression object is not allowed at ' + node.origExpr);
            let obj = compileExpression(node.object, context, requestedRetType);
            let prop = compileExpression(node.property, context, requestedRetType);
            if (CompiledScalarN === requestedRetType || !isTableName(node.object.origExpr)) {
                if (!isCompiledScalar(obj) || !isCompiledScalar(prop)) throw new Error("Expected scalar expressions in scalar context but found " + node.property.origExpr + "; " + node.object.origExpr);
                return {
                    type_: CompiledScalarN, rawExpr: node,
                    has$Identifier: obj.has$Identifier,
                    hasNon$Identifier: !obj.has$Identifier,
                };
            } else if (isCompiledScalar(obj) && isCompiledScalar(prop)) {
                checkIdentifiers(node);

                let m = node.origExpr.match(/^([\w$]+)\.(.*)$/);
                let referencedTableName = m![1];
                let referencedColumnName = m![2];

                if (isLiteral(node.object) && node.object.raw === '@') {
                    //set the table name for this column to the table of the current row
                    (prop.rawExpr as Identifier).parent = context.targetEntityName;
                } else {
                    //set the table name for this column to the referenced table
                    (prop.rawExpr as Identifier).parent = referencedTableName;
                }

                if (!m) throw new Error("Expected MemberExpression but found " + JSON.stringify(node));
                return {
                    type_: MapValueN,
                    rawExpr: node,
                    entityName: referencedTableName,
                    valueExpr: $s2e(referencedColumnName),
                    has$Identifier: false,
                    hasNon$Identifier: true,
                };
            } else return combine2Nodes(node, 'object', obj, 'property', prop, context);
        case 'ThisExpression':
            throw new Error("'this' expressions are not supported: " + node.origExpr);

        case 'UnaryExpression':
            if (!isNumberLiteral(node.argument)) throw new Error("Unary operators only supported on number literals but found " + node.origExpr);
            return {
                type_: CompiledScalarN, rawExpr: node,
                has$Identifier: false,
                hasNon$Identifier: false,
            };

        case 'Compound':
            throw new Error("Compound are not supported: " + node.origExpr);

        default:
            throw new Error("Unknown expression: " + JSON.stringify(node));
    }
}

export function parseFormula(formula: FormulaExpression, forceParseIncompleteExpr: boolean = false): Expression {
    return jsep(formula, forceParseIncompleteExpr);
}
export function compileFormula(targetEntityName: string, propJsPath: string, formula: FormulaExpression, forceParseIncompleteExpr: boolean = false): CompiledFormula {
    let formulaAstNode = parseFormula(formula, forceParseIncompleteExpr);
    let compiledExpression = compileExpression(formulaAstNode, { targetEntityName: targetEntityName, targetPropertyName: propJsPath }, CompiledFormulaN);
    let ret = compiledExpression;

    if (isCompiledScalar(compiledExpression)) {
        ret = {
            type_: CompiledFormulaN,
            rawExpr: formulaAstNode,
            finalExpression: compiledExpression.rawExpr,
            targetEntityName: targetEntityName,
            targetPropertyName: propJsPath,
        };
    } else if (isMapFunctionAndQuery(compiledExpression)) {
        throw new Error("MAP functions must be reduced: " + JSON.stringify(compiledExpression, null, 4));
    } else if (isMapReduceTrigger(compiledExpression)) {
        ret = {
            type_: CompiledFormulaN,
            rawExpr: formulaAstNode,
            finalExpression: $s2e("$TRG$['" + compiledExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']"),
            targetEntityName: targetEntityName,
            targetPropertyName: propJsPath,
            triggers: [compiledExpression],
        }
    } else if (isCompiledFormula(compiledExpression)) {
        ret = compiledExpression;
    } else throw new Error("Unknown compiled formula: " + JSON.stringify(compiledExpression, null, 4));
    
    logCompileFormula(formula, ret);

    return ret;
}


export function $s2e(expr: string | Expression): Expression {
    let parsedExpr = typeof expr === 'string' ? jsep(expr) : expr;
    return parsedExpr;
}

export function _rem_$e2s_(node: Expression, strict: boolean = false): string {
    let lP = strict ? '(' : '', rP = strict ? ')' : '';
    switch (node.type) {

        case 'ArrayExpression':
            return '[' + node.elements.map(e => _rem_$e2s_(e, strict)).join(',') + ']';

        case 'BinaryExpression':
            return lP + _rem_$e2s_(node.left, strict) + node.operator + _rem_$e2s_(node.right, strict) + rP;

        case 'CallExpression':
            let ret: string[] = [];
            if (isIdentifier(node.callee)) ret.push(node.callee.name)
            else ret.push(lP + _rem_$e2s_(node.callee, strict) + rP)
            ret.push('(');
            ret.push(node.arguments.map(a => _rem_$e2s_(a, strict)).join(','));
            ret.push(')');
            return ret.join('');

        case 'ConditionalExpression':
            return lP + _rem_$e2s_(node.test, strict) + rP +
                '?' + lP + _rem_$e2s_(node.consequent, strict) + rP +
                ':' + lP + _rem_$e2s_(node.alternate, strict) + rP;

        case 'Identifier':
            return node.name;

        case 'NumberLiteral':
            return node.raw;

        case 'StringLiteral':
            return node.raw;

        case 'Literal':
            return node.raw;

        case 'LogicalExpression':
            return lP + _rem_$e2s_(node.left, strict) + node.operator + _rem_$e2s_(node.right, strict) + rP;

        case 'MemberExpression':
            return (isIdentifier(node.object) ? node.object.name : lP + _rem_$e2s_(node.object, strict) + rP) +
                '.' + (isIdentifier(node.property) ? node.property.name : lP + _rem_$e2s_(node.property, strict) + rP)

        case 'ThisExpression':
            return 'this';

        case 'UnaryExpression':
            return lP + node.operator + _rem_$e2s_(node.argument, strict) + rP;

        case 'Compound':
            throw new Error("Compound expr are not supported: " + node.origExpr);

        default:
            throw new Error("Unknown expression: " + JSON.stringify(node));
    }
}

function encodeViewNameURIComponent(str: string): string {
    return encodeURIComponent(
        str.replace(/ /g, "___")
            .replace(/\//g, "_div_")
            .replace(/[%]/g, "_mod_")
            .replace(/&&/g, "_and_")
            .replace(/\|\|/g, "_or_")
            .replace(/[+]/g, "_plus_")
            .replace(/>/g, "_gt_")
            .replace(/</g, "_lt_")
            .replace(/>=/g, "_ge_")
            .replace(/<=/g, "_le_")
    );
}
export function getViewName(isAggs: boolean, entityName, rawExpr: Expression): string {
    let ret = (isAggs ? 'vaggs-' : 'vobs-') + entityName + '-' + encodeViewNameURIComponent(rawExpr.origExpr);
    ret = (isAggs ? 'vaggs-' : 'vobs-') + entityName + '-' + rawExpr.origExpr;
    return ret;
}

export function $ee2s(obj) {
    if (!_.isObject(obj)) return obj;
    if (isExpression(obj)) return obj.origExpr
    return _.transform(obj, function (result, value, key) {
        if (isExpression(value)) {
            result[key] = value.origExpr;
        } else if (_.isObject(value)) {
            result[key] = $ee2s(value);
        } else result[key] = value;
    });
}

export function combine2Nodes<T extends Expression>(
    expr: T,
    node1Name: keyof typeof expr,
    node1: ExecPlanCompiledExpression,
    node2Name: keyof typeof expr,
    node2: ExecPlanCompiledExpression,
    context: FormulaCompilerContextType): ExecPlanCompiledExpression {

    if (isCompiledScalar(node1)) {
        if (isCompiledScalar(node2)) {
            return {
                type_: CompiledScalarN,
                rawExpr: expr,
                has$Identifier: node1.has$Identifier || node2.has$Identifier,
                hasNon$Identifier: node1.hasNon$Identifier || node2.hasNon$Identifier,
            };
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            if (isBinaryExpression(expr) || isLogicalExpression(expr)) {
                let scalarExpr = _.cloneDeep(expr);
                scalarExpr.right = $s2e("$TRG$['" + node2.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']");
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.right.origExpr, scalarExpr.right.origExpr);

                return {
                    type_: CompiledFormulaN,
                    finalExpression: scalarExpr,
                    rawExpr: expr,
                    targetEntityName: context.targetEntityName,
                    targetPropertyName: context.targetPropertyName,
                    triggers: [node2]
                };
            } else return {
                ...node2,
                rawExpr: Object.assign({}, expr, {
                    [node1Name]: node1.rawExpr,
                    [node2Name]: {
                        type: 'Identifier',
                        name: node2.rawExpr,
                    },
                }) as T,
            };
        } else if (isCompiledFormula(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else if (isMapValue(node1)) {
        if (isCompiledScalar(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isCompiledFormula(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else if (isMapKeyAndQuery(node1)) {
        if (isCompiledScalar(node2)) {
            return {
                type_: MapFunctionAndQueryN,
                rawExpr: expr,
                entityName: node1.entityName,
                keyExpr: node1.keyExpr,
                valueExpr: node2.rawExpr,
                query: node1.query,
            }
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isCompiledFormula(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else if (isMapFunctionAndQuery(node1)) {
        if (isCompiledScalar(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isCompiledFormula(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else if (isMapReduceTrigger(node1)) {
        if (isCompiledScalar(node2)) {
            return {
                ...node1,
                rawExpr: Object.assign({}, expr, {
                    [node1Name]: {
                        type: 'Identifier',
                        name: node1.rawExpr,
                    },
                    [node2Name]: node2.rawExpr,
                }) as T,
            };
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            if (isBinaryExpression(expr) || isLogicalExpression(expr)) {
                let scalarExpr = _.cloneDeep(expr);
                scalarExpr.left = $s2e("$TRG$['" + node1.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']");
                scalarExpr.right = $s2e("$TRG$['" + node2.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']");
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.left.origExpr, scalarExpr.left.origExpr);
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.right.origExpr, scalarExpr.right.origExpr); 
                return {
                    type_: CompiledFormulaN,
                    rawExpr: expr,
                    finalExpression: scalarExpr,
                    targetEntityName: context.targetEntityName,
                    targetPropertyName: context.targetPropertyName,
                    triggers: [node1, node2]
                };
            } else throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isCompiledFormula(node2)) {
            if (isBinaryExpression(expr) || isLogicalExpression(expr)) {
                let scalarExpr = _.cloneDeep(expr);
                scalarExpr.left = $s2e("$TRG$['" + node1.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']");
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.left.origExpr, scalarExpr.left.origExpr);
                scalarExpr.right = node2.rawExpr;
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.left.origExpr, scalarExpr.left.origExpr);
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.right.origExpr, scalarExpr.right.origExpr); 
                return {
                    ...node2,
                    rawExpr: expr,
                    finalExpression: scalarExpr,
                    triggers: [node1].concat(node2.triggers || [])
                };
            } else throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else if (isCompiledFormula(node1)) {
        if (isCompiledScalar(node2)) {
            return {
                ...node1,
                rawExpr: expr,
                finalExpression: Object.assign({}, expr, {
                    [node1Name]: node1.rawExpr,
                    [node2Name]: node2.rawExpr,
                }) as T,
            };
        } else if (isMapFunctionAndQuery(node2)) {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isMapReduceTrigger(node2)) {
            if (isBinaryExpression(expr) || isLogicalExpression(expr)) {
                let scalarExpr = _.cloneDeep(expr);
                scalarExpr.left = node1.finalExpression;
                scalarExpr.right = $s2e("$TRG$['" + node2.mapreduceAggsOfManyObservablesQueryableFromOneObs.aggsViewName + "']");
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.left.origExpr, scalarExpr.left.origExpr);
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.right.origExpr, scalarExpr.right.origExpr);
                return {
                    ...node1,
                    rawExpr: expr,
                    finalExpression: scalarExpr,
                    triggers: (node1.triggers || []).concat(node2)
                };
            } else throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else if (isCompiledFormula(node2)) {
            if (isBinaryExpression(expr) || isLogicalExpression(expr)) {
                let scalarExpr = _.cloneDeep(expr);
                scalarExpr.left = node1.finalExpression;
                scalarExpr.right = node2.finalExpression;
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.left.origExpr, scalarExpr.left.origExpr);
                scalarExpr.origExpr = scalarExpr.origExpr.replace(expr.right.origExpr, scalarExpr.right.origExpr);
                return {
                    ...node1,
                    rawExpr: expr,
                    finalExpression: scalarExpr,
                    triggers: (node1.triggers || []).concat(node2.triggers || [])
                };
            } else throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        } else {
            throw new Error("nodes cannot be merged: " + JSON.stringify([node1, node2], null, 4));
        }
    } else throw Error("Unknown node1/node2 combination for Expression" + JSON.stringify([expr, node1, node2], null, 4));//FIXME: security breach, too many details in error messages, these should not be available to the clients
}

function checkIdentifiers(mexpr: MemberExpression) {
    if (!isIdentifier(mexpr.property)) throw new Error("computed MemberExpression property is not supported, at " + mexpr.origExpr);
    if (isMemberExpression(mexpr.object)) return checkIdentifiers(mexpr.object);
    else if (!isIdentifier(mexpr.object)) throw new Error("computed MemberExpression object is not supported, at " + mexpr.origExpr);
}

function isTableName(identifier: string) {
    if (identifier[0].toUpperCase() === identifier[0]) {
        return true;
    } else {
        return false;
    }
}