import { Expression, isIdentifier, isLiteral } from 'jsep';
import { compileFormula } from './formula_compiler';


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
    public errors: string[] = [];
    private tableName: string | undefined;
    private columnName: string | undefined;

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
    public withTableName(tableName: string | undefined) {
        this.tableName = tableName;
        return this;
    }
    public withColumnName(columnName: string) {
        this.columnName = columnName;
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
    public getTableName() {return this.tableName;}
    public getColumnName() {return this.columnName;}

}

export class FormulaTokenizer {

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

    public tokenizeAndStaticCheckFormula(targetEntityName: string, propJsPath: string, formulaStr: string): Token[] {
        let ast = compileFormula(targetEntityName, propJsPath, formulaStr, true).rawExpr;
        
        //TODO: cross-check with Schema that tables and colums actually exist

        return this.walkAST(ast, {targetEntityName: targetEntityName});
    }
    private walkAST(node: Expression, context: {targetEntityName: string}): Token[] {
        let ret: Token[] = [];
        switch (node.type) {

            case 'ArrayExpression':
                return [this.punctuationToken(node.startIndex, '[', context)]
                    .concat(node.elements.reduce((arr, e) => arr.concat(this.walkAST(e, context)), [] as Token[]))
                    .concat(this.punctuationToken(node.endIndex - 1, ']', context));

            case 'BinaryExpression':
                return this.walkAST(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, ' ' + node.operator + ' ', context))
                    .concat(this.walkAST(node.right, context));

            case 'CallExpression':
                ret = [];
                if (isIdentifier(node.callee)) {
                    ret.push(this.expr2token(TokenType.FUNCTION_NAME, node.callee, context));
                } else {
                    ret.push.apply(ret, this.walkAST(node.callee, context));
                }
                ret.push(this.punctuationToken(node.callee.endIndex, '(', context));
                let endParanthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
                for (var i = 0; i < node.arguments.length; i++) {
                    ret = [...ret, ...this.walkAST(node.arguments[i], context)];
                    if (i < node.arguments.length - 1) ret.push(this.punctuationToken(node.endIndex, ', ', context));
                }
                ret.push(this.punctuationToken(endParanthesisPos, ')', context));
                return ret;

            case 'ConditionalExpression':
                return this.walkAST(node.test, context)
                    .concat(this.walkAST(node.consequent, context))
                    .concat(this.walkAST(node.alternate, context))
                    ;

            case 'Identifier':
                return [this.expr2token(TokenType.COLUMN_NAME, node, context)
                    .withTableName(node.parent || context.targetEntityName)
                    .withColumnName(node.name)];

            case 'NumberLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'StringLiteral':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'Literal':
                return [this.expr2token(TokenType.LITERAL, node, context)];

            case 'LogicalExpression':
                return this.walkAST(node.left, context)
                    .concat(this.punctuationToken(node.left.endIndex, node.operator, context))
                    .concat(this.walkAST(node.right, context));

            case 'MemberExpression':
                ret = [];
                let tableName;
                if (isLiteral(node.object) && node.object.raw === '@') {
                    if (!isIdentifier(node.property)) throw new Error("Computed MemberExpression is not allowed at " + node.origExpr);
                    ret.push(this.expr2token(TokenType.COLUMN_NAME, node, context)
                    .withTableName(context.targetEntityName)
                    .withColumnName(node.property.name));

                } else {
                    if (isIdentifier(node.object)) {
                        tableName = node.object.name;
                        ret.push(this.expr2token(TokenType.TABLE_NAME, node.object, context)
                            .withTableName(tableName));
                    } else {
                        ret.push.apply(ret, this.walkAST(node.object, context));
                    }
                    if (isIdentifier(node.property)) {
                        ret.push(this.punctuationToken(node.endIndex, '.', context));
                        ret.push(this.expr2token(TokenType.COLUMN_NAME, node.property, context)
                            .withTableName(tableName)
                            .withColumnName(node.property.name));
                    } else {
                        ret.push(this.punctuationToken(node.endIndex, '.', context));
                        ret.push.apply(ret, this.walkAST(node.property, context));
                    }
                }
                return ret;

            case 'ThisExpression':
                return [];

            case 'UnaryExpression':
                return [this.punctuationToken(node.argument.startIndex - 1, node.operator, context)]
                    .concat(this.walkAST(node.argument, context));

            case 'Compound':
                throw new Error("Compound expr are not supported: " + node.origExpr);

            default:
                throw new Error("Unknown expression: " + JSON.stringify(node));
        }
    }

}
