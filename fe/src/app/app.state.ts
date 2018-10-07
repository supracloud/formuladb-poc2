/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

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
import * as fromTheme from './theme.state';
import * as fromEntity from "./entity-state";
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';
import * as fromI18n from './crosscutting/i18n/i18n.state';

export * from "./entity-state";
export * from "./table/table.state";
export * from "./form/form.state";
export * from "./core.state";
export * from "./theme.state";
export * from "./crosscutting/i18n/i18n.state";

export interface RouterState {
  url: string;
  queryParams: Params;
  path: string;
}

export interface AppState {
  'router': RouterReducerState<RouterState>;
  'core': fromCore.CoreState;
  'theme': fromTheme.ThemeState;
  'entity': fromEntity.EntityState;
  'table': fromTable.TableState;
  'form': fromForm.FormState;
  'i18n': fromI18n.I18nState;
};

export type AppActions =
  | fromCore.CoresActions
  | fromTheme.ThemesActions
  | fromEntity.EntityActions
  | fromTable.TableActions
  | fromForm.FormActions
  | fromI18n.I18nActions
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
  return function (state: AppState, action: AppActions) {
    let updatedState = state;
    if (action.type === fromCore.CoreAppReadonlyActionN) {
      updatedState = {
        ...state,
        form: {
          ...state.form,
          formReadOnly: action.appReadonly != fromCore.NotReadonly,
        }
      }
    } else if (action.type === fromCore.CoreToggleDeveloperModeActionN) {
      updatedState = {
        ...state,
        form: {
          ...state.form,
          formEditMode: !state.core.developerMode,
        }
      }
    }
    let newState = reducer(updatedState, action);
    console.log("%c " + action.type + " ACTION DISPATCHED.", 
      "color: blue; font-size: 135%; font-weight: bold; text-decoration: underline;", 
      new Date(), action, state, newState); 
    
    return newState;
  };
}

export const reducers = {
  'router': routerReducer,
  ...fromCore.reducers,
  ...fromTheme.reducers,
  ...fromEntity.reducers,
  ...fromTable.reducers,
  ...fromForm.reducers,
  ...fromI18n.reducers,
};


export function parseUrl(url: string): { path: string | null, id: string | null } {
  let match = url.match(/^\/\d+\/([\w_]+)\/?([-_%\w\d~]+)?/)
  let path: string | null = null;
  let id: string | null = null;
  if (null != match) {
    path = match[1];
    if (match.length >= 3 && match[2] != null) id = match[2];
  } else {
    return { path: "General___Actor", id: null };//FIXME: remove hardcode, altough actors will always be available in a FormulaDB app
  }

  return { path: path, id: id };

}