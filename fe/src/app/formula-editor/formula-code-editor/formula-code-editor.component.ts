import { Component, OnInit } from '@angular/core';


import { Observable, Subscription } from 'rxjs';
import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';

import * as appState from 'src/app/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'frmdb-formula-code-editor',
  templateUrl: './formula-code-editor.component.html',
  styleUrls: ['./formula-code-editor.component.scss']
})
export class FormulaCodeEditorComponent implements OnInit {
  protected subscriptions: Subscription[] = [];

  selectedEntity$: Observable<appState.Entity | null>;
  selectedProperty: EntityProperty | null;
  editorExpr: string | undefined;

  constructor(protected store: Store<appState.AppState>) {
    this.selectedEntity$ = this.store.select(appState.getSelectedEntityState);
    this.subscriptions.push(this.store.select(appState.getSelectedPropertyState).subscribe(prop => this.selectedProperty = prop));
    this.subscriptions.push(this.store.select(appState.getFormulaExpr).subscribe(expr => this.editorExpr = expr));
  }

  ngOnInit() {
  }

  handleChange($event) {
    console.warn('ngModelChange', $event);
  }

  public getFormula() {
    if (this.selectedProperty) {
      if (this.selectedProperty.propType_ == Pn.FORMULA) {
        return this.selectedProperty.formula;
      } else return this.selectedProperty.propType_;
    } else return null;
  }

  private keywords: string[] = ["rammstein", "rammbird", "rammspider", "metawiz"];

  setClass(word: string): string {
    return this.keywords.some((s) => s === word) ? "keyword" : '';
  }

  doValidation(text: string): { [key: string]: number[] } {
    return { "BlaBla": [0, 25] };
  }

  setSuggestion(stem: string): string[] {
    if (this.keywords && stem.length > 3) {
      return this.keywords.filter((s) => s.startsWith(stem));
    } else return [];
  }

}
