import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { Form } from '../domain/uimetadata/form';
import { ChangeObj, applyChanges } from '../domain/change_obj';


export { DataObj };
export { Form };
export { ChangeObj, applyChanges };


export interface FormState {
  form: Form;
  formData: DataObj;
  formDataFromBackend: DataObj;
  formReadOnly: string;
}

export const formInitialState: FormState = {
  form: {} as Form,
  formData: {} as DataObj,
  formDataFromBackend: {} as DataObj,
  formReadOnly: null,
};

export const FormDataFromBackendActionN = "[form] FormDataFromBackendAction";
export const FormFromBackendActionN = "[form] FormFromBackendAction";
export const UserActionEditedFormN = "[form] UserActionEditedForm";
export const UserActionEditedFormDataN = "[form] UserActionEditedFormData";


export class FormDataFromBackendAction implements Action {
  readonly type = FormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class FormFromBackendAction implements Action {
  readonly type = FormFromBackendActionN;

  constructor(public form: Form) { }
}

export class UserActionEditedForm implements Action {
  readonly type = UserActionEditedFormN;

  constructor(public form: Form) { }
}

export class UserActionEditedFormData implements Action {
  readonly type = UserActionEditedFormDataN;

  constructor(public obj: DataObj) { }
}


export type FormActions =
  | FormDataFromBackendAction
  | FormFromBackendAction
  | UserActionEditedForm
  | UserActionEditedFormData
  ;

/**
 * TODO: check if immuform.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function formReducer(state = formInitialState, action: FormActions): FormState {
  let ret: FormState = state;
  switch (action.type) {
    //changes from the server are commning: properties modified
    case FormDataFromBackendActionN:
      ret = {
        ...state,
        formData: action.obj,
      };
      break;
    //user navigates to different forms
    case FormFromBackendActionN:
      ret = {
        form: action.form,
        ...state,
      };
      break;
  }

  if (action.type.match(/^\[form\]/)) console.log('[form] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'form': formReducer
};
export const getForm = createFeatureSelector<FormState>('form');
export const getFormDataState = createSelector(
  getForm,
  (state: FormState) => state.formData
);
export const getFormState = createSelector(
  getForm,
  (state: FormState) => state.form
);
