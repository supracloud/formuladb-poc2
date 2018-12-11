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
import { Token, TokenType, FormulaStaticTypeChecker } from '../common/formula_static_type_checker';

const STYLES = [
  { bgColor: '#b6d0f9', tockenClass: 'c_b6d0f9' },
  { bgColor: '#f9ccf9', tockenClass: 'c_f9ccf9' },
  { bgColor: '#fcd9e1', tockenClass: 'c_fcd9e1' },
  { bgColor: '#d9f9e5', tockenClass: 'c_d9f9e5' },
  { bgColor: '#f5f9d9', tockenClass: 'c_f5f9d9' },
];

export class UiToken extends Token {

  private caret: boolean = false;
  private class: string | undefined;

  public constructor(token: Token) {
    super();
    for (var prop in token) {
      this[prop] = token[prop];
    }
  }

  public withClass(c: string | undefined): UiToken {
    this.class = c;
    return this;
  }

  public getClass(): string | undefined {
    return this.class;
  }


  public withCaret(c: boolean): UiToken {
    if (!this.caret) {
      this.caret = c;
    }
    return this;
  }

  public isCaret(): boolean {
    return this.caret;
  }
}

@Injectable({
  providedIn: 'root'
})
export class FormulaEditorService {
  private subscriptions: Subscription[] = [];

  public selectedEntity$: Observable<appState.Entity | null>;
  public selectedFormula$: Observable<string | undefined>;
  public editorExpr$: Observable<string | undefined>;
  private developerMode: boolean = false;
  private highlightColumns: { [columnName: string]: string } = {};


  constructor(protected store: Store<appState.AppState>) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
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
  }

  public toggleFormulaEditor() {
    if (this.developerMode) {
      this.store.dispatch(new appState.FormulaEditorToggle());
      this.highlightColumns = {};
    }
  }

  public tokenize(editorTxt: string, caretPos: number): UiToken[] {
    let ret = this.parse(editorTxt, caretPos);
    this.store.dispatch(new appState.FormulaEdited(this.highlightColumns));
    return ret;
  }


  private parse(editorTxt: string, caretPos: number): UiToken[] {
    let formulaStaticTypeChecker = new FormulaStaticTypeChecker();
    let parserTokens: Token[] = formulaStaticTypeChecker.tokenizeAndStaticCheckFormula(editorTxt);
    let ret: UiToken[] = [];

    for (let token of parserTokens) {
      let uiToken = new UiToken(token).withCaret(token.getStartPos() <= caretPos && caretPos <= token.getEndPos());
      if (token.getType() == TokenType.COLUMN_NAME) {
        let tokenClass = STYLES[Object.keys(this.highlightColumns).length % STYLES.length].tockenClass;
        let bgColor = STYLES[Object.keys(this.highlightColumns).length % STYLES.length].bgColor;
        this.highlightColumns[token.getValue()] = bgColor;
        uiToken.withClass(tokenClass);
      }
      ret.push(uiToken);
    }


    return ret;
  }

}
