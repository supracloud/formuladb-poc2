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
    ScalarCallExpression,
} from "@domain/metadata/execution_plan";
import { FuncCommon, FormulaCompilerContextType, compileExpression, getViewName, FormulaCompilerError, isLogicalCallExpression, isLogicalOpBinaryExpression, extractKeysAndQueriesFromBinaryExpression, BooleanCallExpression, isBooleanCallExpression, LogicalOperator } from './formula_compiler';
import { _throw, _throwEx } from "./throw";
import { ReduceFun, TextjoinReduceFunN, SumReduceFunN, CountReduceFunN } from "@domain/metadata/reduce_functions";
import { $s2e } from "@functions/s2e";
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
function IF(fc: FuncCommon, tableRange: Identifier | MemberExpression | CallExpression, logicalExpression: LogicalExpression | BinaryExpression): MapReduceKeysAndQueries | MapReduceKeysQueriesAndValue {
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    return _IF(fc, inputRange, compiledLogicalExpression);
}
function __IF(fc: FuncCommon, tableRange: Identifier | MemberExpression | CallExpression, logicalExpression: LogicalExpression | BinaryExpression | CallExpression): [ExecPlanCompiledExpression, MapReduceKeysAndQueries] {
    let inputRange = compileArgNV(fc, 'basicRange', tableRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let logicalExpressionContext = { ...fc.context };
    if (includesMapValue(inputRange)) {
        logicalExpressionContext.currentEntityName = inputRange.entityId;
    }
    let compiledLogicalExpression = compileArg(fc, 'logicalExpression', logicalExpression,
        [isLogicalExpression, isLogicalOpBinaryExpression, isLogicalCallExpression],
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
    } else return {
        type_: MapReduceKeysQueriesAndValueN,
        rawExpr: fc.funcExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            map: {
                entityId: includesMapKey(inputRange) ? inputRange.entityId : _throw("IF Expected MapKey but found ", inputRange),
                keyExpr: includesMapKey(inputRange) ? inputRange.keyExpr.concat(
                    compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr)
                    : compiledLogicalExpression.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr,
                valueExpr: includesMapValue(inputRange) ? inputRange.valueExpr : _throw("IF Expected MapValue but found ", inputRange),
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
    if (!includesMapKey(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "basicRange is expected to have lookup keys: " + basicRange.origExpr + "; " + CircularJSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
    if (!includesMapValue(inputRange)) throw new FormulaCompilerError(fc.funcExpr, "basicRange is expected to have a selected column or computed value: " + basicRange.origExpr + "; " + CircularJSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
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
    IF: IF,
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
                aggsViewName: getViewName(true, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId, fc.funcExpr),
                map: {
                    ...inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                },
                reduceFun: reduceFun,
            },
            mapObserversImpactedByOneObservable: {
                obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
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
                aggsViewName: getViewName(true, inputRange.entityId, fc.funcExpr),
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
                obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
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

function SUM(fc: FuncCommon, tableRange: MemberExpression | CallExpression): MapReduceTrigger {
    let inputRange = compileArg(fc, 'basicRange', tableRange, [isMemberExpression, isCallExpression], fc.context, MapReduceKeysQueriesAndValueN, isMapReduceKeysQueriesAndValue);
    return _REDUCE(fc, inputRange, { name: SumReduceFunN });
}

function propertyTypeFunction(fc: FuncCommon): CompiledScalar {
    return {
        type_: CompiledScalarN,
        rawExpr: fc.funcExpr,
        has$Identifier: false,
        hasNon$Identifier: false,
    };
}

function REFERENCE_TO_COLUMN(fc: FuncCommon, tableRange: MemberExpression, required: "true" | "false"): CompiledScalar {
    if (!isMemberExpression(tableRange)) throw new FormulaCompilerError(fc.funcExpr, "REFERENCE_TO_COLUMN expects an TableName.column_name as argument");
    return propertyTypeFunction(fc);
}
function HLOOKUP_COLUMN(fc: FuncCommon, refToPropName: string, refPropName: string, required: "true" | "false"): CompiledScalar {
    return propertyTypeFunction(fc);
}
function NUMBER_COLUMN(fc: FuncCommon, required: "true" | "false") {
    return propertyTypeFunction(fc);
}
function TEXT_COLUMN(fc: FuncCommon, required: "true" | "false") {
    return propertyTypeFunction(fc);
}
function IMAGE_COLUMN(fc: FuncCommon, required: "true" | "false") {
    return propertyTypeFunction(fc);
}
function KEY_COLUMN(fc: FuncCommon, scalarFormula: ScalarCallExpression | CompiledScalar) {
    return propertyTypeFunction(fc);
}
function DATETIME_COLUMN(fc: FuncCommon, required: "true" | "false") {
    return propertyTypeFunction(fc);
}


function SUMIF(fc: FuncCommon, tableRange: MemberExpression | CallExpression, logicalExpression: BinaryExpression | LogicalExpression): MapReduceTrigger {
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    let range = _IF(fc, inputRange, compiledLogicalExpression);
    if (!isMapReduceKeysQueriesAndValue(range)) throw new FormulaCompilerError(fc.funcExpr, "SUMIF expects a value to sum at " + fc.funcExpr.origExpr);
    return _REDUCE(fc, range, { name: SumReduceFunN });
}
function COUNT(fc: FuncCommon, tableRange: MemberExpression | CallExpression) {
    let inputRange = compileArg(fc, 'basicRange', tableRange, [isMemberExpression, isCallExpression], fc.context, MapReduceKeysQueriesAndValueN, isMapReduceKeysQueriesAndValue);
    return _REDUCE(fc, inputRange, { name: CountReduceFunN });
}
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
function TEXTJOIN(fc: FuncCommon, tableRange: Expression, delimiter: StringLiteral): MapReduceTrigger {
    let inputRange = compileArg(fc, 'tableRange', tableRange, [isExpression], fc.context, MapReduceKeysQueriesAndValueN, isMapReduceKeysQueriesAndValue);

    return {
        ...inputRange,
        type_: MapReduceTriggerN,
        mapObserversImpactedByOneObservable: {
            ...inputRange.mapObserversImpactedByOneObservable,
            obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
            valueExpr: $s2e(`@[_id]`),
            entityId: fc.context.targetEntityName,
        },
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityId, fc.funcExpr),
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
function RANK(fc: FuncCommon, lookupExpr: Expression, tableRange: CallExpression): MapReduceTrigger {
    let compiledLookupExpr = compileArg(fc, 'lookupExpr', lookupExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(compiledLookupExpr) || !compiledLookupExpr.has$Identifier || compiledLookupExpr.hasNon$Identifier)
        throw new FormulaCompilerError(fc.funcExpr, "RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + lookupExpr.origExpr + "; " + CircularJSON.stringify(compiledLookupExpr, null, 4));
    let inputRange = compileArg(fc, 'tableRange', tableRange, [isExpression], fc.context, MapFunctionN, isMapFunction);

    return {
        type_: MapReduceTriggerN,
        rawExpr: fc.funcExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, inputRange.entityId, fc.funcExpr),
            map: {
                entityId: inputRange.entityId || _throw("RANK table range missing table name: " + tableRange.origExpr + "; " + CircularJSON.stringify(inputRange)),
                keyExpr: inputRange.keyExpr,
                valueExpr: $s2e(`1`),
                query: {
                    startkeyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements.slice(0, -1).concat($s2e(`null`)) : [$s2e(`null`)],
                    endkeyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements : [lookupExpr],
                    inclusive_start: false,
                    inclusive_end: true,
                }
            },
            reduceFun: { name: CountReduceFunN },
        },
        mapObserversImpactedByOneObservable: {
            obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
            entityId: fc.context.targetEntityName,
            keyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements : [lookupExpr],
            valueExpr: $s2e(`@[_id]`),
            query: {
                startkeyExpr: inputRange.keyExpr.slice(0, -1),
                endkeyExpr: inputRange.keyExpr.slice(0, -1).concat($s2e(`"\ufff0"`)),
                inclusive_start: true,
                inclusive_end: true,
            }
        },
    }
}

function VLOOKUP(fc: FuncCommon, entityRange, booleanExpr, resultExpr) {
}

export const MapReduceFunctions = {
    SUM: SUM,
    SUMIF: SUMIF,
    COUNT: COUNT,
    COUNTIF: COUNTIF,
    TEXTJOIN: TEXTJOIN,
    RANK: RANK,
    VLOOKUP: VLOOKUP,
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

function AND(fc: FuncCommon, leftExpr: BinaryExpression | BooleanCallExpression, rightExpr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    if (fc.requestedRetType == CompiledScalarN) return compileScalarFunction.apply(null, arguments);

    let left: MapReduceKeysAndQueries | null = null;
    let right: MapReduceKeysAndQueries | null = null;
    if (isLogicalOpBinaryExpression(leftExpr)) left = extractKeysAndQueriesFromBinaryExpression(leftExpr, fc.context);
    if (isLogicalOpBinaryExpression(rightExpr)) right = extractKeysAndQueriesFromBinaryExpression(rightExpr, fc.context);

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

function OR(fc: FuncCommon, leftExpr: BinaryExpression | BooleanCallExpression, rightExpr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    return compileScalarFunction.apply(null, arguments);
}

function NOT(fc: FuncCommon, expr: BinaryExpression | BooleanCallExpression): CompiledScalar | MapReduceKeysAndQueries {
    if (fc.requestedRetType == CompiledScalarN) return compileScalarFunction.apply(null, arguments);
    else if (isLogicalOpBinaryExpression(expr)) {
        let negatedExpr = _.cloneDeep(expr);

        switch (expr.operator) {
            case '==':
                break;
            case '<':
                negatedExpr.operator = '>=' as LogicalOperator;
                break;
            case '<=':
                negatedExpr.operator = '>' as LogicalOperator;
                break;
            case '>':
                negatedExpr.operator = '<=' as LogicalOperator;
                break;
            case '>=':
                negatedExpr.operator = '<' as LogicalOperator;
                break;
            default: throw new FormulaCompilerError(expr, "Expected logical binary operator but found " + expr.operator);
        }

        return extractKeysAndQueriesFromBinaryExpression(negatedExpr, fc.context);

    } else if (isBooleanCallExpression(expr)) {
        return compileScalarFunction.apply(null, arguments);
    } else throw new FormulaCompilerError(fc.funcExpr, "Expected Logical BinaryExpression");
}
function TEXT(fc: FuncCommon, expr: Expression, format: StringLiteral): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function ID(fc: FuncCommon, _id: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function CONCATENATE(fc: FuncCommon, expr: Expression, expr2: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function REGEXREPLACE(fc: FuncCommon, expr: Expression, regex: StringLiteral, replacement: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function SUBSTITUTE(fc: FuncCommon, expr: Expression, old_text: Expression, new_text: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function EOMONTH(fc: FuncCommon, expr: Expression, numMonths: NumberLiteral): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function SQRT(fc: FuncCommon, expr: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function ROUND(fc: FuncCommon, expr: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function FACT(fc: FuncCommon, expr: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function HLOOKUP(fc: FuncCommon, expr: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function FLOOR(fc: FuncCommon, expr: Expression, significance: NumberLiteral): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function DATEDIF(fc: FuncCommon, start_date: Expression, end_date: Expression, unit: StringLiteral): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function INTERSECTS(fc: FuncCommon, range_1: Expression, range_2: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function NUMRANGE(fc: FuncCommon, start: Expression, end: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function DATERANGE(fc: FuncCommon, start: Expression, end: Expression): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}

export const ScalarFunctions = {
    AND: AND,
    OR: OR,
    NOT: NOT,
    TEXT: TEXT,
    ID: ID,
    CONCATENATE: CONCATENATE,
    REGEXREPLACE: REGEXREPLACE,
    SUBSTITUTE: SUBSTITUTE,
    EOMONTH: EOMONTH,
    SQRT: SQRT,
    ROUND: ROUND,
    FACT: FACT,
    HLOOKUP: HLOOKUP,
    FLOOR: FLOOR,
    DATEDIF: DATEDIF,
    INTERSECTS: INTERSECTS,
    NUMRANGE: NUMRANGE,
    DATERANGE: NUMRANGE,
}

export const PropertyTypeFunctions = {
    [Pn.NUMBER + '_COLUMN']: NUMBER_COLUMN,
    [Pn.TEXT + '_COLUMN']: TEXT_COLUMN,
    [Pn.IMAGE + '_COLUMN']: IMAGE_COLUMN,
    [Pn.DATETIME + '_COLUMN']: DATETIME_COLUMN,
    [Pn.REFERENCE_TO + '_COLUMN']: REFERENCE_TO_COLUMN,
    [Pn.HLOOKUP + '_COLUMN']: HLOOKUP_COLUMN,
    [Pn.KEY + '_COLUMN']: KEY_COLUMN,
}

export const FunctionsDict: { [x: string]: Function } = Object.assign({}, ScalarFunctions, MapFunctions, MapReduceFunctions, PropertyTypeFunctions);
export const FunctionsList = Object.keys(ScalarFunctions)
    .concat(Object.keys(MapFunctions))
    .concat(Object.keys(MapReduceFunctions))
    .concat(Object.keys(PropertyTypeFunctions))
;

//cat core/src/functions_compiler.ts | perl -ne 'if (/^function ([A-Z_]+)\(/) {my $f=$1; s!:[\w \|]+([,)])!$1!g; s!\).*!)!; chomp; print "$f: `$_`,\n"}'
export const FunctionSignatures = {
    _MAP_VALUE: `function _MAP_VALUE(fc, fullTableRange, valueExpr)`,
    _MAP_KEY: `function _MAP_KEY(fc, fullTableRange, keyExpr)`,
    _MAP: `function _MAP(fc, basicRange, keyExpr, valueExpr?)`,
    GROUP_BY: `function GROUP_BY(fc, basicRange, ...groupExpr: Expression[])`,
    IF: `function IF(fc, tableRange, logicalExpression)`,
    __IF: `function __IF(fc, tableRange, logicalExpression)`,
    _IF: `function _IF(fc, inputRange, compiledLogicalExpression)`,
    _RANGE: `function _RANGE(fc, basicRange, startExpr, endExpr, inclusive_start?, inclusive_end?)`,
    _REDUCE: `function _REDUCE(fc, inputRange, reduceFun)`,
    SUM: `function SUM(fc, tableRange)`,
    REFERENCE_TO_COLUMN: `function REFERENCE_TO_COLUMN(fc, tableRange, required)`,
    HLOOKUP_COLUMN: `function HLOOKUP_COLUMN(fc, REFERENCE_TO_column_name, referenced_column_name, required)`,
    NUMBER_COLUMN: `function NUMBER_COLUMN(fc, required)`,
    IMAGE_COLUMN: `function IMAGE_COLUMN(fc, required)`,
    BOOLEAN_COLUMN: `function BOOLEAN_COLUMN(fc, required)`,
    DATETIME_COLUMN: `function DATETIME_COLUMN(fc, required)`,
    KEY_COLUMN: `function KEY_COLUMN(fc, scalarFormula)`,
    SUMIF: `function SUMIF(fc, tableRange, logicalExpression)`,
    COUNT: `function COUNT(fc, tableRange)`,
    COUNTIF: `function COUNTIF(fc, tableRange, logicalExpression)`,
    TEXTJOIN: `function TEXTJOIN(fc, tableRange, delimiter)`,
    RANK: `function RANK(fc, lookupExpr, tableRange)`,
    VLOOKUP: `function VLOOKUP(fc, entityRange, booleanExpr, resultExpr)`,
    TEXT: `function TEXT(fc, expr, format)`,
    ID: `function ID(fc, _id)`,
    CONCATENATE: `function CONCATENATE(fc, expr, expr2, expr3, expr4, expr5, expr6)`,
    REGEXREPLACE: `function REGEXREPLACE(fc, expr, regex, replacement)`,
    SUBSTITUTE: `function SUBSTITUTE(fc, expr, old_text, new_text)`,
    EOMONTH: `function EOMONTH(fc, expr, numMonths)`,
    SQRT: `function SQRT(fc, expr)`,
    ROUND: `function ROUND(fc, expr)`,
    FACT: `function FACT(fc, expr)`,
    HLOOKUP: `function HLOOKUP(fc, expr)`,
    FLOOR: `function FLOOR(fc, expr, significance)`,
    DATEDIF: `function DATEDIF(fc, start_date, end_date, unit)`,
    INTERSECTS: `function INTERSECTS(fc, start_date_1, end_date_1, start_date_2, end_date_2, max_interval)`,
}
