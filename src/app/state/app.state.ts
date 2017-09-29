import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from '@ngrx/router-store';

import { Form } from '../domain/uimetadata/form';
import { Table } from '../domain/uimetadata/table';
import { DataObj } from '../domain/metadata/data_obj';
import { Entity } from '../domain/metadata/entity';


export type Form = Form;
export type Table = Table;
export type DataObj = DataObj;
export type Entity = Entity;

export interface RouterState {
  url: string;
  queryParams: Params;
  path: string;
}

export class MwzState {
    entity?: Entity;
    form?: Form;
    formData?: DataObj;
    table?: Table;
    tableData?: DataObj[];
    entities?: Entity[];

    constructor(obj: MwzState = {} as MwzState) {
        Object.assign(this, obj);
    }
}
export class AppState {
    public mwz?: MwzState;
    public routerReducer?: RouterReducerState<RouterState>;

    constructor(obj: AppState = {} as AppState) {
        Object.assign(this, obj);
    }
}

export class CustomSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    const { url } = routerState;
    const queryParams = routerState.root.queryParams;
    const path = queryParams['path'];

    // Only return an object including the URL and query params
    // instead of the entire snapshot
    return { url, queryParams, path };
  }
}

///////////////////////////////////////////////////////////////////////////
// Actions
///////////////////////////////////////////////////////////////////////////
export class SetForm implements Action {
  readonly type = SetForm.name;

  constructor(public form: Form) {}
}

export class SetFormData implements Action {
  readonly type = SetFormData.name;

  constructor(public obj: DataObj) {}
}

export class ChangeCurrentEntity implements Action {
  readonly type = ChangeCurrentEntity.name;

  constructor() {}
}


export type AppAction = Action | SetForm | SetFormData;

///////////////////////////////////////////////////////////////////////////
// Reducers
///////////////////////////////////////////////////////////////////////////

function mwzReducer(state: MwzState, action: AppAction): MwzState {
	if (action instanceof SetForm) {
        return new MwzState({form: action.form});
    } else if (action instanceof SetFormData) {
        return new MwzState({formData: action.obj});
    } else if (action instanceof ChangeCurrentEntity) {
        return state;//changing of metadata will be done by the backend service
    } else {
        return state;
    }
}

export const reducers: ActionReducerMap<AppState> = {
    routerReducer: routerReducer,
    mwz: mwzReducer,
};

///////////////////////////////////////////////////////////////////////////
// Selectors
///////////////////////////////////////////////////////////////////////////

