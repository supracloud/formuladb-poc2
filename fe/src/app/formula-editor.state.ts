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

export interface FormulaEditorState {
  expr: Expression | undefined;
}

export const formulaEditorInitialState: FormulaEditorState = {
  expr: undefined,
};


export const UserSelectCellN = "[fx] UserSelectCell";

export class UserSelectCell implements Action {
  readonly type = UserSelectCellN;

  constructor(public columnName: string | undefined) { }
}

export type FormulaEditorActions =
  | UserSelectCell
  ;

/**
 * TODO: check if immuformulaEditor.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function formulaEditorReducer(state = formulaEditorInitialState, action: FormulaEditorActions): FormulaEditorState {
  let ret: FormulaEditorState = state;
  switch (action.type) {
    case UserSelectCellN:
      ret = {
        ...state,
      };
      break;
  }

  // if (action.type.match(/^\[formulaEditor\]/)) console.log('[formulaEditor] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'formulaEditor': formulaEditorReducer
};
export const getFormulaEditor = createFeatureSelector<FormulaEditorState>('formulaEditor');

