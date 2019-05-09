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

export const FormAddActionN = '[form] FormAddAction';
export const UserChoseAutocompleteOptionN = '[form] UserChoseAutocompleteOptionN';

export class FormAddAction implements Action {
  readonly type = FormAddActionN;

  constructor(public payload: { what: NodeElement, to: NodeElement }) { }
}

export const UserEnteredAutocompleteTextN = '[form] UserEnteredAutocompleteText';
export class UserEnteredAutocompleteText implements Action {
  readonly type = UserEnteredAutocompleteTextN;

  constructor(public currentObjId: string, public text: string, public formAutocompleteNode: FormAutocomplete) { }
}

export class UserChoseAutocompleteOption implements Action {
  readonly type = UserChoseAutocompleteOptionN;

  constructor(public option: {}, public formAutocompleteNode: FormAutocomplete) { }
}
