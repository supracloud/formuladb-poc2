/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../common/domain/metadata/data_obj';
import { Form } from '../common/domain/uimetadata/form';
import { ChangeObj, applyChanges } from '../common/domain/change_obj';
import * as events from '../common/domain/event';

export { DataObj };
export { Form };
export { ChangeObj, applyChanges };

export interface FormState {
  form: Form | null;
  formData: DataObj | null;
  eventFromBackend: events.MwzEvents | null;
  formReadOnly: boolean;
  formEditMode: boolean;
  highlighted: any;
}

export const formInitialState: FormState = {
  form: null,
  formData: null,
  eventFromBackend: null,
  formReadOnly: true,
  formEditMode: false,
  highlighted: null
};

export const FormDataFromBackendActionN = "[form] FormDataFromBackendAction";
export const ResetFormDataFromBackendActionN = "[form] ResetFormDataFromBackendAction";
export const FormNotifFromBackendActionN = "[form] FormNotifFromBackendAction";
export const FormFromBackendActionN = "[form] FormFromBackendAction";
export const FormItemHighlightActionN = "[form] FormItemHighlightAction";
export const FormSwitchEditModeActionN = "[form] FormSwitchEditModeAction";
export const UserActionEditedFormDataN = events.UserActionEditedFormDataN;
export const UserActionEditedFormN = events.UserActionEditedFormN;


export class FormDataFromBackendAction implements Action {
  readonly type = FormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class ResetFormDataFromBackendAction implements Action {
  readonly type = ResetFormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class FormSwitchEditModeAction implements Action {
  readonly type = FormSwitchEditModeActionN;

  constructor(public editMode: boolean) { }
}

export class FormItemHighlightAction implements Action {
  readonly type = FormItemHighlightActionN;

  constructor(public id: any) { }
}

export class FormNotifFromBackendAction implements Action {
  readonly type = FormNotifFromBackendActionN;

  constructor(public event: events.UserActionEditedFormEvent | events.UserActionEditedFormDataEvent) { }
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
  | ResetFormDataFromBackendAction
  | FormFromBackendAction
  | FormNotifFromBackendAction
  | UserActionEditedForm
  | UserActionEditedFormData
  | FormItemHighlightAction
  | FormSwitchEditModeAction
  ;

function mergeSubObj(parentObj: DataObj | null, obj: DataObj): boolean {
  if (parentObj == null) return false;

  for (let key of Object.keys(parentObj)) {
    if (typeof parentObj[key] === 'object' && parentObj[key]._id === obj._id) {
      parentObj[key] = obj;
      return true;
    }
  }
  for (let key of Object.keys(parentObj)) {
    if (typeof parentObj[key] === 'object' && mergeSubObj(parentObj[key], obj)) {
      return true;
    }
  }
  return false;
}

/**
 * TODO: check if immutable.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function formReducer(state = formInitialState, action: FormActions): FormState {
  let ret: FormState = state;
  switch (action.type) {
    case ResetFormDataFromBackendActionN:
      ret = { 
        ...state, 
        formData: action.obj
      };
      break;
    //changes from the server are coming: properties modified
    case FormDataFromBackendActionN:
      if (null == state.formData || state.formData._id === action.obj._id) ret = { ...state, formData: action.obj };
      else {
        let formData = {
          ...state.formData
        };
        mergeSubObj(formData, action.obj);
        ret = {
          ...state,
          formData: formData,
        };
      }
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

    case FormItemHighlightActionN:
      ret = {
        ...state,
        highlighted: action.id,
      };
      break;

    case FormSwitchEditModeActionN:
      ret = {
        ...state,
        formEditMode: action.editMode,
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
export const getHighlightedId = createSelector(
  getForm,
  (state: FormState) => state.highlighted
);
export const isEditMode = createSelector(
  getForm,
  (state: FormState) => state.formEditMode
);