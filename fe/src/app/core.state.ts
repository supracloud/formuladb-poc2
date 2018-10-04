/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

export const NotReadonly = '_NotReadonly_';

export interface CoreState {
  appReadonly: string;
  themeColorPalette: string;
}

export const coreInitialState: CoreState = {
  appReadonly: "application initializing...",
  themeColorPalette: "default",
};

export const CoreAppReadonlyActionN = "[core] CoreAppReadonlyAction";
export const CoreThemeColorPaletteChangedActionN = "[core] CoreThemeColorPaletteChangedAction";


export class CoreAppReadonlyAction implements Action {
  readonly type = CoreAppReadonlyActionN;

  constructor(public appReadonly: string) { }
}

export class CoreThemeColorPaletteChangedAction implements Action {
  readonly type = CoreThemeColorPaletteChangedActionN;

  constructor(public themeColorPalette: string) { }
}


export type CoresActions =
  | CoreAppReadonlyAction
  | CoreThemeColorPaletteChangedAction
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
    case CoreThemeColorPaletteChangedActionN:
      ret = {
        ...state,
        themeColorPalette: action.themeColorPalette,
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
export const getThemeColorPalette = createSelector(
  getCoreState,
  (state: CoreState) => state.themeColorPalette
);
