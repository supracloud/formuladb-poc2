/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { ActionReducer } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from '@ngrx/router-store';

import { FormPage } from "@core/domain/uimetadata/form-page";
import { TablePage } from "@core/domain/uimetadata/table-page";
import { DataObj } from "@core/domain/metadata/data_obj";
import { Entity, Pn } from "@core/domain/metadata/entity";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";


export { FormPage };
export { TablePage };
export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as fromCore from './core.state';
import * as fromPage from './page.state';
import * as fromEntity from "./entity-state";
import * as fromTable from './table.state';
import * as fromForm from './form.state';
import * as fromI18n from './i18n.state';
import * as fromFormula from './formula.state'
import { AppServerEventAction } from '../actions/app.actions';
import { autoLayoutReducer } from './auto-layout.reducer';

export * from "./entity-state";
export * from "./table.state";
export * from "./form.state";
export * from "./core.state";
export * from "./page.state";
export * from "./i18n.state";
export * from './formula.state'

export interface RouterState {
  url: string;
  queryParams: Params;
  path: string;
}

export interface AppState {
  'router': RouterReducerState<RouterState>;
  'core': fromCore.CoreState;
  'page': fromPage.PageState;
  'entity': fromEntity.EntityState;
  'i18n': fromI18n.I18nState;
  'formula': fromFormula.FormulaState
};

export const appInitialState = {
  core: fromCore.coreInitialState,
  page: fromPage.pageInitialState,
  entity: fromEntity.entityInitialState,
  i18n: fromI18n.i18nInitialState,
  formula: fromFormula.formulaEditorInitialState,
};

export function getInitialState() {
  return { ...appInitialState };
}
export type AppActions =
  | AppServerEventAction
  | fromCore.CoresActions
  | fromPage.PageActions
  | fromEntity.EntityActions
  | fromTable.TableActions
  | fromForm.FormActions
  | fromI18n.I18nActions
  | fromFormula.FormulaActions
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
    let updatedState = autoLayoutReducer(state, action);

    if (action.type === fromCore.CoreAppReadonlyActionN) {
      updatedState = {
        ...state,
      }
    }
    //TODO: this should be an effect
    else if (action.type === fromTable.UserSelectCellN) {
      let selectedProperty = state.entity.selectedEntity && action.columnName ? state.entity.selectedEntity.props[action.columnName] : undefined;
      let editorExpr = fromFormula.entityProperty2Formula(selectedProperty);

      updatedState = {
        ...state,
        entity: {
          ...state.entity,
          selectedProperty: selectedProperty,
        },
        formula: {
          ...state.formula,
          selectedFormula: editorExpr,
          selectedProperty: selectedProperty,
        }
      }
    }
    else if (action.type === fromTable.UserSelectRowN) {
      updatedState = {
        ...state,
        formula: {
          ...state.formula,
          editedDataObj: action.dataObj,
        }
      }
    }
    else if (action.type === fromFormula.FormulaEditorToggleN) {
      updatedState = {
        ...state,
        formula: {
          ...state.formula,
          editedEntity: state.entity.selectedEntity,
          editedProperty: state.formula.selectedProperty,
        }
      }
    } else if (action.type == fromEntity.SelectedEntityActionN) {
      updatedState = {
        ...state,
      }
    }
    let newState = reducer(updatedState, action);
    if (!newState) {
      Object.assign(newState, appInitialState);
    }
    console.log("%c " + action.type + " ACTION DISPATCHED.", 
      "color: blue; font-size: 135%; font-weight: bold; text-decoration: underline;", 
      new Date(), action, state, newState, reducer); 
    
    return newState;
  };
}

export const reducers = {
  'router': routerReducer,
  ...fromCore.reducers,
  ...fromPage.reducers,
  ...fromEntity.reducers,
  ...fromTable.reducers,
  ...fromForm.reducers,
  ...fromI18n.reducers,
  ...fromFormula.reducers,
};


export function parseUrl(url: string): { appName: string | null, entityName: string | null, id: string | null } {
  let match = url.match(/^\/([\w_]+)\/?([\w_]+)?\/?([-_%\w\d~]+)?/)
  let appName: string | null = null;
  let entityName: string | null = null;
  let id: string | null = null;
  if (null != match) {
    appName = match[1];
    if (match.length >= 3 && match[2] != null) entityName = match[2];
    if (match.length >= 4 && match[3] != null) id = match[3];
  }

  return { appName, entityName, id };

}