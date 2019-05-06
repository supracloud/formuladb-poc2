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
import { Page } from '@core/domain/uimetadata/page';
import { HasId } from '@core/domain/key_value_obj';

export { DataObj };
export { FormPage };
export { ChangeObj, applyChanges };


export const ResetPageDataFromBackendActionN = "[page] ResetPageDataFromBackendAction";
export const FormNotifFromBackendActionN = "[page] FormNotifFromBackendAction";
export const PageFromBackendActionN = "[page] PageFromBackendAction";


export class PageFromBackendAction implements Action {
  readonly type = PageFromBackendActionN;

  constructor(public page: Page) { }
}


export class PageDataFromBackendAction implements Action {
  readonly type = "[page] PageDataFromBackendAction";

  constructor(public obj: HasId) { }
}

export class ResetPageDataFromBackendAction implements Action {
  readonly type = ResetPageDataFromBackendActionN;

  constructor(public obj: DataObj) { }
}

export class FormNotifFromBackendAction implements Action {
  readonly type = FormNotifFromBackendActionN;

  constructor(public event: events.ServerEventModifiedFormEvent | events.ServerEventModifiedFormDataEvent) { }
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

