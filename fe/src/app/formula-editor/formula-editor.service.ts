import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as jsep from 'jsep';

import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import * as appState from 'src/app/app.state';
import { map, concat } from 'rxjs/operators';
import { timingSafeEqual } from 'crypto';
import { Expression, isIdentifier } from 'jsep';
import { TableFormBackendAction } from '../table/table.state';
import { Token, TokenType, FormulaTokenizer, DEFAULT_TOKEN } from '../common/formula_tokenizer';

const STYLES = [
  { bgColor: '#b6d0f9', tokenClass: 'c_b6d0f9' },
  { bgColor: '#f9ccf9', tokenClass: 'c_f9ccf9' },
  { bgColor: '#fcd9e1', tokenClass: 'c_fcd9e1' },
  { bgColor: '#d9f9e5', tokenClass: 'c_d9f9e5' },
  { bgColor: '#f5f9d9', tokenClass: 'c_f5f9d9' },
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
  private highlightTableColumns: {[tableName: string]: { [columnName: string]: string }} = {};
  private formulaStaticTypeChecker: FormulaTokenizer;


  constructor(protected store: Store<appState.AppState>) {
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


  private parse(editorTxt: string, caretPos: number): UiToken[] {
    if (!this.editedEntity || !this.editedProperty) return [];

    let parserTokens: Token[] = this.formulaStaticTypeChecker.tokenizeAndStaticCheckFormula(this.editedEntity._id, this.editedProperty.name, editorTxt, caretPos);
    let ret: UiToken[] = [];

    for (let token of parserTokens) {
      let uiToken: UiToken = {...token, caret: token.pstart <= caretPos && caretPos <= token.pend};
      if (token.type == TokenType.COLUMN_NAME) {
        let tableName = token.tableName;
        let columnName = token.columnName;
        if (tableName && columnName) {
          let styleLength = Object.values(this.highlightTableColumns).map(h => Object.keys(h).length).reduce((acc, x) => acc + x, 0);
          let tokenClass = STYLES[styleLength % STYLES.length].tokenClass;
          let bgColor = STYLES[styleLength % STYLES.length].bgColor;
          this.highlightTableColumns[tableName] = this.highlightTableColumns[tableName] || {};
          this.highlightTableColumns[tableName][columnName] = bgColor;
          uiToken.class = tokenClass;
        }
      }
      ret.push(uiToken);
    }


    return ret;
  }

}
