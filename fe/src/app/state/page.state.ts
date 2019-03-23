/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';
import { Page, FrmdbLy, FrmdbLook } from '@core/domain/uimetadata/page';
import { PageChangedAction, PageChangedActionN } from '../actions/page.user.actions';

export interface PageState extends Page {
  pageType: 'table' | 'form' | null;
}

export const pageInitialState: PageState = {
  colorPalette: "default",
  sidebarImageUrl: "/assets/img/sidebar/sidebar-8.jpg",//TODO: set default per page !
  brandName: "FormulaDB",
  logoUrl: '/assets/logo7.png',
  cssUrl: null,
  layout: FrmdbLy.ly_admin,
  look: FrmdbLook.lk_Approachable,
  pageType: null,
};


export type PageActions =
  | PageChangedAction
  ;

/**
 * 
 * @param state 
 * @param action 
 */
export function themeReducer(state = pageInitialState, action: PageActions): PageState {
  let ret: PageState = state;
  switch (action.type) {
    case PageChangedActionN:
      ret = {
        pageType: state.pageType,
        ...action.page
      };
      break;
  }

  // if (action.type.match(/^\[page\]/)) console.log('[page] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'page': themeReducer
};
export const getPageState = createFeatureSelector<PageState>('page');
export const getPageLayout = createSelector(
  getPageState,
  (state: PageState) => state ? state.layout : pageInitialState.layout
);
export const getPageColorPalette = createSelector(
  getPageState,
  (state: PageState) => state ? state.colorPalette : pageInitialState.colorPalette
);
export const getPageSidebarImageUrl = createSelector(
  getPageState,
  (state: PageState) => state ? state.sidebarImageUrl : pageInitialState.sidebarImageUrl
);
