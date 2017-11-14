import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { MwzEvents } from "../domain/event";
import { Form } from '../domain/uimetadata/form';
import { ChangeObj, applyChanges } from '../domain/change_obj';
import * as events from '../domain/event';

export { DataObj };
export { Form };
export { ChangeObj, applyChanges };

export interface FormState {
  form: Form;
  formData: DataObj;
  eventFromBackend: MwzEvents;
  formReadOnly: boolean;
}

export const formInitialState: FormState = {
  form: null,
  formData: null,
  eventFromBackend: null,
  formReadOnly: null,
};

export const FormDataFromBackendActionN = "[form] FormDataFromBackendAction";
export const FormNotifFromBackendActionN = "[form] FormNotifFromBackendAction";
export const FormFromBackendActionN = "[form] FormFromBackendAction";
export const UserActionEditedFormDataN = events.UserActionEditedFormDataN;
export const UserActionEditedFormN = events.UserActionEditedFormN;


export class FormDataFromBackendAction implements Action {
  readonly type = FormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class FormNotifFromBackendAction implements Action {
  readonly type = FormNotifFromBackendActionN;

  constructor(public event: MwzEvents) { }
}

export class FormFromBackendAction implements Action {
  readonly type = FormFromBackendActionN;

  constructor(public form: Form) { }
}

export class UserActionEditedForm implements Action {
  readonly type = UserActionEditedFormN;
  public event: events.UserActionEditedFormEvent;
  
  constructor(public form: Form) {
    this.event = new events.UserActionEditedFormEvent(form);
  }
}

export class UserActionEditedFormData implements Action {
  readonly type = UserActionEditedFormDataN;
  public event: events.UserActionEditedFormDataEvent;

  constructor(obj: DataObj) {
    this.event = new events.UserActionEditedFormDataEvent(obj);
  }
}


export type FormActions =
  | FormDataFromBackendAction
  | FormFromBackendAction
  | FormNotifFromBackendAction
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
    //changes from the server are coming: properties modified
    case FormDataFromBackendActionN:
      ret = {
        ...state,
        formData: action.obj,
      };
      break;
    case FormNotifFromBackendActionN:
      ret = {
        ...state,
        eventFromBackend: action.event,
      };
      break;
    //user navigates to different forms
    case FormFromBackendActionN:
      ret = {
        ...state,
        form: action.form,
      };
      break;
  }

  // if (action.type.match(/^\[form\]/)) console.log('[form] reducer:', state, action, ret);
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
export const getFormReadOnly = createSelector(
  getForm,
  (state: FormState) => state.formReadOnly
);
