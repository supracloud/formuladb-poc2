import * as _ from "lodash";
import { TokenType, Token, Suggestion, DEFAULT_TOKEN, FormulaTokenizer } from "@core/formula_tokenizer";
import { Pn, EntityProperty, Entity } from '@domain/metadata/entity';
import { FrmdbElementDecorator, FrmdbElementBase } from "@fe/live-dom-template/frmdb-element";
import { DataObj } from "@domain/metadata/data_obj";
import { elvis } from "@core/elvis";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { ServerEventPreviewFormula } from "@domain/event";
import { FormulaTokenizerSchemaChecker } from "@core/formula_tokenizer_schema_checker";

const HTML: string = require('raw-loader!@fe-assets/formula-editor/formula-editor.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/formula-editor/formula-editor.component.scss').default;

//TODO <!-- PREVIEW: {{formulaEditorService?.formulaState?.editedProperty?.name}} = {{formulaEditorService?.formulaState?.previewEditedDataObj? formulaEditorService?.formulaState?.previewEditedDataObj[formulaEditorService?.formulaState?.editedProperty?.name] : ''}} -->


const STYLES = [
    { bgColor: '#b6d0f988' },
    { bgColor: '#f9ccf988' },
    { bgColor: '#fcd9e188' },
    { bgColor: '#d9f9e588' },
    { bgColor: '#f5f9d988' },
];

export interface UiToken extends Token {
    caret: boolean;
    class?: string;
}

const DEFAULT_UITOKEN: UiToken = {
    ...DEFAULT_TOKEN,
    caret: false,
};

interface FormulaEditorState {
    editorDisabled: boolean;
    editorExpr: string;
    ftext: string;
    currentTokens: UiToken[];
    hasErrors: boolean;
    currentTokenAtCaret: UiToken | undefined;
    tableNameAtCaret: string | undefined;
    editorOn: boolean;
    selectedFormula: string | undefined;
    selectedProperty: EntityProperty | undefined;
    editedEntity: Entity | undefined;
    editedDataObj: DataObj | undefined;
    editedProperty: EntityProperty | undefined;
    newProperty: EntityProperty | undefined;
    previewEditedDataObj: DataObj | undefined;
    formulaHighlightedColumns: { [tableName: string]: { [columnName: string]: string } };
    currentSuggestions: Suggestion[];
    activeSuggestion: number;
}

@FrmdbElementDecorator({
    tag: 'frmdb-formula-editor',
    observedAttributes: [],
    template: HTML,
    style: CSS,
})
export class FormulaEditorComponent extends FrmdbElementBase<any, FormulaEditorState> {

    private noEditKeys: string[] = ['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'ArrowLeft', 'ArrowRight'];

    private textarea: HTMLTextAreaElement;

    editorExprHasErrors: boolean = false;

    suggestion?: (string) => string[];

    validation?: (string) => { [key: string]: number[] };

    connectedCallback() {
        // (keydown.tab)="onAutoComplete($event)" 
        // (keydown.enter)="onAutoComplete($event)" 
        // (keyup)="keyup(editor, $event)"
        // (click)="click(editor, $event)" 
        // (keydown.arrowdown)="nextSuggestion($event)" 
        // (keydown.arrowup)="prevSuggestion($event)"
    }

    frmdbPropertyChangedCallback<T extends keyof FormulaEditorState>(propName: T, oldVal: FormulaEditorState[T] | undefined, newVal: FormulaEditorState[T]): Partial<FormulaEditorState> | Promise<Partial<FormulaEditorState>> {
        if (propName === "editorOn") {
            if (oldVal && !newVal) {
                this.frmdbState.ftext = '';
            } else if (!oldVal && newVal) {
                this.debouncedOnEdit();
            }
        }
        return this.frmdbState;
    }

    cursorMove(cursorPos: number) {
        if (!this.frmdbState.currentTokens) return;
        let tokenAtCursor = this.frmdbState.currentTokens.find(x => x.pstart <= cursorPos && cursorPos <= x.pend)
        if (tokenAtCursor && tokenAtCursor.tableName && tokenAtCursor.errors.length === 0) {
            this.st.tableNameAtCaret = tokenAtCursor.tableName;
        }
    }

    get st(): FormulaEditorState {
        return this.frmdbState as FormulaEditorState;
    }

    onAutoComplete(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.st.currentTokenAtCaret && this.st.currentSuggestions && this.st.currentSuggestions.length > 0 && this.st.activeSuggestion >= 0 && this.st.activeSuggestion < this.st.currentSuggestions.length) {
            this.st.currentTokenAtCaret.value = this.st.currentSuggestions[this.st.activeSuggestion].suggestion;
            this.st.editorExpr = this.st.currentTokens.map(t => t.value).join('');
            this.st.currentSuggestions = [];
            this.st.activeSuggestion = 0;
            this.st.currentTokenAtCaret = undefined;
            this.st.tableNameAtCaret = undefined;
            this.debouncedOnEdit();
        }
    }

