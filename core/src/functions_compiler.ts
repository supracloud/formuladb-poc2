/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { CircularJSON } from "@domain/json-stringify";
import {
    Expression, LogicalExpression, StringLiteral, NumberLiteral, isExpression,
    isMemberExpression, isCallExpression, BinaryExpression, CallExpression, MemberExpression,
    Identifier, isIdentifier, ArrayExpression, isLogicalExpression, isBinaryExpression, isArrayExpression, isStringLiteral
} from "jsep";

import {
    MapFunctionAndQuery, MapReduceTrigger,
    isMapFunctionAndQuery, KeyExpression, CompiledFormula,
    MapReduceKeysAndQueries, ExecPlanN, isMapReduceKeysAndQueries,
    MapFunction, isMapFunction, ExecPlanBase, isCompiledScalar,
    CompiledScalarN,
    MapKeyN,
    MapFunctionN,
    MapFunctionAndQueryN,
    MapReduceKeysAndQueriesN,
    MapReduceKeysQueriesAndValueN,
    MapReduceTriggerN,
    CompiledFormulaN,
    MapValue,
    MapValueN,
    isMapValue,
    MapKey,
    MapReduceKeysQueriesAndValue,
    isMapKey,
    includesMapKey,
    includesMapReduceKeysAndQueries,
    includesMapValue,
    isMapReduceKeysQueriesAndValue,
    ExecPlanCompiledExpression,
    CompiledScalar,
    MapKeyQuery,
    includesMapFunctionAndQuery,
    isMapReduceTrigger,
    extendsMapKey,
    extendsMapValue,
} from "@domain/metadata/execution_plan";
import { FuncCommon, FormulaCompilerContextType, compileExpression, 
    getViewName, FormulaCompilerError, 
    extractKeysAndQueriesFromBinaryExpression, 
    getViewDesc} from './formula_compiler';
import { isBooleanCallExpression, isBooleanBinaryExpression, 
    BooleanCallExpression, LogicalBinaryOperator } from '@domain/metadata/expressions';
import { _throw, _throwEx } from "./throw";
import { ReduceFun, TextjoinReduceFunN, SumReduceFunN, CountReduceFunN } from "@domain/metadata/reduce_functions";
import { $s2e } from "@functions/s2e";
import { functionSignature, getFunctionSignature, FunctionSignature } from "./functions_signature_decorator";
import { TyScalarValues } from "@domain/metadata/types";
import { ScalarFunctionsImplementations } from "@functions/scalar_functions_implementations";
import { Pn } from "@domain/metadata/entity";

function compileArg<IN extends Expression, OUT extends ExecPlanBase>(
    fc: FuncCommon,
    name: string,
    value: IN,
    validatorFunctions: ((param) => param is IN)[],
    context: FormulaCompilerContextType,
    requestedRetType: ExecPlanN,
    outValidator: (param: ExecPlanBase) => param is OUT): OUT {

    let validArg = false;
    validatorFunctions.forEach(f => {
        if (f(value)) validArg = true;
    });
    if (!validArg) throw new FormulaCompilerError(fc.funcExpr, "Expected " + validatorFunctions.map(f => f.name).join('|') + "but found " + value.origExpr)

    let ret = compileExpression(value, context, requestedRetType);
    if (!outValidator(ret)) throw new FormulaCompilerError(fc.funcExpr, "Compilation failed for argument " + value.origExpr + "; expected " + outValidator.name + " but found " + ret.type_ + "; " + CircularJSON.stringify(ret, null, 4));
    return ret;
}

function compileArgNV<IN extends Expression>(
    fc: FuncCommon,
    name: string,
    value: IN,
    validatorFunctions: ((param) => param is IN)[],
    context: FormulaCompilerContextType,
    requestedRetType: ExecPlanN): ExecPlanCompiledExpression {

    let validArg = false;
    validatorFunctions.forEach(f => {
        if (f(value)) validArg = true;
    });
    if (!validArg) throw new FormulaCompilerError(fc.funcExpr, "Expected " + validatorFunctions.map(f => f.name).join('|') + "but found " + value.origExpr)

    let ret = compileExpression(value, context, requestedRetType);
    return ret;
}


