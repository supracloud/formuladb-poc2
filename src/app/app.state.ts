import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector, ActionReducer } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from '@ngrx/router-store';

import { Form } from './common/domain/uimetadata/form';
import { Table } from './common/domain/uimetadata/table';
import { DataObj } from './common/domain/metadata/data_obj';
import { Entity } from './common/domain/metadata/entity';
import { ChangeObj, applyChanges } from './common/domain/change_obj';


export { Form };
export { Table };
export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as fromCore from './core.state';
import * as fromEntity from "./entity-state";
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';

export * from "./entity-state";
export * from "./table/table.state";
export * from "./form/form.state";
export * from "./core.state";

export interface RouterState {
  url: string;
  queryParams: Params;
  path: string;
}

export interface AppState {
  'router': RouterReducerState<RouterState>;
  'core': fromCore.CoreState;
  'entity': fromEntity.EntityState;
  'table': fromTable.TableState;
  'form': fromForm.FormState;
};

export type AppActions =
| fromCore.CoresActions
| fromEntity.EntityActions
| fromTable.TableActions
| fromForm.FormActions
;

export class CustomSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    console.log(routerState);
    const { url } = routerState;
    const queryParams = routerState.root.queryParams;
    const path = queryParams['path'];

    // Only return an object including the URL and query params
    // instead of the entire snapshot
    return { url, queryParams, path };
  }
}

export function appMetaReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function(state: AppState, action: AppActions) {
    let updatedState = state;
    if (action.type === fromCore.CoreAppReadonlyActionN) {
      updatedState = {
        ...state,
        form: {
          ...state.form,
          formReadOnly: action.appReadonly != fromCore.NotReadonly
        }
      }
    }
    let newState = reducer(updatedState, action);
    console.log("%c ***** " + action.type + " ***************************************************************************************************************************", 
      "color: blue; font-size: 135%; font-weight: bold; text-decoration: underline;", 
      new Date(), action, state, newState); 
    
    return newState;
  };
}

export const reducers = {
  'router': routerReducer,
  ...fromCore.reducers,
  ...fromEntity.reducers,
  ...fromTable.reducers,
  ...fromForm.reducers
};


export function parseUrl(url: string): { path: string, id: string } {
  let match = url.match(/^\/(\w+)\/?(\w+)\/?([%\w:-]+)?/)
  let path: string = null;
  let id: string = null;
  if (null != match) {
    path = match[1];
    if (match.length >=3 && match[2] != null) path = path + '/' + match[2];
    if (match.length >= 4 && match[3] != null) id = match[3];
  } else {
    return {path: "/General/Actor", id: null};
  }

  return { path: path, id: id };

}