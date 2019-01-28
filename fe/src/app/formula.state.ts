/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";


export { DataObj };
export { ChangeObj, applyChanges };

import { Expression } from 'jsep';
import { EntityProperty, Pn, Entity } from "@core/domain/metadata/entity";

export interface FormulaState {
  selectedFormula: string | undefined;
  editorExpr: string | undefined;
  selectedProperty: EntityProperty | undefined;
  editedEntity: Entity | undefined;
  editedProperty: EntityProperty | undefined;
  formulaHighlightedColumns: {[tableName: string]: {[columnName: string]: string}};
}

export const formulaEditorInitialState: FormulaState = {
  selectedFormula: undefined,
  editorExpr: undefined,
  selectedProperty: undefined,
  editedEntity: undefined,
  editedProperty: undefined,
  formulaHighlightedColumns: {},
};


export const FormulaEditorToggleN = "[fx] FormulaEditorToggle";
export const FormulaEditedN = "[fx] FormulaEdited";

export class FormulaEditorToggle implements Action {
  readonly type = FormulaEditorToggleN;

  constructor() { }
}

export class FormulaEdited implements Action {
  readonly type = FormulaEditedN;

  constructor(public formulaColumns: {[tableName: string]: {[columnName: string]: string}}) { }
}

export type FormulaActions =
  | FormulaEditorToggle
  | FormulaEdited
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
        editorExpr: state.editorExpr ? undefined : state.selectedFormula
      };
      break;
    case FormulaEditedN:
      ret = {
        ...state,
        formulaHighlightedColumns: action.formulaColumns || {}
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

export const getEditorExpr = createSelector(
  getFormula,
  (state: FormulaState) => state.editorExpr
);
export const getEditedEntity = createSelector(
  getFormula,
  (state: FormulaState) => state.editedEntity
);
export const getEditedProperty = createSelector(
  getFormula,
  (state: FormulaState) => state.editedProperty
);
export const getFormulaHighlightedColumns = createSelector(
  getFormula,
  (state: FormulaState) => state.formulaHighlightedColumns
);
