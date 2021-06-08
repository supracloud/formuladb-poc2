import { Identifier, CallExpression, Expression, isCallExpression, isIdentifier, BinaryExpression, isBinaryExpression, isExpression, isCompound, isMemberExpression, isNumberLiteral, isStringLiteral, isLiteral, isThisExpression, isUnaryExpression, isLogicalExpression, isConditionalExpression, isArrayExpression } from "jsep";
import { Entity, EntityProperty } from "./entity";
import { Schema } from "js-yaml";
import { AstNodeReturnTypes, types2str } from "./types";
import { PickOmit } from "@domain/ts-utils";

enum BooleanFunctionsN {
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    INTERSECTS = "INTERSECTS",
}

export interface BooleanCallExpressionCallee extends Identifier {
    type: 'Identifier';
    name: BooleanFunctionsN;
}
export interface BooleanCallExpression extends CallExpression {
    callee: BooleanCallExpressionCallee;
}
export function isBooleanCallExpression(expr: Expression): expr is BooleanCallExpression {
    return isCallExpression(expr) && isIdentifier(expr.callee) && Object.keys(BooleanFunctionsN).includes(expr.callee.name as any);
}

export const LogicalBinaryOperatorConst = {
    '=' : '=',
    '!=' : '!=',
    '<' : '<',
    '<=' : '<=',
    '>' : '>',
    '>=' : '>=',
}
export type LogicalBinaryOperator = keyof typeof LogicalBinaryOperatorConst;
const logicalOperators = Object.keys(LogicalBinaryOperatorConst);
export interface BooleanBinaryExpression extends BinaryExpression {
    operator: LogicalBinaryOperator;
}
export function isBooleanBinaryExpression(expr: Expression): expr is BooleanBinaryExpression {
    return isBinaryExpression(expr) && logicalOperators.includes(expr.operator as any);
}

export enum ArithmeticBinaryOperator {
    '+' = '+',
    '-' = '-',
    '*' = '*',
    '/' = '/',
    '%' = '%',
}
const arithmeticOperators = Object.values(ArithmeticBinaryOperator);
export interface ArithmeticBinaryExpression extends BinaryExpression {
    operator: ArithmeticBinaryOperator;
}
export function isArithmeticBinaryExpression(expr: Expression): expr is ArithmeticBinaryExpression {
    return isBinaryExpression(expr) && arithmeticOperators.includes(expr.operator as any);
}

export type ExpressionWithReturn = PickOmit<Expression, 'returnType'> & { returnType: {
    types: AstNodeReturnTypes[],
    dependsOn_: {entity: Entity, property: EntityProperty}[];
}}
export function isExpressionWithReturn(param): param is ExpressionWithReturn {
    return isExpression(param);
}
export function astNodeReturnType(astNode: Expression): ExpressionWithReturn['returnType'] {
    let ret = astNode.returnType as ExpressionWithReturn['returnType'];
    if (!ret) {
        ret = {
            types: [],
            dependsOn_: [],
        };
        astNode.returnType = ret;
    }
    return ret;
}
export function astNodeWithRetType(astNode: Expression): ExpressionWithReturn {
    astNodeReturnType(astNode);
    return astNode;
}
export function astNodeReturnTypeStr(astNode: ExpressionWithReturn): string {
    return types2str(astNode.returnType.types);
}

export interface ExpressionValidator {
    typeValidator(expr: Expression): boolean;
} 
export const ExpressionValidators: {[exprClassName: string]: ExpressionValidator} = {
    'Expression': { typeValidator: isExpression },
    'Compound': { typeValidator: isCompound },
    'Identifier': { typeValidator: isIdentifier },
    'MemberExpression': { typeValidator: isMemberExpression },
    'NumberLiteral': { typeValidator: isNumberLiteral },
    'StringLiteral': { typeValidator: isStringLiteral },
    'Literal': { typeValidator: isLiteral },
    'ThisExpression': { typeValidator: isThisExpression },
    'CallExpression': { typeValidator: isCallExpression },
    'BooleanCallExpression': { typeValidator: isBooleanCallExpression },
    'UnaryExpression': { typeValidator: isUnaryExpression },
    'BinaryExpression': { typeValidator: isBinaryExpression },
    'BooleanBinaryExpression': { typeValidator: isBooleanBinaryExpression },
    'LogicalExpression': { typeValidator: isLogicalExpression },
    'ConditionalExpression': { typeValidator: isConditionalExpression },
    'ArrayExpression': { typeValidator: isArrayExpression },
}
