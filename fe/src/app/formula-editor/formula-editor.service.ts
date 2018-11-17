import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as jsep from 'jsep';

import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import * as appState from 'src/app/app.state';
import { map, concat } from 'rxjs/operators';
import { timingSafeEqual } from 'crypto';
import { Token, TokenType } from './formula-code-editor/token';
import { Expression, isIdentifier } from 'jsep';
import { TableFormBackendAction } from '../table/table.state';

const colors=['red','blue','green','magenta','cyan','orange','teal'];
@Injectable({
  providedIn: 'root'
})
export class FormulaEditorService {
  private subscriptions: Subscription[] = [];

  public selectedEntity$: Observable<appState.Entity | null>;
  public selectedFormula$: Observable<string | undefined>;
  public editorExpr$: Observable<string | undefined>;
  private developerMode: boolean = false;

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
    if (this.developerMode) this.store.dispatch(new appState.FormulaEditorToggle());
  }

  public tokenize(editorTxt: string, caretPos: number): Token[] {
    let expr = jsep(editorTxt, true);
    return this.parse(expr, caretPos);
  }

  private expr2token(type: TokenType, node: Expression, caretPos: number): Token {
    return new Token().withType(type)
      .withStartPos(node.startIndex)
      .withEndPos(node.endIndex)
      .withCaret(node.startIndex <= caretPos && caretPos <= node.endIndex)
      // .withColor(colors[Math.floor(Math.random()*colors.length)])
      .withValue(node.origExpr);
  }
  private punctuationToken(startPos: number, token: string, caretPos: number): Token {
    return new Token().withType(TokenType.PUNCTUATION)
      .withStartPos(startPos)
      .withEndPos(startPos + token.length)
      .withCaret(startPos <= caretPos && caretPos <= startPos + token.length)
      .withValue(token);
  }

  private parse(node: Expression, caretPos: number): Token[] {
    let ret: Token[] = [];
    switch (node.type) {

        case 'ArrayExpression':
            return [this.punctuationToken(node.startIndex, '[', caretPos)]
              .concat(node.elements.reduce((arr, e) => arr.concat(this.parse(e, caretPos)), [] as Token[]))
              .concat(this.punctuationToken(node.endIndex - 1, ']', caretPos));

        case 'BinaryExpression':
            return this.parse(node.left, caretPos)
              .concat(this.punctuationToken(node.left.endIndex, ' '+node.operator+' ', caretPos))
              .concat(this.parse(node.right, caretPos));

        case 'CallExpression':
            ret = [];
            if (isIdentifier(node.callee)) {
              ret.push(this.expr2token(TokenType.FUNCTION_NAME, node.callee, caretPos));
            } else {
              ret.push.apply(ret, this.parse(node.callee, caretPos));
            }
            ret.push(this.punctuationToken(node.callee.endIndex, '(', caretPos));
            let endParanthesisPos = node.arguments.length > 0 ? node.arguments[node.arguments.length - 1].endIndex : node.callee.endIndex + 1;
            for (var i=0;i<node.arguments.length;i++) {
              ret=[...ret, ...this.parse(node.arguments[i], caretPos)];
              if (i<node.arguments.length-1) ret.push(this.punctuationToken(node.endIndex,', ',caretPos));
            }
            ret.push(this.punctuationToken(endParanthesisPos, ')', caretPos));
            return ret;

        case 'ConditionalExpression':
            return this.parse(node.test, caretPos)
                .concat(this.parse(node.consequent, caretPos))
                .concat(this.parse(node.alternate, caretPos))
            ;

        case 'Identifier':
            return [this.expr2token(TokenType.NONE, node, caretPos)];

        case 'NumberLiteral':
          return [this.expr2token(TokenType.LITERAL, node, caretPos)];

        case 'StringLiteral':
          return [this.expr2token(TokenType.LITERAL, node, caretPos)];

        case 'Literal':
          return [this.expr2token(TokenType.LITERAL, node, caretPos)];

        case 'LogicalExpression':
          return this.parse(node.left, caretPos)
            .concat(this.punctuationToken(node.left.endIndex, node.operator, caretPos))
            .concat(this.parse(node.right, caretPos));

        case 'MemberExpression':
            ret = [];
            if (isIdentifier(node.object)) {
              ret.push(this.expr2token(TokenType.TABLE_NAME, node.object, caretPos));
            } else {
              ret.push.apply(ret, this.parse(node.object, caretPos));
            }
            if (isIdentifier(node.property)) {
              ret.push(this.punctuationToken(node.endIndex,'.',caretPos));
              ret.push(this.expr2token(TokenType.COLUMN_NAME, node.property, caretPos));
            } else {
              ret.push(this.punctuationToken(node.endIndex,'.',caretPos));
              ret.push.apply(ret, this.parse(node.property, caretPos));
            }

            return ret;

        case 'ThisExpression':
            return [];

        case 'UnaryExpression':
            return [this.punctuationToken(node.argument.startIndex - 1, node.operator, caretPos)]
              .concat(this.parse(node.argument, caretPos));

        case 'Compound':
            throw new Error("Compound expr are not supported: " + node.origExpr);

        default:
            throw new Error("Unknown expression: " + JSON.stringify(node));
    }
  }

}
