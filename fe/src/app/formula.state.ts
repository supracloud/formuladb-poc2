/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from './common/domain/metadata/data_obj';
import { ChangeObj, applyChanges } from './common/domain/change_obj';


export { DataObj };
export { ChangeObj, applyChanges };

import { Expression } from 'jsep';
import { EntityProperty, Pn } from './common/domain/metadata/entity';

export interface FormulaState {
  selectedFormula: string | undefined;
  editorExpr: string | undefined;
  selectedProperty: EntityProperty | null;
}

export const formulaEditorInitialState: FormulaState = {
  selectedFormula: undefined,
  editorExpr: undefined,
  selectedProperty: null,
};


export const FormulaStartN = "[fx] FormulaStart";

export class FormulaStart implements Action {
  readonly type = FormulaStartN;

  constructor() { }
}

export type FormulaActions =
  | FormulaStart
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
    case FormulaStartN:
      ret = {
        ...state,
        editorExpr: state.selectedFormula
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

export const getFormulaExpr = createSelector(
  getFormula,
  (state: FormulaState) => state.editorExpr
);
