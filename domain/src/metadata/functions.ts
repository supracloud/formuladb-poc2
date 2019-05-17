/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import {
    Expression, LogicalExpression, StringLiteral, NumberLiteral, isExpression,
    isMemberExpression, isCallExpression, BinaryExpression, CallExpression, MemberExpression,
    Identifier, isIdentifier, ArrayExpression, isLogicalExpression, isBinaryExpression, Literal
} from "jsep";



function f2s(f: (...args) => any, ...args): string {
    if (args.length == 0) return f.name;
    return f.name + '(' + args.join(',') + ')';
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// map functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _MAP_VALUE(fullTableRange: string | Identifier, valueExpr: string | Expression): string { return f2s(_MAP_VALUE, fullTableRange, valueExpr); }
function _MAP_KEY(fullTableRange: string | Identifier, keyExpr: string | Expression): string { return f2s(_MAP_KEY, fullTableRange, keyExpr); }
function _MAP(fullTableRange: string | Identifier, keyExpr, valueExpr?: string | Expression): string { return valueExpr != null ? f2s(_MAP, fullTableRange, keyExpr, valueExpr) : f2s(_MAP, fullTableRange, keyExpr); }
function GROUP_BY(basicRange: string | Identifier | MemberExpression | CallExpression, ...groupExpr: (string | Expression)[]): string { return f2s(GROUP_BY, basicRange, ...groupExpr); }
function IF(tableRange: string | Identifier | MemberExpression | CallExpression, logicalExpression: string | LogicalExpression | BinaryExpression): string { return f2s(IF, tableRange, logicalExpression); }
function _RANGE(tableRange: string | Identifier | MemberExpression | CallExpression, start: string | Expression, end: string | Expression): string { return f2s(_RANGE, tableRange, start, end); }
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

function SUM(tableRange: string | MemberExpression | CallExpression): string { return f2s(SUM, tableRange); }
function SUMIF(tableRange: string | MemberExpression | CallExpression, logicalExpression: string | BinaryExpression | LogicalExpression): string { return f2s(SUMIF, tableRange, logicalExpression); }
function COUNT(tableRange): string { return f2s(COUNT, tableRange); }
function COUNTIF(tableRange, booleanExpr): string { return f2s(COUNTIF, tableRange, booleanExpr); }
function TEXTJOIN(tableRange, delimiter): string { return f2s(TEXTJOIN, tableRange, delimiter); }

//== Lookup functions ==============================================================================================================
/**
 * 
 * @param value expr to search for
 * @param data [GROUP_KEY, RANGE_KEY]
 * @param isAscending 
 */
function RANK(value: string | Expression, data: string | CallExpression, isAscending?: string | Literal): string { return isAscending != null ? f2s(RANK, value, data, isAscending) : f2s(RANK, value, data); }
function VLOOKUP(tableRange, booleanExpr, resultExpr): string { return f2s(VLOOKUP, booleanExpr, resultExpr); }

export const MapReduceFunctionsN = {
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
function TEXT(expr: string | Expression, format: string | StringLiteral): string { return f2s(TEXT, expr, format); }
function REGEXREPLACE(expr: string | Expression, regex: string | StringLiteral, replacement: string | Expression): string { return f2s(REGEXREPLACE, expr, regex, replacement); }
function EOMONTH(expr: string | Expression, numMonths: string | NumberLiteral): string { return f2s(EOMONTH, expr, numMonths); }
function SQRT(expr: string | Expression): string { return f2s(SQRT, expr); }
function ROUND(expr: string | Expression): string { return f2s(ROUND, expr); }
function FACT(expr: string | Expression): string { return f2s(FACT, expr); }
function HLOOKUP(expr: string | Expression): string { return f2s(HLOOKUP, expr); }
function FLOOR(expr: string, significance: string): string { return f2s(FLOOR, expr, significance); }

export const Fn = {
    GROUP_BY: GROUP_BY,
    _MAP: _MAP,
    _RANGE: _RANGE,
    IF: IF,
    SUM: SUM,
    SUMIF: SUMIF,
    COUNT: COUNT,
    COUNTIF: COUNTIF,
    TEXTJOIN: TEXTJOIN,
    RANK: RANK,
    VLOOKUP: VLOOKUP,
    TEXT: TEXT,
    REGEXREPLACE: REGEXREPLACE,
    EOMONTH: EOMONTH,
    SQRT: SQRT,
    ROUND: ROUND,
    FACT: FACT,
    HLOOKUP: HLOOKUP,
    FLOOR: FLOOR,
}
