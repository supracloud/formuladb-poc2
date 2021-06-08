import * as _ from "lodash";
import { Token, Suggestion, FormulaStaticCheckerTokenizer, AllowedValuesAndSuggestions, ValuesAndSuggestions, AstNodeToken, TextToken } from "@core/formula_static_checker_tokenizer";
import { Pn, EntityProperty, Entity, ReferenceToProperty, ScalarFormulaProperty, AggregateFormulaProperty } from '@domain/metadata/entity';
import { FrmdbElementDecorator, FrmdbElementBase } from "@fe/live-dom-template/frmdb-element";
import { DataObj } from "@domain/metadata/data_obj";
import { elvis } from "@core/elvis";
import { BACKEND_SERVICE } from "@fe/backend.service";
import { ServerEventPreviewFormula, ServerEventSetProperty } from "@domain/event";
import { KeyEvent } from "@fe/key-event";
import { Expression, isCallExpression, isIdentifier } from "jsep";
import { PropertyTypeFunctionsNames, LookupFunctions } from "@core/functions_compiler";
import { astNodeReturnType } from "@domain/metadata/expressions";
import { isFunctionReturnTypes, FunctionReturnTypeNames, FunctionReturnTypes, isScalarValueTypes, ScalarValueTypeNames, ScalarValueTypes, isAssignableTo, isAggregateValueTypes, types2str, AggregateValueTypeNames } from "@domain/metadata/types";
import { getFormulaReturnType } from "@core/formula_compiler_with_static_checking";
import { onEventChildren } from "@fe/delegated-events";

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

