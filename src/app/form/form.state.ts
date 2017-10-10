import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { Form } from '../domain/uimetadata/form';
import { ChangeObj, applyChanges } from '../domain/change_obj';


export { DataObj };
export { Form };
export { ChangeObj, applyChanges };


export interface State {
  form: Form;
  formData: DataObj;
}

export const initialState: State = {
  form: {} as Form,
  formData: {} as DataObj,
};

export const FORM_DATA_CHANGES = "[form] FormDataChangesAction";
export const FORM_CHANGES = "[form] FormChangesAction";


export class FormDataChangesAction implements Action {
  readonly type = FORM_DATA_CHANGES;

  constructor(public changes: DataObj) { }
}

export class FormChangesAction implements Action {
  readonly type = FORM_CHANGES;

  constructor(public form: Form) { }
}


export type Actions =
  | FormDataChangesAction
  | FormChangesAction
  ;

/**
 * TODO: check if immuform.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function reducer(state = initialState, action: Actions): State {
  let ret: State = state;
  switch (action.type) {
    //changes from the server are commning: added/removed entities
    case FORM_DATA_CHANGES:
      ret = {
        ...state,
        formData: state.formData,
      };
      break;
    //user navigates to different forms
    case FORM_CHANGES:
      ret = {
        ...state,
        form: action.form
      };
      break;
    default:
      ret = state;
  }

  if (action.type.match(/^\[form\]/)) console.log('[form] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'form': reducer
};
export const getForm = createFeatureSelector<State>('form');
export const getFormDataState = createSelector(
  getForm,
  (state: State) => state.formData
);
export const getFormState = createSelector(
  getForm,
  (state: State) => state.form
);