function checkMandatoryArg<T>(fc: FuncCommon, name: string, arg: T | undefined): T {
    if (!arg) throw new FormulaCompilerError(fc.funcExpr, "Mandatory parameter " + name + " missing for " + fc.funcExpr.origExpr);
    else return arg;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// map functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _MAP_VALUE(fc: FuncCommon, fullTableRange: Identifier, valueExpr: Expression): MapValue {
    let ce = compileArg(fc, 'expr', valueExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (isIdentifier(fullTableRange)) {
        return {
            type_: MapValueN,
            rawExpr: fc.funcExpr,
            entityId: fullTableRange.name,
            valueExpr: ce.rawExpr,
            has$Identifier: ce.has$Identifier,
            hasNon$Identifier: ce.hasNon$Identifier,
        };
    } else throw new FormulaCompilerError(fc.funcExpr, "Expected identifier but found " + CircularJSON.stringify(fullTableRange));
}

function _MAP_KEY(fc: FuncCommon, fullTableRange: Identifier, keyExpr: Expression): MapKey {
    let ce = compileArg(fc, 'expr', keyExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (isIdentifier(fullTableRange)) {
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityId: fullTableRange.name,
            keyExpr: [ce.rawExpr],
            has$Identifier: ce.has$Identifier,
            hasNon$Identifier: ce.hasNon$Identifier,
        };
    } else throw new FormulaCompilerError(fc.funcExpr, "Expected identifier but found " + CircularJSON.stringify(fullTableRange));
}

function _MAP(fc: FuncCommon, basicRange: Identifier | MemberExpression | CallExpression, keyExpr: Expression, valueExpr?: Expression): MapKey | MapFunction {
    let inputRange = compileArgNV(fc, 'basicRange', basicRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let cKey = compileArg(fc, 'expr', keyExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (cKey.has$Identifier) throw new FormulaCompilerError(fc.funcExpr, "@[] is not allowed in lookup key expressions: " + fc.funcExpr.origExpr);
    if (valueExpr) {
        let cVal = compileArg(fc, 'expr', valueExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
        if (cVal.has$Identifier) throw new FormulaCompilerError(fc.funcExpr, "@[] is not allowed in map value expressions: " + fc.funcExpr.origExpr);
    }

    if (isIdentifier(basicRange)) {
        if (!isCompiledScalar(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "Expected Identifier but found " + CircularJSON.stringify(inputRange) + " for " + basicRange.origExpr);
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityId: basicRange.name,
            keyExpr: isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr],
            has$Identifier: inputRange.has$Identifier,
            hasNon$Identifier: inputRange.hasNon$Identifier,
        };
    } else if (isMapValue(inputRange)) {
        if (valueExpr) throw new FormulaCompilerError(fc.funcExpr, "Value expression already provided: " + fc.funcExpr.origExpr);
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityId: inputRange.entityId,
            keyExpr: isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr],
            valueExpr: inputRange.valueExpr,
        };
    } else if (isMapFunction(inputRange)) {
        if (valueExpr) throw new FormulaCompilerError(fc.funcExpr, "Map value expression already provided: " + fc.funcExpr.origExpr);
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityId: inputRange.entityId,
            keyExpr: inputRange.keyExpr.concat(isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr]),
            valueExpr: inputRange.valueExpr,
        };
    } else throw new FormulaCompilerError(fc.funcExpr, "GROUP_BY expects MapValue or MapFunction but received " + basicRange.origExpr);
}

