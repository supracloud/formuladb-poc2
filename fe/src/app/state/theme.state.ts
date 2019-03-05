/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

export interface ThemeState {
  themeColorPalette: string;
  sidebarImageUrl: string;
}

export const themeInitialState: ThemeState = {
  themeColorPalette: "default",
  sidebarImageUrl: "/assets/sidebar_images/sidebar-8.jpg",//TODO: set default per theme !
};

export const ThemeColorPaletteChangedActionN = "[theme] ThemeColorPaletteChangedAction";
export const ThemeSidebarImageUrlChangedActionN = "[theme] ThemeSidebarImageUrlChangedAction";


export class ThemeColorPaletteChangedAction implements Action {
  readonly type = ThemeColorPaletteChangedActionN;

  constructor(public themeColorPalette: string) { }
}

export class ThemeSidebarImageUrlChangedAction implements Action {
  readonly type = ThemeSidebarImageUrlChangedActionN;

  constructor(public sidebarImageUrl: string) { }
}


export type ThemesActions =
  | ThemeColorPaletteChangedAction
  | ThemeSidebarImageUrlChangedAction
  ;

/**
 * 
 * @param state 
 * @param action 
 */
export function themeReducer(state = themeInitialState, action: ThemesActions): ThemeState {
  let ret: ThemeState = state;
  switch (action.type) {
    case ThemeColorPaletteChangedActionN:
      ret = {
        ...state,
        themeColorPalette: action.themeColorPalette,
      };
      break;
    case ThemeSidebarImageUrlChangedActionN:
      ret = {
        ...state,
        sidebarImageUrl: action.sidebarImageUrl,
      };
      break;
  }

  // if (action.type.match(/^\[theme\]/)) console.log('[theme] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'theme': themeReducer
};
export const getThemeState = createFeatureSelector<ThemeState>('theme');
export const getThemeColorPalette = createSelector(
  getThemeState,
  (state: ThemeState) => state ? state.themeColorPalette : themeInitialState.themeColorPalette
);
export const getSidebarImageUrl = createSelector(
  getThemeState,
  (state: ThemeState) => state ? state.sidebarImageUrl : themeInitialState.sidebarImageUrl
);
