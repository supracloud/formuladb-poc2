import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import * as appState from '../../../app.state';
import { Store } from '@ngrx/store';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import { Expression, isIdentifier } from 'jsep';

export interface FormulaEditorPreviewNode {
  level: number;
  text: string;
  children: FormulaEditorPreviewNode[];
}

@Component({
  selector: 'frmdb-formula-editor',
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {
  protected subscriptions: Subscription[] = [];

  selectedEntity$: Observable<appState.Entity | null>;
  selectedProperty: EntityProperty | null;
  developerMode$: Observable<boolean>;

  editorOpened: boolean = false;

  constructor(protected store: Store<appState.AppState>) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.subscriptions.push(this.store.select(appState.getSelectedPropertyState).subscribe(prop => this.selectedProperty = prop));
    this.developerMode$ = this.store.select(appState.isEditMode);
  }

  formulaFocused() {
    this.editorOpened = true;
  }

  toggleFormulaEditor() {
    this.editorOpened = !this.editorOpened;
  }

  ngOnInit() {
  }

  public getFormula() {
    if (this.selectedProperty) {
      if (this.selectedProperty.propType_ == Pn.FORMULA) {
        return this.selectedProperty.formula;
      } else return this.selectedProperty.propType_;
    } else return null;
  }

  private walkExpressionTree(node: Expression, level: number): FormulaEditorPreviewNode {
    switch (node.type) {

        case 'ArrayExpression':
            return {
              level: level,
              text: 'array',
              children: node.elements.map(e => this.walkExpressionTree(e, level + 1))
            };

        case 'BinaryExpression':
          return {
            level: level,
            text: node.operator,
            children: [this.walkExpressionTree(node.left, level + 1), this.walkExpressionTree(node.right, level)]
          };

        case 'CallExpression':
          return {
            level: level,
            text: isIdentifier(node.callee) ? node.callee.name : node.origExpr,
            children: node.arguments.map(a => this.walkExpressionTree(a, level + 1))
          };

        case 'ConditionalExpression':
          return {
            level: level,
            text: "?",
            children: [
              this.walkExpressionTree(node.test, level + 1),
              {level: level + 1, text: '?', children: []},
              this.walkExpressionTree(node.consequent, level + 1),
              {level: level + 1, text: '?', children: []},
              this.walkExpressionTree(node.alternate, level + 1)
            ]
          };

        case 'Identifier':
            return {level: level, text: node.name, children: []};

        case 'NumberLiteral':
          return {level: level, text: node.raw, children: []};
  
        case 'StringLiteral':
          return {level: level, text: node.raw, children: []};

        case 'Literal':
          return {level: level, text: node.raw, children: []};

        case 'LogicalExpression':
          return {
            level: level,
            text: node.operator,
            children: [this.walkExpressionTree(node.left, level + 1), this.walkExpressionTree(node.right, level)]
          };

        case 'MemberExpression':
          return {level: level, text: node.origExpr, children: []};

        case 'ThisExpression':
          return {level: level, text: 'this', children: []};

        case 'UnaryExpression':
          return {
            level: level,
            text: node.operator,
            children: [this.walkExpressionTree(node.argument, level + 1)]
          };

        case 'Compound':
            throw new Error("Compound expr are not supported: " + node.origExpr);

        default:
            throw new Error("Unknown expression: " + JSON.stringify(node));
    }
  }
  
  public getFormulaPreviewNodes(): FormulaEditorPreviewNode {
    if (this.selectedProperty) {
      if (this.selectedProperty.propType_ == Pn.FORMULA && this.selectedProperty.compiledFormula_) {
        return this.walkExpressionTree(this.selectedProperty.compiledFormula_.rawExpr, 0);
      } else return {level: 0, text: this.selectedProperty.propType_, children: []};
    } else return {level: 0, text: 'empty', children: []};
  }

  ngOnDestroy() {
    // this.formModalService.sendDestroyFormEvent();
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

}