    keyup(event) {
        if (!this.noEditKeys.find(k => k == event.key)) {
            this.debouncedOnEdit();
        }
        else if (this.textarea.selectionStart != null) {
            this.cursorMove(this.textarea.selectionStart);
        }
    }
    click() {
        if (this.st.currentTokens.length == 0) {
            this.debouncedOnEdit();
        } else if (this.textarea.selectionStart != null) {
            this.cursorMove(this.textarea.selectionStart);
        }
    }

    private debouncedOnEdit = _.debounce(() => this.performOnEdit(), 200);
    performOnEdit(): void {
        let ftext = "";
        if (this.st.editorExpr) {
            let errors;
            if (this.validation) {
                errors = this.validation(this.st.editorExpr);
            }
            let tokens: UiToken[] = this.tokenize(this.st.editorExpr, this.textarea.selectionStart);
            console.log(tokens);
            let hasErrors: boolean = false;
            for (let i: number = 0; i < tokens.length; i++) {
                switch (tokens[i].type) {
                    case TokenType.NLINE:
                        ftext += "<br>";
                        break;
                    case TokenType.SPACE:
                        ftext += "&nbsp;";
                        break;
                    default:
                        ftext += this.renderToken(tokens[i]);
                        hasErrors = hasErrors || (tokens[i].errors && tokens[i].errors.length > 0);
                }
            }
            this.cursorMove(this.textarea.selectionStart);

            this.st.ftext = ftext;
            this.st.hasErrors = hasErrors;
            this.frmdbState.currentTokens = tokens;
            this.st.newProperty = this.getEntityPropertyFromTokens(tokens);
        }
    }

