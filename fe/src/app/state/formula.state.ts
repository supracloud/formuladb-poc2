/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";

import * as events from "@core/domain/event";

export { DataObj };
export { ChangeObj, applyChanges };

import { EntityProperty, Pn, Entity } from "@core/domain/metadata/entity";

export interface FormulaState {
  editorOn: boolean;
  selectedFormula: string | undefined;
  editorExpr: string | undefined;
  selectedProperty: EntityProperty | undefined;
  editedEntity: Entity | undefined;
  editedDataObj: DataObj | undefined;
  editedProperty: EntityProperty | undefined;
  previewEditedDataObj: DataObj | undefined;
  formulaHighlightedColumns: {[tableName: string]: {[columnName: string]: string}};
}

export const formulaEditorInitialState: FormulaState = {
  editorOn: false,
  selectedFormula: undefined,
  editorExpr: undefined,
  selectedProperty: undefined,
  editedEntity: undefined,
  editedDataObj: undefined,
  editedProperty: undefined,
  previewEditedDataObj: undefined,
  formulaHighlightedColumns: {},
};

export function entityProperty2Formula(selectedProperty: EntityProperty | undefined): string | undefined {
  if (selectedProperty) {
    if (selectedProperty.propType_ == Pn.FORMULA) {
      return selectedProperty.formula;
    } 
    else if (selectedProperty.propType_ == Pn.REFERENCE_TO) {
      return `${Pn.REFERENCE_TO}(${selectedProperty.referencedEntityName}.${selectedProperty.referencedPropertyName})`;
    } 
    else {
      return selectedProperty.propType_;
    }
  } else return undefined;

}

export const FormulaEditorToggleN = "[fx] FormulaEditorToggle";
export const FormulaEditedN = "[fx] FormulaEdited";
export const FormulaPreviewFromBackendN = "[fx] FormulaPreviewFromBackend";

export class FormulaEditorToggle implements Action {
  readonly type = FormulaEditorToggleN;

  constructor() { }
}

export class FormulaEdited implements Action {
  readonly type = FormulaEditedN;

  constructor(public formulaColumns: {[tableName: string]: {[columnName: string]: string}}) { }
}

export class FormulaPreviewFromBackend implements Action {
  readonly type = FormulaPreviewFromBackendN;

  constructor(public event: events.ServerEventPreviewFormula) {}
}

export type FormulaActions =
  | FormulaEditorToggle
  | FormulaEdited
  | FormulaPreviewFromBackend
  ;

/**
 * TODO: check if immuformulaEditor.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function formulaEditorReducer(state = formulaEditorInitialState, action: FormulaActions): FormulaState {
  let ret: FormulaState = state;
  switch (action.type) {
    case FormulaEditorToggleN:
      ret = {
        ...state,
        editorOn: !state.editorOn,
        editorExpr: state.editorExpr ? undefined : state.selectedFormula
      };
      break;
    case FormulaEditedN:
      ret = {
        ...state,
        formulaHighlightedColumns: action.formulaColumns || {}
      };
      break;
    case FormulaPreviewFromBackendN:
      ret = {
        ...state,
        previewEditedDataObj: action.event.currentDataObj,
      };
      break;
  }

  // if (action.type.match(/^\[formula\]/)) console.log('[formula] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'formula': formulaEditorReducer
};
export const getFormula = createFeatureSelector<FormulaState>('formula');

export const getEditorOn = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.editorOn : formulaEditorInitialState.editorOn
);
export const getEditorExpr = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.editorExpr : formulaEditorInitialState.editorExpr
);
export const getEditedEntity = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.editedEntity : formulaEditorInitialState.editedEntity
);
export const getEditedDataObj = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.editedDataObj : formulaEditorInitialState.editedDataObj
);
export const getEditedProperty = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.editedProperty : formulaEditorInitialState.editedProperty
);
export const getFormulaHighlightedColumns = createSelector(
  getFormula,
  (state: FormulaState) => state ? state.formulaHighlightedColumns : formulaEditorInitialState.formulaHighlightedColumns
);
