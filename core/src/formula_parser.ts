import { Expression } from "jsep";
import * as jsep from 'jsep';
import { CircularJSON } from "@domain/json-stringify";
jsep.addLiteral('@', '@');

export function parseFormula(formula: string, forceParseIncompleteExpr: boolean = false): Expression {
    return jsep.parse(formula, forceParseIncompleteExpr);
}

export class FormulaParserError {
    constructor(public node: Expression, public message: string) {}
}

export function $e2s(node: Expression, strict: boolean = false): string {
    let lP = strict ? '(' : '', rP = strict ? ')' : '';
    switch (node.type) {

        case 'ArrayExpression':
            return '[' + node.elements.map(e => $e2s(e, strict)).join(',') + ']';

        case 'BinaryExpression':
            return lP + $e2s(node.left, strict) + node.operator + $e2s(node.right, strict) + rP;

        case 'CallExpression':
            let ret: string[] = [];
            if (jsep.isIdentifier(node.callee)) ret.push(node.callee.name)
            else ret.push(lP + $e2s(node.callee, strict) + rP)
            ret.push('(');
            ret.push(node.arguments.map(a => $e2s(a, strict)).join(','));
            ret.push(')');
            return ret.join('');

        case 'ConditionalExpression':
            return lP + $e2s(node.test, strict) + rP +
                '?' + lP + $e2s(node.consequent, strict) + rP +
                ':' + lP + $e2s(node.alternate, strict) + rP;

        case 'Identifier':
            return node.name;

        case 'NumberLiteral':
            return node.raw;

        case 'StringLiteral':
            return node.raw;

        case 'Literal':
            return node.raw;

        case 'LogicalExpression':
            return lP + $e2s(node.left, strict) + node.operator + $e2s(node.right, strict) + rP;

        case 'MemberExpression':
            return (jsep.isIdentifier(node.object) ? node.object.name : lP + $e2s(node.object, strict) + rP) +
                '.' + (jsep.isIdentifier(node.property) ? node.property.name : lP + $e2s(node.property, strict) + rP)

        case 'ThisExpression':
            return 'this';

        case 'UnaryExpression':
            return lP + node.operator + $e2s(node.argument, strict) + rP;

        case 'Compound':
            throw new FormulaParserError(node, "Compound expr are not supported: " + node.origExpr);

        default:
            throw new FormulaParserError(node, "Unknown expression: " + CircularJSON.stringify(node));
    }
}