    getEntityPropertyFromTokens(tokens: UiToken[]): EntityProperty | undefined {
        for (let token of tokens) {
            if (token.errors && token.errors.length > 0) {
                return undefined;
            }
        }

        if (tokens.length <= 0) return undefined;

        if (this.st.editorExpr.indexOf(Pn.REFERENCE_TO) === 0) {
            let entityNameToken = tokens[2];
            let propertyNameToken = tokens[4];
            if (!entityNameToken) {
                tokens[0].errors.push("missing referenced table name");
                return undefined;
            }
            if (entityNameToken.type !== TokenType.TABLE_NAME) {
                tokens[0].errors.push("Expected table name but found " + entityNameToken.value + " at " + entityNameToken.pstart);
                return undefined;
            }
            if (!propertyNameToken) {
                tokens[0].errors.push("missing referenced column name of referenced table " + entityNameToken.value);
                return undefined;
            }
            if (propertyNameToken.type !== TokenType.COLUMN_NAME) {
                tokens[0].errors.push("Expected column name but found " + propertyNameToken.value + " at " + propertyNameToken.pstart);
                return undefined;
            }

            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.REFERENCE_TO,
                referencedEntityName: entityNameToken.value,
                referencedPropertyName: propertyNameToken.value,
            };
        } else {
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.FORMULA,
                formula: this.st.editorExpr,
            };
        }
    }

    nextSuggestion(event: any): void {
        if (this.st.currentSuggestions && this.st.currentSuggestions.length > 0) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.st.activeSuggestion < this.st.currentSuggestions.length - 1) {
            this.st.activeSuggestion++;
            this.debouncedOnEdit();
        }
    }

    prevSuggestion(event: any): void {
        if (this.st.currentSuggestions && this.st.currentSuggestions.length > 0) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.st.activeSuggestion > 0) {
            this.st.activeSuggestion--;
            this.debouncedOnEdit();
        }
    }

    private setSelectionRange(input: any, selectionStart: number, selectionEnd: number): void {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            let range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }

    private setCaretToPos(input: any, pos: number): void {
        this.setSelectionRange(input, pos, pos);
    }

    private buildSuggestionBox(): string {
        let re: string = "<div class='suggestion'>";
        this.st.currentSuggestions.forEach((s, i) => {
            re += "<div class='suggestion-element" + (i === this.frmdbState.activeSuggestion ? " suggestion-active" : "") + "'>";
            re += s.suggestion;
            re += "</div>";
        });
        re += "</div>";
        return re;
    }

    private buildErrorBox(errors: string[]): string {
        return "<div class='error-note-holder'><div class='error-note'>" + errors.slice(0, 1).join("</div><div class='error-note'>") + "</div></div>";
    }

    private renderToken(token: UiToken): string {
        let ret: string[] = [];
        let cls = token.class;

        this.checkTokenForErrors(token);
        let hasErrors = token.errors && token.errors.length > 0;

        ret.push("<span class='" + cls + " " + (hasErrors ? 'editor-error' : '') + "'>" + token.value + "</span>");

        if (token.caret) {
            this.st.currentSuggestions = this.getSuggestionsForToken(token);
            this.st.currentTokenAtCaret = token;
            if (this.st.currentSuggestions && this.st.currentSuggestions.length > 0) {
                ret.push(this.buildSuggestionBox());
            }
        }

        if (hasErrors && token.caret) {
            ret.push(this.buildErrorBox(token.errors));
        }

        return ret.join('');
    }

    public toggleFormulaEditor() {
        this.st.editorOn = true;
    }

    public tokenize(editorTxt: string, caretPos: number): UiToken[] {
        return this.parse(editorTxt, caretPos);
    }

    public previewFormula(formula: string) {
        if (this.st && this.st.editedEntity && this.st.editedProperty && this.st.editedDataObj) {
            BACKEND_SERVICE().putEvent(
                new ServerEventPreviewFormula(this.st.editedEntity, this.st.editedProperty.name, this.st.editedDataObj, formula));
        }
    }

    private formulaTokenizerSchemaChecker: FormulaTokenizerSchemaChecker;
    private getFormulaTokenizerSchemaChecker() {
        if (!this.formulaTokenizerSchemaChecker) {
            this.formulaTokenizerSchemaChecker = new FormulaTokenizerSchemaChecker(BACKEND_SERVICE().getFrmdbEngineTools().schemaDAO.schema);
        }
        return this.formulaTokenizerSchemaChecker;
    }

    public getSuggestionsForToken(token: Token) {
        return this.getFormulaTokenizerSchemaChecker().getSuggestionsForToken(token);
    }

    public checkTokenForErrors(token: Token) {
        this.getFormulaTokenizerSchemaChecker().checkToken(token);
    }

    private formulaTokenizer = new FormulaTokenizer();
    private parse(editorTxt: string, caretPos: number): UiToken[] {
        if (!this.st.editedEntity || !this.st.editedProperty) return [];

        let parserTokens: Token[] = this.formulaTokenizer.tokenizeAndStaticCheckFormula(this.st.editedEntity._id, this.st.editedProperty.name, editorTxt, caretPos);
        let ret: UiToken[] = [];

        let newformulaHighlightedColumns: { [tableName: string]: { [columnName: string]: string } } = {};
        let existingStyles: Set<string> = new Set();
        let todoStyleForTokens: UiToken[] = [];
        for (let token of parserTokens) {
            let uiToken: UiToken = { ...token, caret: token.pstart < caretPos && caretPos <= token.pend };
            if (token.type == TokenType.COLUMN_NAME) {
                let tableName = token.tableName;
                let columnName = token.columnName;
                if (tableName && columnName) {
                    newformulaHighlightedColumns[tableName] = newformulaHighlightedColumns[tableName] || {};
                    if (this.st.formulaHighlightedColumns[tableName] && this.st.formulaHighlightedColumns[tableName][columnName]) {
                        newformulaHighlightedColumns[tableName][columnName] = this.st.formulaHighlightedColumns[tableName][columnName];
                        existingStyles.add(newformulaHighlightedColumns[tableName][columnName]);
                        uiToken.class = this.st.formulaHighlightedColumns[tableName][columnName].replace(/^#/, 'c_');
                    } else {
                        todoStyleForTokens.push(uiToken);
                    }
                }
            }
            ret.push(uiToken);
        }

        this.frmdbState.formulaHighlightedColumns = newformulaHighlightedColumns;
        for (let uiToken of todoStyleForTokens) {
            for (let style of STYLES) {
                if (existingStyles.has(style.bgColor)) continue;
                existingStyles.add(style.bgColor);
                let tableName = uiToken.tableName;
                let columnName = uiToken.columnName;
                if (tableName && columnName) {
                    this.frmdbState.formulaHighlightedColumns[tableName][columnName] = style.bgColor;
                    uiToken.class = style.bgColor.replace(/^#/, 'c_');
                }
                break;
            }
        }

        return ret;
    }

}

export function queryFormulaEditor(el: Document | HTMLElement): FormulaEditorComponent {
    let formulaEditor: FormulaEditorComponent =  el.querySelector('frmdb-formula-editor') as FormulaEditorComponent;
    if (!formulaEditor) throw new Error("formula editor not found");
    return formulaEditor;
}
