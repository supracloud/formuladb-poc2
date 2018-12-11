import * as jsep from 'jsep';
jsep.addLiteral('@', '@');

import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import { Expression, isIdentifier } from 'jsep';


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

export class Token {

    private pstart: number = 0;
    private pend: number = 0;
    private type: TokenType = TokenType.NONE;
    private value: string;
    private errors: string[] = [];

    public withType(type: TokenType): Token {
        this.type = type;
        return this;
    }

    public withStartPos(p: number): Token {
        this.pstart = p;
        return this;
    }

    public withEndPos(p: number): Token {
        this.pend = p;
        return this;
    }

    public withValue(v: string): Token {
        this.value = v;
        return this;
    }

    public withErrors(errors: { [key: string]: number[] }): Token {
        if (errors) {
            for (var k in errors) {
                if (this.pstart < errors[k][1] && this.pend > errors[k][0] && !this.errors.some(e => e === k)) {
                    this.errors.push(k);
                }
            }
        }
        return this;
    }

    public getType(): TokenType {
        return this.type;
    }

    public append(t: string): void {
        if (!this.value) {
            this.value = t;
        } else {
            this.value += t;
        }
    }

    public getValue(): string {
        return this.value;
    }

    public getErrors(): string[] {
        return this.errors;
    }
    public getStartPos() {
        return this.pstart;
    }
    public getEndPos() {
        return this.pend;
    }

}

export class FormulaStaticTypeChecker {

    public tokenize(editorTxt: string, caretPos: number): Token[] {
        let expr = jsep(editorTxt, true);
        let ret = this.parse(expr, caretPos);
        return ret;
    }

    private expr2token(type: TokenType, node: Expression, context: {}): Token {
        return new Token().withType(type)
            .withStartPos(node.startIndex)
            .withEndPos(node.endIndex)
            .withValue(node.origExpr);
    }
    private punctuationToken(startPos: number, token: string, context: {}): Token {
        return new Token().withType(TokenType.PUNCTUATION)
            .withStartPos(startPos)
            .withEndPos(startPos + token.length)
            .withValue(token);
    }

    public tokenizeAndStaticCheckFormula(formulaStr: string): Token[] {
        return this.parse(jsep(formulaStr), 0);
    }
    private parse(node: Expression, context: {}): Token[] {
        let ret: Token[] = [];
        switch (node.type) {

            case 'ArrayExpression':
                return [this.punctuationToken(node.startIndex, '[', context)]
                    .concat(node.elements.reduce((arr, e) => arr.concat(this.parse(e, context)), [] as Token[]))
                    .concat(this.punctuationToken(node.endIndex - 1, ']', context));

            case 'BinaryExpression':
                return this.parse(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, ' ' + node.operator + ' ', context))
                    .concat(this.parse(node.right, context));

            case 'CallExpression':
                ret = [];
                if (isIdentifier(node.callee)) {
                    ret.push(this.expr2token(TokenType.FUNCTION_NAME, node.callee, context));
                } else {
                    ret.push.apply(ret, this.parse(node.callee, context));
                }
                ret.push(this.punctuationToken(node.callee.endIndex, '(', context));
                let endParanthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
                for (var i = 0; i < node.arguments.length; i++) {
                    ret = [...ret, ...this.parse(node.arguments[i], context)];
                    if (i < node.arguments.length - 1) ret.push(this.punctuationToken(node.endIndex, ', ', context));
                }
                ret.push(this.punctuationToken(endParanthesisPos, ')', context));
                return ret;

            case 'ConditionalExpression':
                return this.parse(node.test, context)
                    .concat(this.parse(node.consequent, context))
                    .concat(this.parse(node.alternate, context))
                    ;

            case 'Identifier':
                return [this.expr2token(TokenType.NONE, node, context)];

            case 'NumberLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'StringLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'Literal':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'LogicalExpression':
                return this.parse(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, node.operator, context))
                    .concat(this.parse(node.right, context));

            case 'MemberExpression':
                ret = [];
                if (isIdentifier(node.object)) {
                    ret.push(this.expr2token(TokenType.TABLE_NAME, node.object, context));
                } else {
                    ret.push.apply(ret, this.parse(node.object, context));
                }
                if (isIdentifier(node.property)) {
                    ret.push(this.punctuationToken(node.endIndex, '.', context));
                    ret.push(this.expr2token(TokenType.COLUMN_NAME, node.property, context));
                } else {
                    ret.push(this.punctuationToken(node.endIndex, '.', context));
                    ret.push.apply(ret, this.parse(node.property, context));
                }

                return ret;

            case 'ThisExpression':
                return [];

            case 'UnaryExpression':
                return [this.punctuationToken(node.argument.startIndex - 1, node.operator, context)]
                    .concat(this.parse(node.argument, context));

            case 'Compound':
                throw new Error("Compound expr are not supported: " + node.origExpr);

            default:
                throw new Error("Unknown expression: " + JSON.stringify(node));
        }
    }

}