export class AstNodeUiToken extends AstNodeToken {
    constructor(token: AstNodeToken, public caret: boolean) {
        super(token.tokenizer, token.astNode, token.inputValue, token.pstart, token.pend, token.tokenErrors);
    }
    class?: string;
}
export class TextUiToken extends TextToken {
    constructor(token: TextToken, public caret: boolean) {
        super(token.tokenizer, token.value, token.pstart, token.pend);
    }
    class?: string;
}
export type UiToken = AstNodeUiToken | TextUiToken;

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
    currentTokenizer: FormulaStaticCheckerTokenizer | undefined;
    overlay: HTMLDivElement;
    suggestionBox: HTMLDivElement;
    toggleEditorBtn: HTMLButtonElement;
    applyChangesBtn: HTMLButtonElement;
    requiredCheckbox: HTMLInputElement;

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
    activeSuggestion: Suggestion | undefined;

    suggestion?: (string) => string[];

    validation?: (string) => { [key: string]: number[] };

    connectedCallback() {
        this.textarea = this.elem.querySelector('textarea') as HTMLTextAreaElement;
        this.overlay = this.elem.querySelector('.editor-formatted-overlay') as HTMLDivElement;
        this.toggleEditorBtn = this.elem.querySelector('#toggle-formula-editor') as HTMLButtonElement;
        this.applyChangesBtn = this.elem.querySelector('#apply-formula-changes') as HTMLButtonElement;
        this.requiredCheckbox = this.elem.querySelector('input[name="required"]') as HTMLInputElement;
        this.suggestionBox = this.elem.querySelector('.suggestion-box') as HTMLInputElement;

        this.textarea.addEventListener('click', e => this.click());
        this.textarea.addEventListener('keydown', e => this.keydown(e));
        this.textarea.addEventListener('keyup', e => this.keyup(e));
        this.toggleEditorBtn.addEventListener('click', e => this.toggleEditor());
        this.applyChangesBtn.addEventListener('click', e => this.applyChanges());
        onEventChildren(this.shadowRoot!, "click", '.suggestion-element', (ev) => {
            this.autoComplete(ev.target.innerHTML);
        })
    }

    frmdbPropertyChangedCallback<T extends keyof FormulaEditorState>(propName: T, oldVal: FormulaEditorState[T] | undefined, newVal: FormulaEditorState[T]): Partial<FormulaEditorState> | Promise<Partial<FormulaEditorState>> {
        if ("editedProperty" === propName || "editedEntity" === propName) {
            let prop = this.frmdbState.editedProperty;
            this.textarea.value = prop ? this.serializePropertyToFormulaStr(prop) : "no table column selected yet";
            this.debouncedOnEdit();
        }
        return this.frmdbState;
    }

    get editorOn() {
        return this.classList.contains("editor-on");
    }
    set editorOn(val: boolean) {
        if (val) {
            this.classList.add("editor-on");
            this.applyChangesBtn.disabled = false;
        } else {
            this.classList.remove("editor-on");
            this.applyChangesBtn.disabled = true;
        }
    }

    toggleEditor() {
        if (this.editorOn) {
            if (this.dirty && !confirm("discard changes ?")) return;
            this.editorOn = false;
            this.textarea.readOnly = true;
            this.dirty = false;
            this.emit({ type: "FrmdbFormulaEditorOff"});
        } else {
            this.dirty = false;
            this.textarea.readOnly = false;
            this.editorOn = true;
            this.performOnEdit();
            this.emit({ type: "FrmdbFormulaEditorOn"});
        }
    }


    applyChanges() {
        if (!this.dirty) return;
        if (!this.frmdbState.editedEntity || !this.frmdbState.editedProperty) return;
        let newProp = this.getEntityPropertyFromTokens();
        if (!newProp) { alert("formula has error tokens"); return; }
        if (confirm("Please confirm, apply modifications to DB ?")) {
            BACKEND_SERVICE().putEvent(new ServerEventSetProperty(this.frmdbState.editedEntity, newProp))
                .then(async (ev: ServerEventSetProperty) => {
                    if (ev.state_ != 'ABORT') {
                        this.emit({ type: "FrmdbColumnChanged", table: this.frmdbState.editedEntity!, newColumn: newProp! });
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
        let tokenAtCursor, tokenIndexAtCursor;
        for (let [i, x] of this.currentTokens.entries()) {
            if (x.pstart <= cursorPos && cursorPos <= x.pend) {
                tokenAtCursor = x;
                tokenIndexAtCursor = i;
            }
        }
        if (tokenAtCursor && tokenIndexAtCursor != null) {
            this.shadowRoot!.querySelector(`.editor-formatted-overlay .at-caret`)?.classList.remove('at-caret');
            this.shadowRoot!.querySelector(`.editor-formatted-overlay span:nth-of-type(${tokenIndexAtCursor + 1})`)?.classList.add('at-caret');
        }
        if (tokenAtCursor && tokenAtCursor.tableName && tokenAtCursor.errors.length === 0) {
            this.st.tableNameAtCaret = tokenAtCursor.tableName;
        }
    }

    get st(): FormulaEditorState {
        return this.frmdbState as FormulaEditorState;
    }

    onAutoComplete(): void {
        if (this.st.currentTokenAtCaret && this.activeSuggestion) {
            this.st.currentTokenAtCaret.forceValue = this.activeSuggestion.text;
            this.textarea.value = this.currentTokens.map(t => t.text).join('');
            this.activeSuggestion = undefined;
            this.st.currentTokenAtCaret = undefined;
            this.st.tableNameAtCaret = undefined;
            this.debouncedOnEdit();
        }
    }

    autoComplete(tokenValue: string): void {
        if (!this.st.currentTokenAtCaret) return;
        this.st.currentTokenAtCaret.forceValue = tokenValue;
        this.textarea.value = this.currentTokens.map(t => t.text).join('');
        this.activeSuggestion = undefined;
        this.st.currentTokenAtCaret = undefined;
        this.st.tableNameAtCaret = undefined;
        this.debouncedOnEdit();
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
            this.dirty = true;
            this.debouncedOnEdit();
        }
        else if (this.textarea.selectionStart != null) {
            this.cursorMove(this.textarea.selectionStart);
        }
    }
    click() {
        this.debouncedOnEdit();
        // if (this.currentTokens && this.currentTokens.length == 0) {
        // } else if (this.textarea.selectionStart != null) {
        //     this.cursorMove(this.textarea.selectionStart);
        // }
    }

    private debouncedOnEdit = _.debounce(() => this.performOnEdit(), 200);
    performOnEdit(): void {
        let ftext = "";
        let editorExpr = this.textarea.value;
        if (editorExpr) {
            let errors;
            if (this.validation) {
                errors = this.validation(editorExpr);
            }
            let tokens: UiToken[] = this.tokenize(editorExpr, this.textarea.selectionStart);
            let tstEntityProperty = this.getEntityPropertyFromTokens();
            if (tstEntityProperty === undefined && tokens[0]?.errors?.length == 0) {
                tokens[0].errors.push(`Error: could not extract the type of column from the formula`);
            }
            let hasErrors: boolean = false;
            for (let i: number = 0; i < tokens.length; i++) {
                switch (tokens[i].type) {
                    default:
                        ftext += this.renderToken(tokens[i]);
                        hasErrors = hasErrors || (tokens[i].errors && tokens[i].errors.length > 0);
                }
            }

            this.overlay.innerHTML = ftext;
            this.hasErrors = hasErrors;
            this.cursorMove(this.textarea.selectionStart);
        }
    }

    serializePropertyToFormulaStr(entityProperty: EntityProperty): string {
        switch (entityProperty.propType_) {
            case Pn.INPUT:
                switch (entityProperty.actualType.name) {
                    case "NumberType":
                        return `NUMBER_INPUT()`;
                    case "TextType":
                        return `TEXT_INPUT()`;
                    case "BooleanType":
                        return `BOOLEAN_INPUT()`;
                    case "RichTextType":
                        return `RICH_TEXT_INPUT`;
                    case "DatetimeType":
                        return `DATETIME_INPUT()`;
                    case "MediaType":
                        return `MEDIA_INPUT()`;
                }
            case Pn.CHILD_TABLE:
                return `TRIGGER`;
            case Pn.TRIGGER:
                return `ACTION_COLUMN`;
            case Pn.KEY:
                return `KEY(${entityProperty.scalarFormula})`;
            case Pn.COMPUTED_RECORD:
                return `COMPUTED_RECORD(${entityProperty.referencedEntityName}, ${entityProperty.formula})`;
            case Pn.COMPUTED_RECORD_VALUE:
                return `COMPUTED_RECORD_VALUE(${entityProperty.formula})`;
            case Pn.REFERENCE_TO:
                return `REFERENCE_TO(${entityProperty.referencedEntityName}, )`;
            case Pn.HLOOKUP:
                return `HLOOKUP(${entityProperty.referenceToPropertyName}, ${entityProperty.referencedPropertyName})`;
            case Pn.SCALAR_FORMULA:
            case Pn.AGGREGATE_FORMULA:
                return entityProperty.formula;
            case Pn.VALIDATE_RECORD: {
                let params = entityProperty.params ? ', ' + entityProperty.params.join(', ') : '';
                let errMsg = entityProperty.errorMessage ? ', ' + entityProperty.errorMessage : '';
                return `VALIDATE_RECORD(${entityProperty.scalarFormula}${errMsg}${params})`;
            }
            case Pn.AUTO_CORRECT:
                return `AUTO_CORRECT(${entityProperty.validationTableName}, ${entityProperty.validationTableName}, ${entityProperty.targetPropertyName}, ${entityProperty.scalarFormula})`;
        }
    }
    getEntityPropertyFromTokens(): EntityProperty | undefined {
        if (!this.currentTokenizer) return undefined;
        if (this.currentTokenizer.errors.length > 0) return undefined;

        let required: boolean = this.requiredCheckbox.checked;
        if (isCallExpression(this.currentTokenizer.ast) && isIdentifier(this.currentTokenizer.ast.callee)) {
            if (this.currentTokenizer.ast.callee.name === Pn.REFERENCE_TO) {

                let entityNameToken = this.currentTokenizer.ast.arguments[0];

                let prop: ReferenceToProperty = {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.REFERENCE_TO,
                    referencedEntityName: entityNameToken.origExpr,
                    required,
                };
                return prop;
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.TEXT_INPUT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.INPUT, actualType: { name: "TextType" },
                    required,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.NUMBER_INPUT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.INPUT, actualType: { name: "NumberType" },
                    required,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.DATETIME_INPUT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.INPUT, actualType: { name: "DatetimeType" },
                    required,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.MEDIA_INPUT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.INPUT, actualType: { name: "MediaType" },
                    required,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.BOOLEAN_INPUT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.INPUT, actualType: { name: "BooleanType" },
                    required,
                };
            } else if (this.currentTokenizer.ast.callee.name === Pn.HLOOKUP) {
                let referenceToPropertyName = this.currentTokenizer.ast.arguments[0]?.origExpr;
                let referencedPropertyName = this.currentTokenizer.ast.arguments[1]?.origExpr;

                if (!referenceToPropertyName || !referencedPropertyName) {
                    this.currentTokens[0].errors.push("HLOOKUP requires both referenceToPropertyName and referencedPropertyName");
                    return undefined;
                }

                let referencedEntityName = (this.frmdbState.editedEntity?.props[referenceToPropertyName] as ReferenceToProperty | undefined)?.referencedEntityName;
                if (!referencedEntityName) {
                    this.currentTokens[0].errors.push(`Cound not find table name referenced to by ${referenceToPropertyName}`);
                    return undefined;
                }
                let referencedProperty = BACKEND_SERVICE().getCurrentSchema()?.entities[referencedEntityName].props[referencedPropertyName];
                if (!referencedProperty) {
                    this.currentTokens[0].errors.push(`could not HLOOKUP ${referenceToPropertyName} and ${referencedPropertyName}, target not found`);
                    return undefined;
                }
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.HLOOKUP,
                    referenceToPropertyName,
                    referencedPropertyName,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.KEY) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.KEY,
                    scalarFormula: this.currentTokenizer.ast.arguments[0].origExpr,
                };
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.COMPUTED_RECORD) {
                let formulaRetType = getFormulaReturnType(this.currentTokenizer.ast.arguments[1]);
                if (typeof formulaRetType === "string") {
                    this.currentTokens[0].errors.push("Errors getting COMPUTED_RECORD formula return type: " + formulaRetType);
                    return undefined;
                }
                if (isScalarValueTypes(formulaRetType)) {
                    return {
                        name: elvis(this.st.editedProperty).name!,
                        propType_: Pn.COMPUTED_RECORD,
                        referencedEntityName: this.currentTokenizer.ast.arguments[0].origExpr,
                        formula: this.currentTokenizer.ast.arguments[1].origExpr,
                        returnType_: formulaRetType,
                    };
                } else {
                    this.currentTokens[0].errors.push(`COMPUTED_RECORD formula ${this.currentTokenizer.ast.arguments[1].origExpr} must not contain rollup functions`);
                    return undefined;
                }
            } else if (this.currentTokenizer.ast.callee.name === PropertyTypeFunctionsNames.COMPUTED_RECORD_VALUE) {
                let formulaRetType = getFormulaReturnType(this.currentTokenizer.ast.arguments[0]);
                if (typeof formulaRetType === "string") {
                    this.currentTokens[0].errors.push("Errors getting COMPUTED_RECORD_VALUE formula return type: " + formulaRetType);
                    return undefined;
                }
                if (isScalarValueTypes(formulaRetType)) {
                    return {
                        name: elvis(this.st.editedProperty).name!,
                        propType_: Pn.COMPUTED_RECORD_VALUE,
                        formula: this.currentTokenizer.ast.arguments[0].origExpr,
                        returnType_: formulaRetType,
                    };
                } else {
                    this.currentTokens[0].errors.push(`COMPUTED_RECORD_VALUE formula ${this.currentTokenizer.ast.arguments[1].origExpr} must not contain rollup functions`);
                    return undefined;
                }
            } else if (this.currentTokenizer.ast.callee.name === Pn.VALIDATE_RECORD) {
                if (this.currentTokenizer.ast.arguments.length == 0) {
                    this.currentTokens[0].errors.push(`VALIDATE_RECORD expects a condition argument`);
                    return undefined;
                };
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.VALIDATE_RECORD,
                    scalarFormula: this.currentTokenizer.ast.arguments[0].origExpr,
                    errorMessage: this.currentTokenizer.ast.arguments[1]?.origExpr,
                    params: (this.currentTokenizer.ast.arguments[2] ? [this.currentTokenizer.ast.arguments[2].origExpr] : [])
                        .concat(this.currentTokenizer.ast.arguments[3] ? [this.currentTokenizer.ast.arguments[3].origExpr] : [])
                        .concat(this.currentTokenizer.ast.arguments[4] ? [this.currentTokenizer.ast.arguments[4].origExpr] : [])
                        .concat(this.currentTokenizer.ast.arguments[5] ? [this.currentTokenizer.ast.arguments[5].origExpr] : [])
                };
            } else if (this.currentTokenizer.ast.callee.name === Pn.AUTO_CORRECT) {
                return {
                    name: elvis(this.st.editedProperty).name!,
                    propType_: Pn.AUTO_CORRECT,
                    validationTableName: this.currentTokenizer.ast.arguments[0].origExpr,
                    validationColName: this.currentTokenizer.ast.arguments[1].origExpr,
                    targetPropertyName: this.currentTokenizer.ast.arguments[2].origExpr,
                    scalarFormula: this.currentTokenizer.ast.arguments[3].origExpr,
                };
            } else {
                return this.getFormulaEntityProperty();
            }
        } else {
            return this.getFormulaEntityProperty();
        }
    }

    private getFormulaEntityProperty(): ScalarFormulaProperty | AggregateFormulaProperty | undefined {
        if (!this.currentTokenizer) return undefined;
        if (this.currentTokenizer.errors.length > 0) return undefined;

        let formulaRetTy = getFormulaReturnType(this.currentTokenizer.ast);
        if (typeof formulaRetTy === "string") {
            this.currentTokenizer.tokens[0].errors.push(formulaRetTy);
            return undefined;
        }
        if (isAggregateValueTypes(formulaRetTy)) {
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.AGGREGATE_FORMULA,
                formula: this.currentTokenizer.ast.origExpr,
                returnType_: formulaRetTy,
            };
        } else if (isScalarValueTypes(formulaRetTy)) {
            return {
                name: elvis(this.st.editedProperty).name!,
                propType_: Pn.SCALAR_FORMULA,
                formula: this.currentTokenizer.ast.origExpr,
                returnType_: formulaRetTy,
            };
        } else {
            this.currentTokens[0].errors.push(`Expected ${AggregateValueTypeNames.join('|')} or ${ScalarValueTypeNames.join('|')} but found ${formulaRetTy.name}`);
            return undefined;
        }
    }

    nextSuggestion(): void {
        // if (this.activeSuggestion == undefined) this.activeSuggestion = -1;
        // if (this.activeSuggestion < this.currentSuggestions.length - 1) {
        //     this.activeSuggestion++;
        //     this.debouncedOnEdit();
        // }
    }

    prevSuggestion(): void {
        // if (this.activeSuggestion == undefined) this.activeSuggestion = 0;
        // if (this.activeSuggestion > 0) {
        //     this.activeSuggestion--;
        //     this.debouncedOnEdit();
        // }
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

    private renderSuggestionElements(valsAndSugg: ValuesAndSuggestions) {
        return /*html*/`
            ${valsAndSugg.suggestions.map(s => /*html*/`
                <button class="suggestion-element match">${s.text}</button>
            `).join('')}
            ${(valsAndSugg.allowedValues || []).map(s => /*html*/`
                <button class="suggestion-element allowed">${s.text}</button>
            `).join('')}
            ${(valsAndSugg.notAllowedValues || []).map(s => /*html*/`
                <button class="suggestion-element" disabled>${s.text}</button>
            `).join('')}
        `;
    }
    private buildSuggestionBox(): string {
        if (!this.editorOn) return '';
        if (!this.frmdbState.currentTokenAtCaret) return '';

        let sugg = this.frmdbState.currentTokenAtCaret.allowedValuesAndSuggestions;
        if (!sugg) return '';
        let re: string = /*html*/`
            <div class="suggestion-container">
                <div class="sugg-col">
                    <h3>Input Functions</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.inputFunctions)}
                    </div>
                </div>
                <div class="sugg-col">
                    <h3>Current Record</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.currentRecordColumns)}
                    </div>
                </div>
                <div class="sugg-col">
                    <h3>Single Record Functions</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.singleRecordFunctions)}
                    </div>
                </div>
                <div class="sugg-col">
                    <h3>Rollup Functions</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.rollupFunctions)}
                    </div>
                    <h3>Lookup Functions</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.lookupFunctions)}
                    </div>
                </div>
                <div class="sugg-col">
                    <h3>Tables</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.tables)}
                    </div>
                </div>
                <div class="sugg-col">
                    <h3>Referenced Record</h3>
                    <div class="sugg-col-group">
                        ${this.renderSuggestionElements(sugg.referencedTableColumns)}
                    </div>
                </div>
            </div>
        `;
        return re;
    }

    private buildErrorBox(errors: string[]): string {
        // if (!this.editorOn) return '';
        return "<div class='error-note-holder'><div class='error-note'>" + errors.slice(0, 1).join("</div><div class='error-note'>") + "</div></div>";
    }

    private renderToken(token: UiToken): string {
        let ret: string[] = [];
        let cls = token.class;

        let hasErrors = token.errors && token.errors.length > 0;

        ret.push(`<span class="rounded-pill ${cls || ''} ${hasErrors ? 'editor-error' : ''}" title="${hasErrors ? token.errors.join(';') : ''}">${token.text}</span>`);

        if (hasErrors) {
            ret.push(this.buildErrorBox(token.errors));
        }

        if (token.caret) {
            this.st.currentTokenAtCaret = token;
            this.suggestionBox.innerHTML = this.buildSuggestionBox();
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

    private parse(editorTxt: string, caretPos: number): UiToken[] {
        if (!this.st.editedEntity || !this.st.editedProperty) return [];

        this.currentTokenizer = new FormulaStaticCheckerTokenizer(
            BACKEND_SERVICE().getCurrentSchema(),
            this.st.editedEntity._id,
            this.st.editedProperty.name,
            editorTxt,
            caretPos
        );
        let { tokens, ast, errors } = this.currentTokenizer;
        let parserTokens: Token[] = tokens;
        let ret: UiToken[] = [];

        let newformulaHighlightedColumns: { [tableName: string]: { [columnName: string]: string } } = {};
        let existingStyles: Set<string> = new Set();
        let todoStyleForTokens: UiToken[] = [];
        for (let token of parserTokens) {
            let uiToken = token.type === "AstNodeToken" ?
                new AstNodeUiToken(token, token.pstart < caretPos && caretPos <= token.pend)
                : new TextUiToken(token, token.pstart < caretPos && caretPos <= token.pend);
            if (isAssignableTo(token.returnDetails?.retType.types, [{ name: "CurrentTableColumnNameType" }])) {
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
        this.dispatchEvent(new CustomEvent('FrmdbFormulaEditorChangedColumnsHighlightEvent', { bubbles: true }));

        this.currentTokens = ret;
        return ret;
    }

}

export function queryFormulaEditor(el: Document | HTMLElement): FormulaEditorComponent {
    let formulaEditor: FormulaEditorComponent = el.querySelector('frmdb-formula-editor') as FormulaEditorComponent;
    if (!formulaEditor) throw new Error("formula editor not found");
    return formulaEditor;
}
