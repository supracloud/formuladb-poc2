import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { EntityProperty, Pn } from 'src/app/common/domain/metadata/entity';
import * as appState from 'src/app/app.state';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormulaEditorService {

  public selectedEntity$: Observable<appState.Entity | null>;
  public selectedFormula$: Observable<string | undefined>;
  public editorExpr$: Observable<string | undefined>;

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
    this.editorExpr$ = this.store.select(appState.getEditorExpr);
  }

  public toggleFormulaEditor() {
    this.store.dispatch(new appState.FormulaEditorToggle());
  }

}
