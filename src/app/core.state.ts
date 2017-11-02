import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from './domain/metadata/data_obj';

export const NotReadonly = '_NotReadonly_';

export interface CoreState {
  appReadonly: string;
}

export const coreInitialState: CoreState = {
  appReadonly: "application initializing...",
};

export const CoreAppReadonlyActionN = "[core] CoreAppReadonlyAction";


export class CoreAppReadonlyAction implements Action {
  readonly type = CoreAppReadonlyActionN;

  constructor(public appReadonly: string) { }
}


export type CoresActions =
  | CoreAppReadonlyAction
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
  }

  if (action.type.match(/^\[core\]/)) console.log('[core] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'core': coreReducer
};
export const getCoreState = createFeatureSelector<CoreState>('core');

