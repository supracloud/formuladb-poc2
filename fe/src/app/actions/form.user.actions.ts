/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { Form, NodeElement, NodeType, FormAutocomplete } from "@core/domain/uimetadata/form";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";
import * as events from "@core/domain/event";

export { DataObj };
export { Form };
export { ChangeObj, applyChanges };

export const FormDropActionN = "[form] FormDropAction";
export const FormDeleteActionN = "[form] FormDeleteAction";
export const FormSwitchTypeActionN = "[form] FormSwitchTypeAction";
export const FormAddActionN = '[form] FormAddAction';
export const UserChoseAutocompleteOptionN = '[form] UserChoseAutocompleteOptionN';


export class FormDropAction implements Action {
  readonly type = FormDropActionN;

  constructor(
    public removedFromNodeId: string,
    public removedFromPos: number,
    public movedNodeId: string,
    public addedToNodeId: string,
    public addedToPos: number) { }
}

export class FormDeleteAction implements Action {
  readonly type = FormDeleteActionN;

  constructor(public removedFromNodeId: string, public movedNodeId: string) { }
}

export class FormAddAction implements Action {
  readonly type = FormAddActionN;

  constructor(public payload: { what: NodeElement, to: NodeElement }) { }
}

export class FormSwitchTypeAction implements Action {
  readonly type = FormSwitchTypeActionN;

  constructor(public payload: { node: NodeElement, toType: NodeType }) { }
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
