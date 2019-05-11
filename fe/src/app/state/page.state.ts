/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { Page, FrmdbLy, FrmdbLook } from '@core/domain/uimetadata/page';
import { PageChangedAction, PageChangedActionN, AutoLayoutPageAction, PageDropAction, NodeElementDeleteAction, NodeElementSwitchTypeAction } from '../actions/page.user.actions';
import { NodeType, NodeElement, isNodeElementWithChildren, NodeElementWithChildren, GridRow } from '@core/domain/uimetadata/node-elements';
import { HasId } from '@core/domain/key_value_obj';
import { PageFromBackendActionN, PageFromBackendAction, PageDataFromBackendAction, ResetPageDataFromBackendAction, ResetPageDataFromBackendActionN } from '../actions/form.backend.actions';
import { mergeSubObj } from '@core/domain/metadata/data_obj';
import { isFormPage } from '@core/domain/uimetadata/form-page';
import { autoLayoutFormPage, autoLayoutTablePage } from '../components/auto-layout.service';
import { isTablePage } from '@core/domain/uimetadata/table-page';

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
| AutoLayoutPageAction
| PageDropAction
| NodeElementDeleteAction
| NodeElementSwitchTypeAction
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
        case "[page] PageDataFromBackendAction":
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
        case "[page] AutoLayoutPageAction":
        ret = {
            ...state,
            page: isFormPage(state.page) ? autoLayoutFormPage(state.page, undefined, action.layout) : 
            isTablePage(state.page) ? autoLayoutTablePage(state.page, undefined, action.layout) : 
            state.page,
        }
        break;
        case ResetPageDataFromBackendActionN:
        ret = {
            ...state,
            pageData: action.obj
        };
        break;
        
        case "[page] PageDropAction":
        if (state.page) {
            let newPage = _.cloneDeep(state.page);
            let movedEl = removeRecursive(newPage, action.removedFromNodeId, action.movedNodeId);
            if (!movedEl) {console.warn("Could not move not found element ", action); return state}
            addRecursive(newPage, movedEl, action.addedToNodeId, action.addedToPos);
            cleanupRowsAndCols(newPage);
            return { 
                ...state,
                page: newPage,
            }
        } else return state;
        
        case "[page] NodeElementDeleteAction":
        if (state.page) {
            removeRecursive(state.page, action.removedFromNodeId, action.movedNodeId);
        }
        return state;
        case "[page] NodeElementSwitchTypeAction":
        if (state.page) {
            modifyRecursive(state.page, n => n._id === action.payload.node._id, n => console.log(n))//TODO implement conversion
        }
        return state;
    }
    
    if (action.type.match(/^\[page\]/)) console.log('[page] reducer:', state, action, ret, state == ret, state.page == ret.page);
    return ret;
}



function removeRecursive(tree: NodeElementWithChildren, removedFromNodeId: string, movedNodeId: string): NodeElement | null {
    let ret: NodeElement | null = null;
    if (tree.childNodes && tree._id === removedFromNodeId) {
        let newChildNodes: NodeElement[] = [];
        for (let child of tree.childNodes || []) {
            if (child._id === movedNodeId) {
                ret = child;
            } else newChildNodes.push(child);
        }
        tree.childNodes = newChildNodes;
    } else {
        for (let child of tree.childNodes || []) {
            if (isNodeElementWithChildren(child)) {
                ret = removeRecursive(child, removedFromNodeId, movedNodeId);
                if (ret) break;
            }
        }
    }
    return ret;
}

const modifyRecursive = (tree: NodeElement, filter: (each: NodeElement) => boolean, action: (found: NodeElement) => void) => {
    if (filter(tree)) action(tree);
    if (isNodeElementWithChildren(tree)) {
        if (tree.childNodes && tree.childNodes.length > 0) {
            tree.childNodes.forEach(c => modifyRecursive(c, filter, action));
        }
    }
}

function addRecursive(tree: NodeElementWithChildren, movedEl: NodeElement, addedToNodeId: string, pos: number) {
    let newChildNodes: NodeElement[] = [];

    for (let child of tree.childNodes || []) {

        if (child._id === addedToNodeId) {
            if (NodeType.grid_row === child.nodeType) {
                child.childNodes.splice(pos, 0, {
                    _id: movedEl._id + '-col',
                    nodeType: NodeType.grid_col,
                    childNodes: [movedEl],
                });
                newChildNodes.push(child);
            } else if (NodeType.grid_col === child.nodeType) {
                child.childNodes = child.childNodes || [];
                child.childNodes.splice(pos, 0, movedEl);
                newChildNodes.push(child);
            } else {
                let newChild: GridRow = {
                    _id: child._id + "-row",
                    nodeType: NodeType.grid_row,
                    childNodes: [
                        {
                            _id: child._id + "-row-col",
                            nodeType: NodeType.grid_col,
                            childNodes: [child],
                        },
                        {
                            _id: child._id + "-row-col",
                            nodeType: NodeType.grid_col,
                            childNodes: [movedEl],
                        }
                    ]
                }
                newChildNodes.push(newChild);
            }
        } else {
            newChildNodes.push(child);
            if (isNodeElementWithChildren(child)) addRecursive(child, movedEl, addedToNodeId, pos);
        }
    }

    tree.childNodes = newChildNodes;
}

function cleanupRowsAndCols(tree: NodeElementWithChildren) {
    let newChildNodes: NodeElement[] = [];
    for (let child of tree.childNodes || []) {
        if ((NodeType.grid_row == child.nodeType 
                && (!child.childNodes || child.childNodes.length == 0 
                    || !child.childNodes.find(n => n.nodeType == NodeType.grid_col 
                            && n.childNodes != null && n.childNodes.length > 0)))
            || (NodeType.grid_col == child.nodeType && (!child.childNodes || child.childNodes.length == 0))
        ) {
            //remove empty rows and cols
        } else {
            newChildNodes.push(child);
            if (isNodeElementWithChildren(child)) cleanupRowsAndCols(child);
        }
    }
    tree.childNodes = newChildNodes;
}

/**
* Link with global application state
*/
export const reducers = {
    'page': pageReducer
};
export const getPageStateBase = createFeatureSelector<PageState>('page');
export const getPageState = createSelector(
    getPageStateBase,
    (state: PageState) => state.page
    );
    export const getPageDataState = createSelector(
        getPageStateBase,
        (state: PageState) => state.pageData
        );
        