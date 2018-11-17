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

    private caret: boolean = false;
    private pstart: number = 0;
    private pend: number = 0;
    private type: TokenType = TokenType.NONE;
    private color: string | undefined;
    private value: string;
    private errors: string[] = [];

    public withType(type: TokenType): Token {
        this.type = type;
        return this;
    }

    public withCaret(c: boolean): Token {
        if (!this.caret) {
            this.caret = c;
        }
        return this;
    }

    public withColor(c: string): Token {
        this.color = c;
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

    public isCaret(): boolean {
        return this.caret;
    }

    public getType(): TokenType {
        return this.type;
    }
    public getColor(): string | undefined {
        return this.color;
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

}