function GROUP_BY(fc: FuncCommon, basicRange: Identifier | MemberExpression | CallExpression, ...groupExpr: Expression[]): MapKey | MapFunction {
    let inputRange = compileArgNV(fc, 'basicRange', basicRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let compiledGroupExpr = groupExpr.map((ge, idx) =>
        compileArg(fc, 'groupExpr' + idx, ge, [isExpression], fc.context, CompiledScalarN, isCompiledScalar));

    if (isIdentifier(basicRange)) {
        if (!isCompiledScalar(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "Expected Identifier but found " + CircularJSON.stringify(inputRange) + " for " + basicRange.origExpr);
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityId: basicRange.name,
            keyExpr: compiledGroupExpr.map(cg => cg.rawExpr),
            has$Identifier: inputRange.has$Identifier,
            hasNon$Identifier: inputRange.hasNon$Identifier,
        };
    } else if (isMapValue(inputRange)) {
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityId: inputRange.entityId,
            keyExpr: compiledGroupExpr.map(cg => cg.rawExpr),
            valueExpr: inputRange.valueExpr,
        };
    } else if (isMapFunction(inputRange)) {
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityId: inputRange.entityId,
            keyExpr: inputRange.keyExpr.concat(compiledGroupExpr.map(cg => cg.rawExpr)),
            valueExpr: inputRange.valueExpr,
        };
    } else throw new FormulaCompilerError(fc.funcExpr, "GROUP_BY expects MapValue or MapFunction but received " + basicRange.origExpr);
}
function __IF(fc: FuncCommon, tableRange: Identifier | MemberExpression | CallExpression, logicalExpression: LogicalExpression | BinaryExpression | CallExpression): [ExecPlanCompiledExpression, MapReduceKeysAndQueries] {
    let inputRange = compileArgNV(fc, 'basicRange', tableRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let logicalExpressionContext = { ...fc.context };
    if (extendsMapValue(inputRange)) {
        logicalExpressionContext.referencedEntityName = inputRange.entityId;
    }
    let compiledLogicalExpression = compileArg(fc, 'logicalExpression', logicalExpression,
        [isLogicalExpression, isBooleanBinaryExpression, isBooleanCallExpression],
        logicalExpressionContext, MapReduceKeysAndQueriesN, isMapReduceKeysAndQueries);
    return [inputRange, compiledLogicalExpression];
}
function _IF(fc: FuncCommon, inputRange: ExecPlanCompiledExpression, compiledLogicalExpression: MapReduceKeysAndQueries): MapReduceKeysAndQueries | MapReduceKeysQueriesAndValue {

    if (isIdentifier(inputRange.rawExpr)) {
        return {
            type_: MapReduceKeysAndQueriesN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                map: {
                    keyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr,
                    query: {
                        startkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr,
                        endkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr,
                        inclusive_start: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                        inclusive_end: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                    },
                },
            },
            mapObserversImpactedByOneObservable: {
                ...compiledLogicalExpression.mapObserversImpactedByOneObservable,
            }
        };
    } else if (isMapValue(inputRange)) {
        return {
            type_: MapReduceKeysQueriesAndValueN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                map: {
                    entityId: inputRange.entityId,
                    keyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr,
                    valueExpr: inputRange.valueExpr,
                    query: {
                        startkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr,
                        endkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr,
                        inclusive_start: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                        inclusive_end: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                    },
                },
            },
            mapObserversImpactedByOneObservable: {
                ...compiledLogicalExpression.mapObserversImpactedByOneObservable,
            }
        };
    } else if (isMapReduceKeysQueriesAndValue(inputRange)) {
        return {
            type_: MapReduceKeysQueriesAndValueN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                map: {
                    entityId: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId,
                    keyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr
                        .concat(compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr),
                    valueExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr,
                    query: {
                        startkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr,
                        endkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr,
                        inclusive_start: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                        inclusive_end: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                    },
                },
            },
            mapObserversImpactedByOneObservable: {
                ...compiledLogicalExpression.mapObserversImpactedByOneObservable
            }
        };
    } else return {
        type_: MapReduceKeysQueriesAndValueN,
        rawExpr: fc.funcExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            map: {
                entityId: extendsMapKey(inputRange) ? inputRange.entityId : _throw("IF Expected MapKey but found ", inputRange),
                keyExpr: extendsMapKey(inputRange) ? inputRange.keyExpr.concat(
                    compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr)
                    : compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr,
                valueExpr: extendsMapValue(inputRange) ? inputRange.valueExpr : _throw("IF Expected MapValue but found ", inputRange),
                query: {
                    startkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr,
                    endkeyExpr: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr,
                    inclusive_start: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                    inclusive_end: compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                },
            },
        },
        mapObserversImpactedByOneObservable: {
            ...compiledLogicalExpression.mapObserversImpactedByOneObservable
        }
    };
}

