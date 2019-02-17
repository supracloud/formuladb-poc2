import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { EntityProperty, Pn } from "@core/domain/metadata/entity";
import * as appState from 'src/app/app.state';
import { map } from 'rxjs/operators';
import { Token, TokenType, FormulaTokenizer, DEFAULT_TOKEN } from "@core/formula_tokenizer";
import { FormulaTokenizerSchemaChecker } from "@core/formula_tokenizer_schema_checker";
import { BackendService } from '../backend.service';
import { FormulaState, formulaEditorInitialState } from '../formula.state';

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

@Injectable({
  providedIn: 'root'
})
export class FormulaEditorService {
  private subscriptions: Subscription[] = [];

  public formulaState: FormulaState = formulaEditorInitialState;
  public selectedFormula$: Observable<string | undefined>;
  public editorExpr$: Observable<string | undefined>;
  public editorOn$: Observable<boolean>;
  public developerMode: boolean = false;
  private highlightTableColumns: { [tableName: string]: { [columnName: string]: string } } = {};
  private formulaTokenizer: FormulaTokenizer;
  private formulaTokenizerSchemaChecker: FormulaTokenizerSchemaChecker;

  constructor(protected store: Store<appState.AppState>, private backendService: BackendService) {
    this.subscriptions.push(this.store.select(appState.getFormula).subscribe(x => {
      this.formulaState = x;
    }));
    this.selectedFormula$ = this.store.select(appState.getSelectedPropertyState).pipe(
      map(selectedProperty => {
        if (selectedProperty) {
          if (selectedProperty.propType_ == Pn.FORMULA) {
            return selectedProperty.formula;
          } else return selectedProperty.propType_;
        } else return undefined;
      })
    );
    this.subscriptions.push(this.store.select(appState.getDeveloperMode).subscribe(devMode => this.developerMode = devMode));
    this.editorOn$ = this.store.select(appState.getEditorOn);
    this.editorExpr$ = this.store.select(appState.getEditorExpr);
    this.formulaTokenizer = new FormulaTokenizer();
  }

  public toggleFormulaEditor() {
    if (this.developerMode) {
      this.store.dispatch(new appState.FormulaEditorToggle());
      this.highlightTableColumns = {};
    }
  }

  public tokenize(editorTxt: string, caretPos: number): UiToken[] {
    let ret = this.parse(editorTxt, caretPos);
    this.store.dispatch(new appState.FormulaEdited(this.highlightTableColumns));
    return ret;
  }

  public previewFormula(formula: string){
    if (this.formulaState && this.formulaState.editedEntity && this.formulaState.editedProperty && this.formulaState.editedDataObj) {
      this.store.dispatch(new appState.ServerEventPreviewFormula(this.formulaState.editedEntity, this.formulaState.editedProperty.name, this.formulaState.editedDataObj, formula));
    }
  }

  private getFormulaTokenizerSchemaChecker() {
    if (!this.formulaTokenizerSchemaChecker) {
      this.formulaTokenizerSchemaChecker = new FormulaTokenizerSchemaChecker(this.backendService.getFrmdbEngineTools().schemaDAO.schema);
    }
    return this.formulaTokenizerSchemaChecker;
  }

  public getSuggestionsForToken(token: Token) {
    return this.getFormulaTokenizerSchemaChecker().getSuggestionsForToken(token);
  }

  public checkTokenForErrors(token: Token) {
    this.getFormulaTokenizerSchemaChecker().checkToken(token);
  }

  private parse(editorTxt: string, caretPos: number): UiToken[] {
    if (!this.formulaState.editedEntity || !this.formulaState.editedProperty) return [];

    let parserTokens: Token[] = this.formulaTokenizer.tokenizeAndStaticCheckFormula(this.formulaState.editedEntity._id, this.formulaState.editedProperty.name, editorTxt, caretPos);
    let ret: UiToken[] = [];

    let newHighlightTableColumns: { [tableName: string]: { [columnName: string]: string } } = {};
    let existingStyles: Set<string> = new Set();
    let todoStyleForTokens: UiToken[] = [];
    for (let token of parserTokens) {
      let uiToken: UiToken = { ...token, caret: token.pstart < caretPos && caretPos <= token.pend };
      if (token.type == TokenType.COLUMN_NAME) {
        let tableName = token.tableName;
        let columnName = token.columnName;
        if (tableName && columnName) {
          newHighlightTableColumns[tableName] = newHighlightTableColumns[tableName] || {};
          if (this.highlightTableColumns[tableName] && this.highlightTableColumns[tableName][columnName]) {
            newHighlightTableColumns[tableName][columnName] = this.highlightTableColumns[tableName][columnName];
            existingStyles.add(newHighlightTableColumns[tableName][columnName]);
            uiToken.class = this.highlightTableColumns[tableName][columnName].replace(/^#/, 'c_');
          } else {
            todoStyleForTokens.push(uiToken);
          }
        }
      }
      ret.push(uiToken);
    }

    this.highlightTableColumns = newHighlightTableColumns;
    for (let uiToken of todoStyleForTokens) {
      for (let style of STYLES) {
        if (existingStyles.has(style.bgColor)) continue;
        existingStyles.add(style.bgColor);
        let tableName = uiToken.tableName;
        let columnName = uiToken.columnName;
        if (tableName && columnName) {
          this.highlightTableColumns[tableName][columnName] = style.bgColor;
          uiToken.class = style.bgColor.replace(/^#/, 'c_');
        }
        break;
      }
    }

    return ret;
  }

}
