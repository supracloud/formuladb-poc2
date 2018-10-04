/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from "lodash";
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
} from "./domain/metadata/execution_plan";
import { PickNonReservedProperties } from "./domain/base_obj";
import { FuncCommon, FormulaCompilerContextType, compileExpression, $s2e, getViewName } from "./formula_compiler";
import { _throw } from "./throw";

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
    if (!validArg) throw new Error("Expected " + validatorFunctions.map(f => f.name).join('|') + "but found " + value.origExpr)

    let ret = compileExpression(value, context, requestedRetType);
    if (!outValidator(ret)) throw new Error("Compilation failed for argument " + value.origExpr + "; expected " + outValidator.name + " but found " + ret.type_ + "; " + JSON.stringify(ret, null, 4));
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
    if (!validArg) throw new Error("Expected " + validatorFunctions.map(f => f.name).join('|') + "but found " + value.origExpr)

    let ret = compileExpression(value, context, requestedRetType);
    return ret;
}


function checkMandatoryArg<T>(fc: FuncCommon, name: string, arg: T | undefined): T {
    if (!arg) throw new Error("Mandatory parameter " + name + " missing for " + fc.funcExpr.origExpr);
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
            entityName: fullTableRange.name,
            valueExpr: ce.rawExpr,
            has$Identifier: ce.has$Identifier,
            hasNon$Identifier: ce.hasNon$Identifier,
        };
    } else throw new Error("Expected identifier but found " + JSON.stringify(fullTableRange));
}

function _MAP_KEY(fc: FuncCommon, fullTableRange: Identifier, keyExpr: Expression): MapKey {
    let ce = compileArg(fc, 'expr', keyExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (isIdentifier(fullTableRange)) {
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityName: fullTableRange.name,
            keyExpr: [ce.rawExpr],
            has$Identifier: ce.has$Identifier,
            hasNon$Identifier: ce.hasNon$Identifier,
        };
    } else throw new Error("Expected identifier but found " + JSON.stringify(fullTableRange));
}

function _MAP(fc: FuncCommon, basicRange: Identifier | MemberExpression | CallExpression, keyExpr: Expression, valueExpr?: Expression): MapKey | MapFunction {
    let inputRange = compileArgNV(fc, 'basicRange', basicRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let cKey = compileArg(fc, 'expr', keyExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (cKey.has$Identifier) throw new Error("$ROW$ is not allowed in lookup key expressions: " + fc.funcExpr.origExpr);
    if (valueExpr) {
        let cVal = compileArg(fc, 'expr', valueExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
        if (cVal.has$Identifier) throw new Error("$ROW$ is not allowed in map value expressions: " + fc.funcExpr.origExpr);
    }

    if (isIdentifier(basicRange)) {
        if (!isCompiledScalar(inputRange)) throw new Error("Expected Identifier but found " + JSON.stringify(inputRange) + " for " + basicRange.origExpr);
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityName: basicRange.name,
            keyExpr: isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr],
            has$Identifier: inputRange.has$Identifier,
            hasNon$Identifier: inputRange.hasNon$Identifier,
        };
    } else if (isMapValue(inputRange)) {
        if (valueExpr) throw new Error("Value expression already provided: " + fc.funcExpr.origExpr);
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityName: inputRange.entityName,
            keyExpr: isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr],
            valueExpr: inputRange.valueExpr,
        };
    } else if (isMapFunction(inputRange)) {
        if (valueExpr) throw new Error("Map value expression already provided: " + fc.funcExpr.origExpr);
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityName: inputRange.entityName,
            keyExpr: inputRange.keyExpr.concat(isArrayExpression(keyExpr) ? keyExpr.elements : [keyExpr]),
            valueExpr: inputRange.valueExpr,
        };
    } else throw new Error("GROUP_BY expects MapValue or MapFunction but received " + basicRange.origExpr);
}