function _RANGE(fc: FuncCommon, basicRange: Identifier | MemberExpression | CallExpression, startExpr: Expression, endExpr: Expression, inclusive_start?: Identifier, inclusive_end?: Identifier): MapFunctionAndQuery {
    let inputRange = compileArgNV(fc, 'basicRange', basicRange, [isIdentifier, isMemberExpression, isCallExpression], fc.context, MapFunctionN);
    if (!extendsMapKey(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "basicRange is expected to have lookup keys: " + basicRange.origExpr + "; " + CircularJSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
    if (!extendsMapValue(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "basicRange is expected to have a selected column or computed value: " + basicRange.origExpr + "; " + CircularJSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
    let compiledStartExpr = compileArg(fc, 'start', startExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(compiledStartExpr) || !compiledStartExpr.has$Identifier || compiledStartExpr.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, "RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + startExpr.origExpr + "; " + CircularJSON.stringify(compiledStartExpr, null, 4));
    let compiledEndExpr = compileArg(fc, 'end', endExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(compiledEndExpr) || !compiledEndExpr.has$Identifier || compiledEndExpr.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, "RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + endExpr.origExpr + "; " + CircularJSON.stringify(compiledEndExpr, null, 4));

    return {
        type_: MapFunctionAndQueryN,
        rawExpr: fc.funcExpr,
        entityId: inputRange.entityId,
        keyExpr: inputRange.keyExpr,
        valueExpr: inputRange.valueExpr,
        query: {
            startkeyExpr: isArrayExpression(startExpr) ? startExpr.elements : [startExpr],
            endkeyExpr: isArrayExpression(endExpr) ? endExpr.elements : [endExpr],
            inclusive_start: false,
            inclusive_end: false,
        }
    }
}

export const MapFunctions = {
    GROUP_BY: GROUP_BY,
    _MAP_VALUE: _MAP_VALUE,
    _MAP_KEY: _MAP_KEY,
    _MAP: _MAP,
    _RANGE: _RANGE,
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// reduce functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _REDUCE(fc: FuncCommon, inputRange: MapValue | MapFunction | MapFunctionAndQuery | MapReduceKeysQueriesAndValue, reduceFun: ReduceFun): MapReduceTrigger {
    if (isMapReduceKeysQueriesAndValue(inputRange)) {
        return {
            type_: MapReduceTriggerN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                aggsViewName: getViewName(true, fc.context.targetPropertyName, fc.funcExpr, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId),
                aggsViewDescription: getViewDesc(true, fc.context.targetPropertyName, fc.funcExpr, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map),
                map: {
                    ...inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                },
                reduceFun: reduceFun,
            },
            mapObserversImpactedByOneObservable: {
                obsViewName: getViewName(false, fc.context.targetPropertyName, fc.funcExpr, fc.context.targetEntityName),
                obsViewDescription: getViewDesc(false, fc.context.targetPropertyName, fc.funcExpr, {entityId: fc.context.targetEntityName, keyExpr: inputRange.mapObserversImpactedByOneObservable.keyExpr}),
                entityId: fc.context.targetEntityName,
                ...inputRange.mapObserversImpactedByOneObservable,
                valueExpr: $s2e(`@[_id]`),
            }
        };
    } else {
        return {
            type_: MapReduceTriggerN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                aggsViewName: getViewName(true, fc.context.targetPropertyName, fc.funcExpr, inputRange.entityId),
                aggsViewDescription: getViewDesc(true, fc.context.targetPropertyName, fc.funcExpr, {
                    entityId: inputRange.entityId,
                    keyExpr: isMapValue(inputRange) ? [$s2e(`_id`)] : inputRange.keyExpr,
                }),
                map: {
                    entityId: inputRange.entityId,
                    keyExpr: isMapValue(inputRange) ? [$s2e(`_id`)] : inputRange.keyExpr,
                    valueExpr: inputRange.valueExpr,
                    query: includesMapFunctionAndQuery(inputRange) ? inputRange.query : {
                        startkeyExpr: [$s2e(`''`)],
                        endkeyExpr: [$s2e(`'\ufff0'`)],
                        inclusive_start: false,
                        inclusive_end: false,
                    }
                },
                reduceFun: reduceFun,
            },
            mapObserversImpactedByOneObservable: {
                obsViewName: getViewName(false, fc.context.targetPropertyName, fc.funcExpr, fc.context.targetEntityName),
                obsViewDescription: getViewDesc(false, fc.context.targetPropertyName, fc.funcExpr, {
                    entityId: fc.context.targetEntityName,
                    keyExpr: [$s2e(`@[_id]`)],
                }),
                entityId: fc.context.targetEntityName,
                keyExpr: [$s2e(`@[_id]`)],
                valueExpr: $s2e(`@[_id]`),
                query: {
                    startkeyExpr: [$s2e(`''`)],
                    endkeyExpr: [$s2e(`'\ufff0'`)],
                    inclusive_start: false,
                    inclusive_end: false,
                }
            }
        };
    }
}

functionSignature("SUMIF", { types: [{name: "NumberAggType"}]}, "sum the values in another table matching a condition", {name: 'table_column', types: [{name: "TableAndColumnNameType"}]}, {name: 'condition', types: [{name: "BooleanType"}]});
function SUMIF(fc: FuncCommon, tableRange: MemberExpression | CallExpression, logicalExpression: BinaryExpression | LogicalExpression): MapReduceTrigger {
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    let range = _IF(fc, inputRange, compiledLogicalExpression);
    if (!isMapReduceKeysQueriesAndValue(range)) throw new FormulaCompilerError(fc.funcExpr, "SUMIF expects a value to sum at " + fc.funcExpr.origExpr);
    return _REDUCE(fc, range, { name: SumReduceFunN });
}
functionSignature("COUNTIF", { types: [{name: "NumberAggType"}]}, "count the values in another table matching a condition", {name: 'tableRange', types: [{name: "TableNameType"}, {name: "TableAndColumnNameType"}]}, {name: 'logicalExpression', types: [{name: "BooleanType"}]});
function COUNTIF(fc: FuncCommon, tableRange: Identifier | MemberExpression, logicalExpression: BinaryExpression | LogicalExpression): MapReduceTrigger {
    if (!tableRange || !logicalExpression) throw new FormulaCompilerError(fc.funcExpr, "Expected arguments tableRange, logicalExpression");
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    let range = _IF(fc, inputRange, compiledLogicalExpression);
    let rangeTmp = _.cloneDeep(range);
    let countRange: MapReduceKeysQueriesAndValue = {
        ...rangeTmp,
        type_: MapReduceKeysQueriesAndValueN,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            ...rangeTmp.mapreduceAggsOfManyObservablesQueryableFromOneObs,
            map: {
                ...rangeTmp.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                entityId: isIdentifier(tableRange) ? tableRange.name : (
                    isIdentifier(tableRange.object) ? tableRange.object.name : _throw(`Simple MemberExpression expected`, tableRange, fc.funcExpr)),
                valueExpr: $s2e('1'),
            }
        }
    }
    return _REDUCE(fc, countRange, { name: CountReduceFunN });
}
functionSignature("TEXTJOIN", { types: [{name: "TextAggType"}]}, "concatenate the values in another table matching a condition", {name: 'tableRange', types: [{name: "TableAndColumnNameType"}]}, {name: 'logicalExpression', types: [{name: "BooleanType"}]}, {name: 'delimiter', types: [{name: "TextType"}]});
function TEXTJOIN(fc: FuncCommon, tableRange: MemberExpression | CallExpression, logicalExpression: BinaryExpression | LogicalExpression, delimiter: StringLiteral): MapReduceTrigger {
    if (!tableRange || !logicalExpression) throw new FormulaCompilerError(fc.funcExpr, "Expected arguments tableRange, logicalExpression");
    let [_inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    let inputRange = _IF(fc, _inputRange, compiledLogicalExpression);
    if (!isMapReduceKeysQueriesAndValue(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "TEXTJOIN expects a value to join at " + fc.funcExpr.origExpr);

    return {
        ...inputRange,
        type_: MapReduceTriggerN,
        mapObserversImpactedByOneObservable: {
            ...inputRange.mapObserversImpactedByOneObservable,
            obsViewName: getViewName(false, fc.context.targetPropertyName, fc.funcExpr, fc.context.targetEntityName),
            obsViewDescription: getViewDesc(false, fc.context.targetPropertyName, fc.funcExpr, {
                entityId: fc.context.targetEntityName,
                keyExpr: inputRange.mapObserversImpactedByOneObservable.keyExpr,
            }),
            valueExpr: $s2e(`@[_id]`),
            entityId: fc.context.targetEntityName,
        },
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, fc.context.targetPropertyName, fc.funcExpr, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId),
            aggsViewDescription: getViewDesc(true, fc.context.targetPropertyName, fc.funcExpr, {
                entityId: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId,
                keyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr
                    .concat(inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr),
            }),
            map: {
                entityId: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId,
                keyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr
                    .concat(inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr),
                valueExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr,
                query: {
                    startkeyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr
                        .concat($s2e(`null`)),
                    endkeyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr
                        .concat($s2e(`"\ufff0"`)),
                    inclusive_start: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                    inclusive_end: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                }
            },
            reduceFun: { name: TextjoinReduceFunN, delimiter: delimiter.value },
        },
    }
}

//== Lookup functions ==============================================================================================================
/**
 * Reduces using _count and then searches 
 */
// function RANK(value: string | Expression, data: string | CallExpression, isAscending: string | Literal): string { return f2s(RANK, value, data, isAscending); }
functionSignature("RANK", { types: [{name: "NumberAggType"}]}, "compute the position of a value from the current table in a list of values from another table", {name: 'group_lookups_by', types: TyScalarValues, denyNon$Identifier: true}, {name: 'lookup_value', types: TyScalarValues, denyNon$Identifier: true}, { name: "table", types: [{name: "TableNameType"}]}, {name: 'group_values_by', types: TyScalarValues, deny$Identifier: true}, {name: 'values', types: TyScalarValues, deny$Identifier: true});
function RANK(fc: FuncCommon, group_lookups_by: Expression, lookupExpr: Expression, table: Identifier, group_values_by: Expression, values: Expression): MapReduceTrigger {
    if (!isIdentifier(table)) throw new FormulaCompilerError(fc.funcExpr, `RANK expects a table to compute the list of lookup values, but found ${table}`);
    let c = compileArg(fc, 'group_lookups_by', group_lookups_by, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(c) || !c.has$Identifier || c.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, `RANK expects lookup group_by expression to be a formula using values from the current record (e.g. @[column_name] where column_name is a column of ${fc.context.targetEntityName})`);
    if (!isCompiledScalar(c) || !c.has$Identifier || c.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, `RANK expects lookup_value to be a formula using values from the current record (e.g. @[column_name] where column_name is a column of ${fc.context.targetEntityName})`);
    c = compileArg(fc, 'start_expr', group_values_by, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(c) || c.has$Identifier || !c.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, `RANK expects a start_value to be a formula applied to records from table ${table.name} (not using @[], just plain column names from table ${table.name})`);
    c = compileArg(fc, 'end_expr', values, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(c) || c.has$Identifier || !c.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, `RANK expects a end_value to be a formula applied to records from table ${table.name} (not using @[], just plain column names from table ${table.name})`);
    
    return {
        type_: MapReduceTriggerN,
        rawExpr: fc.funcExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, fc.context.targetPropertyName, fc.funcExpr, table.name),
            aggsViewDescription: getViewDesc(true, fc.context.targetPropertyName, fc.funcExpr, {
                entityId: table.name,
                keyExpr: [group_values_by, values],
            }),
            map: {
                entityId: table.name,
                keyExpr: [group_values_by, values],
                valueExpr: $s2e(`1`),
                query: {
                    startkeyExpr: [group_lookups_by],
                    endkeyExpr: [group_lookups_by, lookupExpr],
                    inclusive_start: false,
                    inclusive_end: true,
                }
            },
            reduceFun: { name: CountReduceFunN },
        },
        mapObserversImpactedByOneObservable: {
            obsViewName: getViewName(false, fc.context.targetPropertyName, fc.funcExpr, fc.context.targetEntityName),
            obsViewDescription: getViewDesc(false, fc.context.targetPropertyName, fc.funcExpr, {
                entityId: fc.context.targetEntityName,
                keyExpr: [group_lookups_by, lookupExpr],
            }),
            entityId: fc.context.targetEntityName,
            keyExpr: [group_lookups_by, lookupExpr],
            valueExpr: $s2e(`@[_id]`),
            query: {
                startkeyExpr: [group_values_by],
                endkeyExpr: [group_values_by, $s2e(`"\ufff0"`)],
                inclusive_start: true,
                inclusive_end: true,
            }
        },
    }
}

export const MapReduceFunctions = {
    SUMIF: SUMIF,
    COUNTIF: COUNTIF,
    TEXTJOIN: TEXTJOIN,
    RANK: RANK,
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// simple scalar functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function compileScalarFunction(fc: FuncCommon, ...args: Expression[]): ExecPlanCompiledExpression {
    if (!isCallExpression(fc.funcExpr)) throw new FormulaCompilerError(fc.funcExpr, "Expected function call expression but found " + CircularJSON.stringify(fc.funcExpr));
    let evalledArs: CompiledScalar[] = args.map(arg => {
        if (!isExpression(arg)) throw new FormulaCompilerError(fc.funcExpr, "Unexpected function arg " + CircularJSON.stringify(arg) + '; ' + CircularJSON.stringify(fc.funcExpr));
        let ret = compileExpression(arg, fc.context, CompiledScalarN);

        //FIXME: this is not true, arguments of scalar functions can be the results of trigger calculations, e.g. MAX(SUMIF(blabla...), 20)
        //to fix this and implement spec "scalar-functions having table-functions as argument"
        if (!isCompiledScalar(ret)) throw new FormulaCompilerError(fc.funcExpr, "Arguments of scalar functions must be scalar expressions at " + CircularJSON.stringify(arg) + '; ' + CircularJSON.stringify(fc.funcExpr));

        if (!isExpression(ret.rawExpr)) throw new FormulaCompilerError(fc.funcExpr, "Arguments of scalar functions must be scalar expressions " + CircularJSON.stringify(arg) + '; ' + CircularJSON.stringify(fc.funcExpr));
        return ret;
    });

    return {
        type_: CompiledScalarN,
        rawExpr: {
            ...fc.funcExpr,
            // arguments: evalledArs.map(a => a.rawExpr) as Expression[],
        },
        has$Identifier: evalledArs.reduce((prev, current) => prev || current.has$Identifier, false),
        hasNon$Identifier: evalledArs.reduce((prev, current) => prev || current.hasNon$Identifier, false),
    };
}

functionSignature("AND", { types: [{name: "BooleanType"}]}, "returns true if both conditions are true", {name: 'condition1', types: [{name: "BooleanType"}]}, {name: 'condition2', types: [{name: "BooleanType"}]});
function AND(fc: FuncCommon, leftExpr: BinaryExpression | BooleanCallExpression, rightExpr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    if (fc.requestedRetType == CompiledScalarN) return compileScalarFunction.apply(null, arguments);

    let left: MapReduceKeysAndQueries | null = null;
    let right: MapReduceKeysAndQueries | null = null;
    if (isBooleanBinaryExpression(leftExpr)) left = extractKeysAndQueriesFromBinaryExpression(leftExpr, fc.context);
    if (isBooleanBinaryExpression(rightExpr)) right = extractKeysAndQueriesFromBinaryExpression(rightExpr, fc.context);

    if (left && right) {

        return {
            type_: MapReduceKeysAndQueriesN,
            rawExpr: fc.funcExpr,
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
        };
    } else if (left) {
        let ret: MapReduceKeysAndQueries = {
            ...left,
            type_: MapReduceKeysAndQueriesN,
            rawExpr: fc.funcExpr,
        };
        ret.mapObserversImpactedByOneObservable.query.filter = rightExpr;
        return ret;
    } else if (right) {
        let ret: MapReduceKeysAndQueries = {
            ...right,
            type_: MapReduceKeysAndQueriesN,
            rawExpr: fc.funcExpr,
        };
        ret.mapObserversImpactedByOneObservable.query.filter = leftExpr;
        return ret;
    } else return compileScalarFunction.apply(null, arguments);
}

functionSignature("OR", { types: [{name: "BooleanType"}]}, "returns true is one of the conditions is true", {name: 'condition1', types: [{name: "BooleanType"}]}, {name: 'conditin2', types: [{name: "BooleanType"}]});
function OR(fc: FuncCommon, leftExpr: BinaryExpression | BooleanCallExpression, rightExpr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    if (fc.requestedRetType != CompiledScalarN) {
        throw new FormulaCompilerError(fc.funcExpr, "OR is not currently supported in aggregations");
    }
    return compileScalarFunction.apply(null, arguments);
}

functionSignature("NOT", { types: [{name: "BooleanType"}]}, "returns true is the condition is false", {name: 'condition', types: [{name: "BooleanType"}]});
function NOT(fc: FuncCommon, expr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    if (fc.requestedRetType == CompiledScalarN) return compileScalarFunction.apply(null, arguments);
    else if (isBooleanBinaryExpression(expr)) {
        let negatedExpr = _.cloneDeep(expr);

        switch (expr.operator) {
            case '=':
                break;
            case '<':
                negatedExpr.operator = '>=' as LogicalBinaryOperator;
                break;
            case '<=':
                negatedExpr.operator = '>' as LogicalBinaryOperator;
                break;
            case '>':
                negatedExpr.operator = '<=' as LogicalBinaryOperator;
                break;
            case '>=':
                negatedExpr.operator = '<' as LogicalBinaryOperator;
                break;
            default: throw new FormulaCompilerError(expr, "Expected logical binary operator but found " + expr.operator);
        }

        return extractKeysAndQueriesFromBinaryExpression(negatedExpr, fc.context);

    } else if (isBooleanCallExpression(expr)) {
        return compileScalarFunction.apply(null, arguments);
    } else throw new FormulaCompilerError(fc.funcExpr, "Expected Logical BinaryExpression");
}

const ScalarFunctionInMapReduce = {
    AND: AND,
    OR: OR,
    NOT: NOT,
}

functionSignature("HLOOKUP", {types: TyScalarValues}, 
    "lookup the value from a record in a different table referenced by the current record", 
    { name: 'REFERENCE_TO_colum', types: [{name: "RefToColumnNameType"}] }, 
    { name: 'referenced_column', types: [{name: "ReferencedTableColumnNameType"}]}
);
export const LookupFunctions = {
    HLOOKUP: compileScalarFunction,
    // VLOOKUP: compileScalarFunction,
}

export const ScalarFunctionNames = Object.getOwnPropertyNames(ScalarFunctionsImplementations)
    .concat(Object.getOwnPropertyNames(Object.getPrototypeOf(ScalarFunctionsImplementations)))
    .filter(x => x !== "constructor"); 
export const ScalarFunctionsSignatures: FunctionSignature[] 
    = ScalarFunctionNames.map(fN => getFunctionSignature(fN) || _throw<FunctionSignature>(`Cannot find signature for ${fN}`)) as any;
export const LookupFunctionNames = Object.keys(LookupFunctions);
export const LookupFunctionSignatures: FunctionSignature[] = LookupFunctionNames.map(n => getFunctionSignature(n) || _throw(`signature for ${n} not found`));
export const MapReduceFunctionNames = Object.keys(MapReduceFunctions);
export const MapReduceFunctionSignatures: FunctionSignature[] = Object.keys(MapReduceFunctions).map(n => getFunctionSignature(n) || _throw(`signature for ${n} not found`));
    
export const ScalarFunctions: {[K in keyof typeof ScalarFunctionsImplementations]: () => ExecPlanCompiledExpression} = 
    Object.assign(
        ScalarFunctionNames
        .filter(k => !Object.keys(ScalarFunctionInMapReduce).includes(k))
        .reduce((agg, fN) => {
            agg[fN] = compileScalarFunction;
            return agg;
        }, {} as any),
        ScalarFunctionInMapReduce
    )
;

functionSignature("NUMBER_INPUT", {types: [{name: "InputColumnType"}]}, "input number values");
functionSignature("TEXT_INPUT", {types: [{name: "InputColumnType"}]}, "input text values");
functionSignature("RICH_TEXT_INPUT", {types: [{name: "InputColumnType"}]}, "input rich text values");
functionSignature("DATETIME_INPUT", {types: [{name: "InputColumnType"}]}, "input date/time values");
functionSignature("BOOLEAN_INPUT", {types: [{name: "InputColumnType"}]}, "input true/false logical values");
functionSignature("MEDIA_INPUT", {types: [{name: "InputColumnType"}]}, "upload images values");
functionSignature("REFERENCE_TO", {types: [{name: "TextType"}]}, "reference a record from another table", { name: 'referenced_table', types: [{name: "TableNameType"}] });
functionSignature("KEY", {types: [{name: "TextType"}]}, "computed key value, uniquely identifying the record", { name: 'computed_key_formula', types: [{name: "TextType"}] });
functionSignature("VALIDATE_RECORD", 
    {types: [{name: "BooleanType"}]}, 
    "validation formula, prevent invalid records from being saved", 
    { name: 'condition', types: [{name: "BooleanType"}] }, 
    { name: 'error_message', types: [{name: "TextType"}] }, 
    { name: 'message_param_1', types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}] }, 
    { name: 'message_param_2', types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}] }, 
    { name: 'message_param_3', types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}] }, 
    { name: 'message_param_4', types: [{name: "TextType"}, {name: "NumberType"}, {name: "DatetimeType"}] }
);
functionSignature("AUTO_CORRECT", {types: [{name: "BooleanType"}]}, "auto-correction formula", 
    { name: 'condition', types: [{name: "BooleanType"}] });
