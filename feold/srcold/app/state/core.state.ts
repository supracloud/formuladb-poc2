/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';
import { FeUser } from '@domain/user';

export const NotReadonly = '_NotReadonly_';

export interface CoreState {
  appReadonly: string;
  developerMode: boolean;
  user?: FeUser,
}

export const coreInitialState: CoreState = {
  appReadonly: "application initializing...",
  developerMode: false,
  user: { _id: '$User~~PUBLIC', isDeveloper: true },
};

export const CoreAppReadonlyActionN = "[core] CoreAppReadonlyAction";
export const CoreToggleDeveloperModeActionN = "[core] CoreToggleDeveloperModeAction";

export class CoreAppReadonlyAction implements Action {
  readonly type = CoreAppReadonlyActionN;

  constructor(public appReadonly: string) { }
}

export class CoreToggleDeveloperModeAction implements Action {
  readonly type = CoreToggleDeveloperModeActionN;

  constructor() { }
}

export type CoresActions =
  | CoreAppReadonlyAction
  | CoreToggleDeveloperModeAction
  ;

/**
 * 
 * @param state 
 * @param action 
 */
export function coreReducer(state = coreInitialState, action: CoresActions): CoreState {
  let ret: CoreState = state;
  switch (action.type) {
    //changes from the server are commning: properties modified
    case CoreAppReadonlyActionN:
      ret = {
        ...state,
        appReadonly: action.appReadonly,
      };
      break;
    case CoreToggleDeveloperModeActionN:
      ret = {
        ...state,
        developerMode: !state.developerMode,
      };
      break;
  }

  // if (action.type.match(/^\[core\]/)) console.log('[core] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'core': coreReducer
};
export const getCoreState = createFeatureSelector<CoreState>('core');
export const getDeveloperMode = createSelector(
  getCoreState,
  (state: CoreState) => state ? state.developerMode : false
);
export const getUser = createSelector(
  getCoreState,
  (state: CoreState) => state ? state.user : undefined
);