function GROUP_BY(fc: FuncCommon, basicRange: Identifier | MemberExpression | CallExpression, ...groupExpr: Expression[]): MapKey | MapFunction {
    let inputRange = compileArgNV(fc, 'basicRange', basicRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let compiledGroupExpr = groupExpr.map((ge, idx) =>
        compileArg(fc, 'groupExpr' + idx, ge, [isExpression], fc.context, CompiledScalarN, isCompiledScalar));

    if (isIdentifier(basicRange)) {
        if (!isCompiledScalar(inputRange)) throw new Error("Expected Identifier but found " + JSON.stringify(inputRange) + " for " + basicRange.origExpr);
        return {
            type_: MapKeyN,
            rawExpr: fc.funcExpr,
            entityName: basicRange.name,
            keyExpr: compiledGroupExpr.map(cg => cg.rawExpr),
            has$Identifier: inputRange.has$Identifier,
            hasNon$Identifier: inputRange.hasNon$Identifier,
        };
    } else if (isMapValue(inputRange)) {
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityName: inputRange.entityName,
            keyExpr: compiledGroupExpr.map(cg => cg.rawExpr),
            valueExpr: inputRange.valueExpr,
        };
    } else if (isMapFunction(inputRange)) {
        return {
            type_: MapFunctionN,
            rawExpr: fc.funcExpr,
            entityName: inputRange.entityName,
            keyExpr: inputRange.keyExpr.concat(compiledGroupExpr.map(cg => cg.rawExpr)),
            valueExpr: inputRange.valueExpr,
        };
    } else throw new Error("GROUP_BY expects MapValue or MapFunction but received " + basicRange.origExpr);
}
function IF(fc: FuncCommon, tableRange: Identifier | MemberExpression | CallExpression, logicalExpression: LogicalExpression | BinaryExpression): MapReduceKeysAndQueries | MapReduceKeysQueriesAndValue {
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    return _IF(fc, inputRange, compiledLogicalExpression);
}
function __IF(fc: FuncCommon, tableRange: Identifier | MemberExpression | CallExpression, logicalExpression: LogicalExpression | BinaryExpression): [ExecPlanCompiledExpression, MapReduceKeysAndQueries] {
    let inputRange = compileArgNV(fc, 'basicRange', tableRange, [isIdentifier, isMemberExpression], fc.context, MapFunctionN);
    let compiledLogicalExpression = compileArg(fc, 'logicalExpression', logicalExpression, [isLogicalExpression, isBinaryExpression], fc.context, MapReduceKeysAndQueriesN, isMapReduceKeysAndQueries);
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
                    entityName: inputRange.entityName,
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
                entityName: includesMapKey(inputRange) ? inputRange.entityName : _throw("IF Expected MapKey but found ", inputRange),
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
    if (!includesMapKey(inputRange)) throw new Error("basicRange is expected to have lookup keys: " + basicRange.origExpr + "; " + JSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
    if (!includesMapValue(inputRange)) throw new Error("basicRange is expected to have a selected column or computed value: " + basicRange.origExpr + "; " + JSON.stringify(inputRange) + ". Context: " + fc.funcExpr.origExpr);
    let compiledStartExpr = compileArg(fc, 'start', startExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(compiledStartExpr) || !compiledStartExpr.has$Identifier || compiledStartExpr.hasNon$Identifier)
        throw new Error("RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + startExpr.origExpr + "; " + JSON.stringify(compiledStartExpr, null, 4));
    let compiledEndExpr = compileArg(fc, 'end', endExpr, [isExpression], fc.context, CompiledScalarN, isCompiledScalar);
    if (!isCompiledScalar(compiledEndExpr) || !compiledEndExpr.has$Identifier || compiledEndExpr.hasNon$Identifier)
        throw new Error("RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + endExpr.origExpr + "; " + JSON.stringify(compiledEndExpr, null, 4));

    return {
        type_: MapFunctionAndQueryN,
        rawExpr: fc.funcExpr,
        entityName: inputRange.entityName,
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

function _REDUCE(fc: FuncCommon, inputRange: MapValue | MapFunction | MapFunctionAndQuery | MapReduceKeysQueriesAndValue, reduceFun: string): MapReduceTrigger {
    if (isMapReduceKeysQueriesAndValue(inputRange)) {
        return {
            type_: MapReduceTriggerN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                aggsViewName: getViewName(true, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName, fc.funcExpr),
                map: {
                    ...inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map,
                },
                reduceFun: reduceFun,
            },
            mapObserversImpactedByOneObservable: {
                obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
                entityName: fc.context.targetEntityName,
                ...inputRange.mapObserversImpactedByOneObservable,
                valueExpr: $s2e(`_id`),
            }
        };
    } else {
        return {
            type_: MapReduceTriggerN,
            rawExpr: fc.funcExpr,
            mapreduceAggsOfManyObservablesQueryableFromOneObs: {
                aggsViewName: getViewName(true, inputRange.entityName, fc.funcExpr),
                map: {
                    entityName: inputRange.entityName,
                    keyExpr: isMapValue(inputRange) ? [$s2e(`_id`)] : inputRange.keyExpr,
                    valueExpr: inputRange.valueExpr,
                    query: includesMapFunctionAndQuery(inputRange) ? inputRange.query : {
                        startkeyExpr: [$s2e(`''`)],
                        endkeyExpr: [$s2e(`'ZZZZZ'`)],
                        inclusive_start: false,
                        inclusive_end: false,
                    }
                },
                reduceFun: reduceFun,
            },
            mapObserversImpactedByOneObservable: {
                obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
                entityName: fc.context.targetEntityName,
                keyExpr: [$s2e(`_id`)],
                valueExpr: $s2e(`_id`),
                query: {
                    startkeyExpr: [$s2e(`''`)],
                    endkeyExpr: [$s2e(`'ZZZZZ'`)],
                    inclusive_start: false,
                    inclusive_end: false,
                }
            }
        };
    }
}

function SUM(fc: FuncCommon, tableRange: MemberExpression | CallExpression): MapReduceTrigger {
    let inputRange = compileArg(fc, 'basicRange', tableRange, [isMemberExpression, isCallExpression], fc.context, MapReduceKeysQueriesAndValueN, isMapReduceKeysQueriesAndValue);
    return _REDUCE(fc, inputRange, '_sum');
}

function SUMIF(fc: FuncCommon, tableRange: MemberExpression | CallExpression, logicalExpression: BinaryExpression | LogicalExpression): MapReduceTrigger {
    let [inputRange, compiledLogicalExpression] = __IF(fc, tableRange, logicalExpression);
    let range = _IF(fc, inputRange, compiledLogicalExpression);
    if (!isMapReduceKeysQueriesAndValue(range)) throw new Error("SUMIF expects a value to sum at " + fc.funcExpr.origExpr);
    return _REDUCE(fc, range, '_sum');
}
function COUNT(fc: FuncCommon, entityRange) {
}
function COUNTIF(fc: FuncCommon, entityRange, booleanExpr) {
}
function TEXTJOIN(fc: FuncCommon, tableRange: Expression, delimiter: StringLiteral): MapReduceTrigger {
    let inputRange = compileArg(fc, 'tableRange', tableRange, [isExpression], fc.context, MapReduceKeysQueriesAndValueN, isMapReduceKeysQueriesAndValue);
    
    return {
        ...inputRange,
        type_: MapReduceTriggerN,
        mapObserversImpactedByOneObservable: {
            ...inputRange.mapObserversImpactedByOneObservable,
            obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
            valueExpr: $s2e(`_id`),
            entityName: fc.context.targetEntityName,
        },
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName, fc.funcExpr),
            map: {
                entityName: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.entityName,
                keyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.keyExpr
                    .concat(inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr),
                valueExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.valueExpr,
                query: {
                    startkeyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.startkeyExpr
                        .concat($s2e(`null`)),
                    endkeyExpr: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.endkeyExpr
                        .concat($s2e(`"ZZZZZ"`)),
                    inclusive_start: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_start,
                    inclusive_end: inputRange.mapreduceAggsOfManyObservablesQueryableFromOneObs.map.query.inclusive_end,
                }
            },
            reduceFun: function _textjoin(keys, values, rereduce) {
                var delim = '__DELIMITER__';
                return values.join(delim);
            }.toString().replace(/__DELIMITER__/, delimiter.value),
            reduceMetadata: {delimiter: delimiter.value},
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
        throw new Error("RANK expects lookup expression to be a scalar expression (using $ as the current table row) " + lookupExpr.origExpr + "; " + JSON.stringify(compiledLookupExpr, null, 4));
    let inputRange = compileArg(fc, 'tableRange', tableRange, [isExpression], fc.context, MapFunctionN, isMapFunction);
    
    return {
        type_: MapReduceTriggerN,
        rawExpr: fc.funcExpr,
        mapreduceAggsOfManyObservablesQueryableFromOneObs: {
            aggsViewName: getViewName(true, inputRange.entityName, fc.funcExpr),
            map: {
                entityName: inputRange.entityName || _throw("RANK table range missing table name: " + tableRange.origExpr + "; " + JSON.stringify(inputRange)),
                keyExpr: inputRange.keyExpr,
                valueExpr: $s2e(`1`),
                query: {
                    startkeyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements.slice(0, -1).concat($s2e(`null`)) : [$s2e(`null`)],
                    endkeyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements : [lookupExpr],
                    inclusive_start: false,
                    inclusive_end: true,
                }
            },
            reduceFun: '_count',
        },
        mapObserversImpactedByOneObservable: {
            obsViewName: getViewName(false, fc.context.targetEntityName, fc.funcExpr),
            entityName: fc.context.targetEntityName,
            keyExpr: isArrayExpression(lookupExpr) ? lookupExpr.elements : [lookupExpr],
            valueExpr: $s2e(`_id`),
            query: {
                startkeyExpr: inputRange.keyExpr.slice(0, -1),
                endkeyExpr: inputRange.keyExpr.slice(0, -1).concat($s2e(`"ZZZZZ"`)),
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
    if (!isCallExpression(fc.funcExpr)) throw new Error("Expected function call expression but found " + JSON.stringify(fc.funcExpr));
    let evalledArs: CompiledScalar[] = args.map(arg => {
        if (!isExpression(arg)) throw new Error("Unexpected function arg " + JSON.stringify(arg) + '; ' + JSON.stringify(fc.funcExpr));
        let ret = compileExpression(arg, fc.context, CompiledScalarN);
        if (!isCompiledScalar(ret)) throw new Error("Arguments of scalar functions must be scalar expressions at " + JSON.stringify(arg) + '; ' + JSON.stringify(fc.funcExpr));
        if (!isExpression(ret.rawExpr)) throw new Error("Arguments of scalar functions must be scalar expressions " + JSON.stringify(arg) + '; ' + JSON.stringify(fc.funcExpr));
        return ret;
    });

    return {
        type_: CompiledScalarN,
        rawExpr: {
            ...fc.funcExpr,
            arguments: evalledArs.map(a => a.rawExpr) as Expression[],
        },
        has$Identifier: evalledArs.reduce((prev, current) => prev || current.has$Identifier, false),
        hasNon$Identifier: evalledArs.reduce((prev, current) => prev || current.hasNon$Identifier, false),
    };
}

function TEXT(fc: FuncCommon, expr: Expression, format: StringLiteral): CompiledScalar {
    return compileScalarFunction.apply(null, arguments);
}
function REGEXREPLACE(fc: FuncCommon, expr: Expression, regex: StringLiteral, replacement: Expression): CompiledScalar {
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

export const ScalarFunctions = {
    TEXT: TEXT,
    REGEXREPLACE: REGEXREPLACE,
    EOMONTH: EOMONTH,
    SQRT: SQRT,
    ROUND: ROUND,
    FACT: FACT,
    HLOOKUP: HLOOKUP,
    FLOOR: FLOOR,
}