functionSignature("COMPUTED_RECORD", {types: [{name: "ActionType"}]}, 
    "evaluate id_formula in referenced table and create rows in the current table with the resulting _id",
    { name: 'target_table_name', types: [{name: "TableNameType"}] },
    { name: 'id_formula', types: [{name: "TextType"}] },
);
functionSignature("COMPUTED_RECORD_VALUE", {types: [{name: "ActionType"}]}, 
    "use this function to create computed values for COMPUTED_RECORD(s)", 
    { name: 'formula', types: [{name: "TextType"}] },
);

export enum PropertyTypeFunctionsNames {
    NUMBER_INPUT = "NUMBER_INPUT",
    TEXT_INPUT = "TEXT_INPUT",
    RICH_TEXT_INPUT = "RICH_TEXT_INPUT",
    MEDIA_INPUT = "MEDIA_INPUT",
    BOOLEAN_INPUT = "BOOLEAN_INPUT",
    DATETIME_INPUT = "DATETIME_INPUT",
    REFERENCE_TO = "REFERENCE_TO",
    KEY = "KEY",
    VALIDATE_RECORD = "VALIDATE_RECORD",
    AUTO_CORRECT = "AUTO_CORRECT",
    COMPUTED_RECORD = "COMPUTED_RECORD",
    COMPUTED_RECORD_VALUE = "COMPUTED_RECORD_VALUE",
}
export const PropertyTypeFunctions = Object.keys(PropertyTypeFunctionsNames)
    .reduce((agg, fN) => {
        agg[fN] = compileScalarFunction;
        return agg;
    }, {} as any)
export const PropertyTypeFunctionsSignatures: FunctionSignature[] 
    = Object.keys(PropertyTypeFunctionsNames).map(fN => getFunctionSignature(fN) || _throw<FunctionSignature>(`Cannot find signature for ${fN}`)) as any;

export const FunctionsDict: { [x: string]: Function } = Object.assign({}, ScalarFunctions, MapFunctions, MapReduceFunctions);
export const FunctionsList = Object.keys(ScalarFunctions)
    .concat(Object.keys(MapFunctions))
    .concat(Object.keys(MapReduceFunctions))
    .concat(Object.keys(ScalarFunctionInMapReduce))
    .concat(Object.keys(PropertyTypeFunctions))
;

function f2s(fN: string, ...args): string {
    if (args.length == 0) return fN;
    return fN + '(' + args.join(', ') + ')';
}
console.log(FunctionsList);
export const Fn: {[fN in keyof (typeof ScalarFunctions & typeof MapFunctions & typeof MapReduceFunctions)]: 
    (fN: string, ...args) => string } = FunctionsList.reduce((agg, fN) => {
        agg[fN] = (...args) => f2s(fN, ...args);
        return agg;
    }, {} as any);
