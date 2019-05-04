/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { FormPage } from "@core/domain/uimetadata/form-page";
import { NodeElement, NodeType, FormAutocomplete } from "@core/domain/uimetadata/node-elements";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";
import * as events from "@core/domain/event";

export { DataObj };
export { FormPage };
export { ChangeObj, applyChanges };


export const FormDataFromBackendActionN = "[form] FormDataFromBackendAction";
export const ResetFormDataFromBackendActionN = "[form] ResetFormDataFromBackendAction";
export const FormNotifFromBackendActionN = "[form] FormNotifFromBackendAction";
export const FormFromBackendActionN = "[form] FormFromBackendAction";

export class FormDataFromBackendAction implements Action {
  readonly type = FormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class ResetFormDataFromBackendAction implements Action {
  readonly type = ResetFormDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class FormNotifFromBackendAction implements Action {
  readonly type = FormNotifFromBackendActionN;

  constructor(public event: events.ServerEventModifiedFormEvent | events.ServerEventModifiedFormDataEvent) { }
}

export class FormFromBackendAction implements Action {
  readonly type = FormFromBackendActionN;

  constructor(public form: FormPage) { }
}

export const FormAutoCompleteOptionsFromBackendActionN = "[form] FormAutoCompleteOptionsFromBackendAction";
export class FormAutoCompleteOptionsFromBackendAction implements Action {
  readonly type = FormAutoCompleteOptionsFromBackendActionN;

  constructor(public currentObjId: string, public formAutocomplete: FormAutocomplete, public rows: {}[]) { }
}

export class ServerEventModifiedForm implements Action {
  readonly type = events.ServerEventModifiedFormN;
  public event: events.ServerEventModifiedFormEvent;

  constructor(public form: FormPage) {
    this.event = new events.ServerEventModifiedFormEvent(form);
  }
}

export class ServerEventModifiedFormData implements Action {
  readonly type = events.ServerEventModifiedFormDataN;
  public event: events.ServerEventModifiedFormDataEvent;

  constructor(obj: DataObj) {
    this.event = new events.ServerEventModifiedFormDataEvent(obj);
  }
}

