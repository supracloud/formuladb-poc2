import * as _ from "lodash";
import { TokenType, Token, Suggestion, DEFAULT_TOKEN, FormulaTokenizer } from "@core/formula_tokenizer";
import { Pn, EntityProperty, Entity, ReferenceToProperty } from '@domain/metadata/entity';
import { FrmdbElementDecorator, FrmdbElementBase } from "@fe/live-dom-template/frmdb-element";
import { DataObj } from "@domain/metadata/data_obj";
import { elvis } from "@core/elvis";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { ServerEventPreviewFormula, ServerEventSetProperty } from "@domain/event";
import { FormulaTokenizerSchemaChecker } from "@core/formula_tokenizer_schema_checker";
import { KeyEvent } from "@fe/key-event";
import { onEvent, onEventChildren } from "@fe/delegated-events";

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
    currentTokenAtCaret: UiToken | undefined;
    tableNameAtCaret: string | undefined;
    editedEntity: Entity | undefined;
    editedDataObj: DataObj | undefined;
    editedProperty: EntityProperty | undefined;
    previewEditedDataObj: DataObj | undefined;
    formulaHighlightedColumns: { [tableName: string]: { [columnName: string]: string } };
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
    overlay: HTMLDivElement;
    toggleEditorBtn: HTMLButtonElement;
    applyChangesBtn: HTMLButtonElement;

    get dirty(): boolean { return this.applyChangesBtn.dataset.frmdbDirty === "true" }
    set dirty(val: boolean) { this.applyChangesBtn.dataset.frmdbDirty = '' + val }
    get hasErrors(): boolean { return this.applyChangesBtn.classList.contains("bg-danger") }
    set hasErrors(val: boolean) { 
        this.applyChangesBtn.classList.remove("bg-success");
        this.applyChangesBtn.classList.remove("bg-danger");
        if (val) {
            this.applyChangesBtn.classList.add("bg-danger");
        } else {
            this.applyChangesBtn.classList.add("bg-success");
        }
    }

    currentTokens: UiToken[];
    currentSuggestions: Suggestion[];
    activeSuggestion: number;

    suggestion?: (string) => string[];

    validation?: (string) => { [key: string]: number[] };
    
    connectedCallback() {
        this.textarea = this.elem.querySelector('textarea') as HTMLTextAreaElement;
        this.overlay = this.elem.querySelector('.editor-formatted-overlay') as HTMLDivElement;
        this.toggleEditorBtn = this.elem.querySelector('#toggle-formula-editor') as HTMLButtonElement;
        this.applyChangesBtn = this.elem.querySelector('#apply-formula-changes') as HTMLButtonElement;

        this.textarea.addEventListener('keydown', e => this.keydown(e));
        this.textarea.addEventListener('keyup', e => this.keyup(e));
        onEvent(this.shadowRoot!, 'click', '.editor *', e => this.click());
        onEventChildren(this.shadowRoot!, 'click', '#toggle-formula-editor', e => this.toggleEditor());
        onEvent(this.shadowRoot!, 'click', '#apply-formula-changes:enabled *', e => this.applyChanges());
    }

    frmdbPropertyChangedCallback<T extends keyof FormulaEditorState>(propName: T, oldVal: FormulaEditorState[T] | undefined, newVal: FormulaEditorState[T]): Partial<FormulaEditorState> | Promise<Partial<FormulaEditorState>> {
        if ("editedProperty" === propName || "editedEntity" === propName) {
            let prop = this.frmdbState.editedProperty;
            this.textarea.value = prop ? (
                prop.propType_ === Pn.FORMULA ? prop.formula : prop.propType_ + '()'
            ) : 'empty type';
            this.debouncedOnEdit();
        }
        return this.frmdbState;
    }

    get editorOn() {
        return this.toggleEditorBtn.classList.contains("active");
    }
    set editorOn(val: boolean) {
        if (val) {
            this.toggleEditorBtn.classList.add("active");
            this.applyChangesBtn.disabled = false;
        } else {
            this.toggleEditorBtn.classList.remove("active");
            this.applyChangesBtn.disabled = true;
        }
        this.toggleEditorBtn.querySelector('i')!.classList.toggle("la-facebook-square");
        this.toggleEditorBtn.querySelector('i')!.classList.toggle("la-times-circle");
    }

    toggleEditor() {
        if (this.editorOn) {
            if (this.dirty && !confirm("discard changes ?")) return;
            this.editorOn = false;
            this.textarea.readOnly = true;
            this.dirty = false;
        } else {
            this.performOnEdit();
            this.dirty = false;
            this.textarea.readOnly = false;
            this.editorOn = true;
        }
    }


    applyChanges() {
        if (!this.dirty) return;
        if (!this.frmdbState.editedEntity || !this.frmdbState.editedProperty) return;
        if (this.hasErrors) {
            alert("formula has errors"); return;
        }
        let newProp = this.getEntityPropertyFromTokens(this.currentTokens);
        if (!newProp) {alert("formula has error tokens"); return;}
        if (confirm("Please confirm, apply modifications to DB ?")) {
            BACKEND_SERVICE().putEvent(new ServerEventSetProperty(this.frmdbState.editedEntity, newProp))
            .then(async (ev: ServerEventSetProperty) => {
                if (ev.state_ != 'ABORT') {
                    this.emit({type: "FrmdbColumnChanged", table: this.frmdbState.editedEntity!, newColumn: newProp!});
                } else {
                    alert(ev.notifMsg_ || ev.error_);
                }
                return ev;
            });

            this.dirty = false;
            this.toggleEditor();
        }
    }
    
    cursorMove(cursorPos: number) {
        if (!this.currentTokens) return;
        let tokenAtCursor = this.currentTokens.find(x => x.pstart <= cursorPos && cursorPos <= x.pend)
        if (tokenAtCursor && tokenAtCursor.tableName && tokenAtCursor.errors.length === 0) {
            this.st.tableNameAtCaret = tokenAtCursor.tableName;
        }
    }

    get st(): FormulaEditorState {
        return this.frmdbState as FormulaEditorState;
    }

    onAutoComplete(): void {
        if (this.st.currentTokenAtCaret && this.currentSuggestions && this.currentSuggestions.length > 0 && this.activeSuggestion >= 0 && this.activeSuggestion < this.currentSuggestions.length) {
            this.st.currentTokenAtCaret.value = this.currentSuggestions[this.activeSuggestion].suggestion;
            this.textarea.value = this.currentTokens.map(t => t.value).join('');
            this.currentSuggestions = [];
            this.activeSuggestion = 0;
            this.st.currentTokenAtCaret = undefined;
            this.st.tableNameAtCaret = undefined;
            this.debouncedOnEdit();
        }
    }

    keydown(event: KeyboardEvent) {
        if (KeyEvent.DOM_VK_UP == event.keyCode) {
            event.preventDefault();
            this.prevSuggestion(); 
        }

        if (KeyEvent.DOM_VK_DOWN == event.keyCode) {
            event.preventDefault();
            this.nextSuggestion();
        }

        if (KeyEvent.DOM_VK_ENTER == event.keyCode || KeyEvent.DOM_VK_RETURN == event.keyCode || KeyEvent.DOM_VK_TAB == event.keyCode) {
            event.preventDefault();
            this.onAutoComplete();
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
        if (this.currentTokens && this.currentTokens.length == 0) {
            this.debouncedOnEdit();
        } else if (this.textarea.selectionStart != null) {
            this.cursorMove(this.textarea.selectionStart);
        }
    }

    private debouncedOnEdit = _.debounce(() => this.performOnEdit(), 200);
    performOnEdit(): void {
        let ftext = "";
        this.dirty = true;
        let editorExpr = this.textarea.value;
        if (editorExpr) {
            let errors;
            if (this.validation) {
                errors = this.validation(editorExpr);
            }
            let tokens: UiToken[] = this.tokenize(editorExpr, this.textarea.selectionStart);
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

            this.overlay.innerHTML = ftext;
            this.hasErrors = hasErrors;
        }
    }

    getEntityPropertyFromTokens(tokens: UiToken[]): EntityProperty | undefined {
        for (let token of tokens) {
            if (token.errors && token.errors.length > 0) {
                return undefined;
            }
        }

        if (tokens.length <= 0) return undefined;

        let editorExpr = this.textarea.value;
        if (editorExpr.indexOf(Pn.REFERENCE_TO) === 0) {
            let entityNameToken = tokens[2];
            let propertyNameToken = tokens[4];
            let entityAliasToken = tokens[6];
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

            let prop: ReferenceToProperty = {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.REFERENCE_TO,
                referencedEntityName: entityNameToken.value,
                referencedPropertyName: propertyNameToken.value,
            };
            if (entityNameToken) {
                if (entityNameToken.type !== TokenType.TABLE_NAME) {
                    tokens[0].errors.push("Expected table name but found " + entityNameToken.value + " at " + entityNameToken.pstart);
                    return undefined;
                } else {
                    prop.referencedEntityAlias = entityAliasToken.value;
                }
            }
            return prop;
        } else if (editorExpr.indexOf(Pn.STRING) === 0) {
            let required: boolean | undefined = undefined;
            let requiredToken = tokens[2];
            if (requiredToken && requiredToken.value === "true") required = true;
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.STRING,
                required,
            };
        } else if (editorExpr.indexOf(Pn.NUMBER) === 0) {
            let required: boolean | undefined = undefined;
            let requiredToken = tokens[2];
            if (requiredToken && requiredToken.value === "true") required = true;
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.NUMBER,
                required,
            };
        } else if (editorExpr.indexOf(Pn.DATETIME) === 0) {
            let required: boolean | undefined = undefined;
            let requiredToken = tokens[2];
            if (requiredToken && requiredToken.value === "true") required = true;
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.DATETIME,
                required,
            };
        } else if (editorExpr.indexOf(Pn.IMAGE) === 0) {
            let required: boolean | undefined = undefined;
            let requiredToken = tokens[2];
            if (requiredToken && requiredToken.value === "true") required = true;
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.IMAGE,
                required,
            };
        } else if (editorExpr.indexOf(Pn.BOOLEAN) === 0) {
            let required: boolean | undefined = undefined;
            let requiredToken = tokens[2];
            if (requiredToken && requiredToken.value === "true") required = true;
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.BOOLEAN,
                required,
            };
        } else {
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.FORMULA,
                formula: editorExpr,
            };
        }
    }

    nextSuggestion(): void {
        if (this.activeSuggestion < this.currentSuggestions.length - 1) {
            this.activeSuggestion++;
            this.debouncedOnEdit();
        }
    }

    prevSuggestion(): void {
        if (this.activeSuggestion > 0) {
            this.activeSuggestion--;
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
        if (!this.editorOn) return '';
        let re: string = "<div class='suggestion'>";
        this.currentSuggestions.forEach((s, i) => {
            re += "<div class='suggestion-element" + (i === this.activeSuggestion ? " suggestion-active" : "") + "'>";
            re += s.suggestion;
            re += "</div>";
        });
        re += "</div>";
        return re;
    }

    private buildErrorBox(errors: string[]): string {
        if (!this.editorOn) return '';
        return "<div class='error-note-holder'><div class='error-note'>" + errors.slice(0, 1).join("</div><div class='error-note'>") + "</div></div>";
    }

    private renderToken(token: UiToken): string {
        let ret: string[] = [];
        let cls = token.class;

        this.checkTokenForErrors(token);
        let hasErrors = token.errors && token.errors.length > 0;

        ret.push("<span class='rounded-pill " + cls + " " + (hasErrors ? 'editor-error' : '') + "'>" + token.value + "</span>");

        if (token.caret) {
            this.currentSuggestions = this.getSuggestionsForToken(token);
            this.st.currentTokenAtCaret = token;
            if (this.currentSuggestions && this.currentSuggestions.length > 0) {
                ret.push(this.buildSuggestionBox());
            }
        }

        if (hasErrors && token.caret) {
            ret.push(this.buildErrorBox(token.errors));
        }

        return ret.join('');
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
                    if (this.st.formulaHighlightedColumns && this.st.formulaHighlightedColumns[tableName] && this.st.formulaHighlightedColumns[tableName][columnName]) {
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

        for (let uiToken of todoStyleForTokens) {
            for (let style of STYLES) {
                if (existingStyles.has(style.bgColor)) continue;
                existingStyles.add(style.bgColor);
                let tableName = uiToken.tableName;
                let columnName = uiToken.columnName;
                if (tableName && columnName) {
                    newformulaHighlightedColumns[tableName] = newformulaHighlightedColumns[tableName] || {};
                    newformulaHighlightedColumns[tableName][columnName] = style.bgColor;
                    uiToken.class = style.bgColor.replace(/^#/, 'c_');
                }
                break;
            }
        }
        this.frmdbState.formulaHighlightedColumns = newformulaHighlightedColumns;
        this.dispatchEvent(new CustomEvent('FrmdbFormulaEditorChangedColumnsHighlightEvent', {bubbles: true}));

        this.currentTokens = ret;
        return ret;
    }

}

export function queryFormulaEditor(el: Document | HTMLElement): FormulaEditorComponent {
    let formulaEditor: FormulaEditorComponent =  el.querySelector('frmdb-formula-editor') as FormulaEditorComponent;
    if (!formulaEditor) throw new Error("formula editor not found");
    return formulaEditor;
}
