/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Page, FrmdbLy, FrmdbLook } from '@core/domain/uimetadata/page';
import { PageChangedAction, PageChangedActionN } from '../actions/page.user.actions';
import { NodeType } from '@core/domain/uimetadata/node-elements';
import { HasId } from '@core/domain/key_value_obj';
import { PageFromBackendActionN, PageFromBackendAction, PageDataFromBackendAction, PageDataFromBackendActionN, ResetPageDataFromBackendAction, ResetPageDataFromBackendActionN } from '../actions/form.backend.actions';
import { mergeSubObj } from '@core/domain/metadata/data_obj';

export interface PageState {
  page: Page;
  pageData: HasId | null;
}

export const pageInitialState: PageState = {
  page: {
    _id: "",
    nodeType: NodeType.root_node,
    colorPalette: "default",
    sidebarImageUrl: "/assets/img/sidebar/sidebar-8.jpg",//TODO: set default per page !
    brandName: "FormulaDB",
    logoUrl: '/assets/logo7.png',
    cssUrl: null,
    layout: FrmdbLy.ly_admin,
    look: FrmdbLook.lk_Approachable,
  },
  pageData: null,
};


export type PageActions =
  | PageChangedAction
  | PageFromBackendAction
  | PageDataFromBackendAction
  | ResetPageDataFromBackendAction
  ;

/**
 * 
 * @param state 
 * @param action 
 */
export function pageReducer(state = pageInitialState, action: PageActions): PageState {
  let ret: PageState = state;
  switch (action.type) {
    case PageChangedActionN:
      ret = {
        ...state,
        page: action.page,
      };
      break;
    case PageFromBackendActionN:
      ret = {
        ...state,
        page: action.page,
      };
      break;
    case PageDataFromBackendActionN:
      if (null == state.pageData || state.pageData._id === action.obj._id) ret = { ...state, pageData: action.obj };
      else {
          let pageData = {
              ...state.pageData
          };
          mergeSubObj(pageData, action.obj);
          ret = {
              ...state,
              pageData: pageData,
          };
      }
      break;
    case ResetPageDataFromBackendActionN:
      ret = {
          ...state,
          pageData: action.obj
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
  'page': pageReducer
};
const getPageStateBase = createFeatureSelector<PageState>('page');
export const getPageState = createSelector(
  getPageStateBase,
  (state: PageState) => state.page
);
export const getPageDataState = createSelector(
  getPageStateBase,
  (state: PageState) => state.pageData
);
