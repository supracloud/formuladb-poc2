import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import * as appState from 'src/app/app.state';
import { map } from 'rxjs/operators';
import { Token, TokenType, FormulaTokenizer, DEFAULT_TOKEN } from '../common/formula_tokenizer';
import { FormulaTokenizerSchemaChecker } from '../common/formula_tokenizer_schema_checker';
import { BackendService } from '../backend.service';

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

  public editedEntity: appState.Entity | undefined;
  public editedProperty: EntityProperty | undefined;
  public selectedFormula$: Observable<string | undefined>;
  public editorExpr$: Observable<string | undefined>;
  private developerMode: boolean = false;
  private highlightTableColumns: { [tableName: string]: { [columnName: string]: string } } = {};
  private formulaStaticTypeChecker: FormulaTokenizer;
  private formulaTokenizerSchemaChecker: FormulaTokenizerSchemaChecker;


  constructor(protected store: Store<appState.AppState>, private backendService: BackendService) {
    this.subscriptions.push(this.store.select(appState.getEditedEntity).subscribe(x => this.editedEntity = x));
    this.subscriptions.push(this.store.select(appState.getEditedProperty).subscribe(x => this.editedProperty = x));
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
    this.editorExpr$ = this.store.select(appState.getEditorExpr);
    this.formulaStaticTypeChecker = new FormulaTokenizer();
    this.formulaTokenizerSchemaChecker =
      new FormulaTokenizerSchemaChecker(this.backendService.getFrmdbEngineTools().schemaDAO.schema);
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

  public getSuggestionsForToken(token: Token) {
    return this.formulaTokenizerSchemaChecker.getSuggestionsForToken(token);
  }

  private parse(editorTxt: string, caretPos: number): UiToken[] {
    if (!this.editedEntity || !this.editedProperty) return [];

    let parserTokens: Token[] = this.formulaStaticTypeChecker.tokenizeAndStaticCheckFormula(this.editedEntity._id, this.editedProperty.name, editorTxt, caretPos);
    let ret: UiToken[] = [];

    let newHighlightTableColumns: { [tableName: string]: { [columnName: string]: string } } = {};
    let existingStyles: Set<string> = new Set();
    let todoStyleForTokens: UiToken[] = [];
    for (let token of parserTokens) {
      let uiToken: UiToken = { ...token, caret: token.pstart <= caretPos && caretPos <= token.pend };
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
