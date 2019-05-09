/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj, mergeSubObj } from "@core/domain/metadata/data_obj";
import { FormPage } from "@core/domain/uimetadata/form-page";
import { NodeElement, isNodeElementWithChildren, NodeType, FormAutocomplete, NodeElementWithChildren } from "@core/domain/uimetadata/node-elements";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";
import * as events from "@core/domain/event";
import * as formUserActions from '../actions/form.user.actions';
import * as formServerActions from '../actions/form.backend.actions';
import * as _ from 'lodash';

export { DataObj };
export { FormPage };
export { ChangeObj, applyChanges };

export class AutoCompleteState {
    controls: {[refPropertyName: string]: FormAutocomplete} = {};
    options: {}[] = [];
    selectedOption: {} | null;

    constructor(public currentObjId: string, public entityAlias: string, public currentControl: FormAutocomplete) {}
}

export interface FormState {
    form: FormPage | null;
    formData: DataObj | null;
    eventFromBackend: events.MwzEvents | null;
    rdonly: boolean;
    autoCompleteState: AutoCompleteState | null;
}

export const formInitialState: FormState = {
    form: null,
    formData: null,
    eventFromBackend: null,
    rdonly: true,
    autoCompleteState: null,
};


export type FormActions =
    | formServerActions.ResetPageDataFromBackendAction
    | formServerActions.FormNotifFromBackendAction
    | formServerActions.FormAutoCompleteOptionsFromBackendAction
    | formUserActions.FormAddAction
    | formUserActions.UserEnteredAutocompleteText
    | formUserActions.UserChoseAutocompleteOption
    ;

/**
* 
* @param state 
* @param action 
*/
export function formReducer(state = formInitialState, action: FormActions): FormState {
    let ret: FormState = state;
    switch (action.type) {
        //changes from the server are coming: properties modified
        case formServerActions.FormNotifFromBackendActionN:
            ret = {
                ...state,
                eventFromBackend: action.event,
            };
            break;
        case formServerActions.FormAutoCompleteOptionsFromBackendActionN:
            ret = {...state};
            let incomingEntityName = action.formAutocomplete.refEntityAlias || action.formAutocomplete.refEntityName;
            if (!ret.autoCompleteState || ret.autoCompleteState.entityAlias !== incomingEntityName || ret.autoCompleteState.currentObjId !== action.currentObjId) {
                console.warn("Internal check failed for FormAutoCompleteOptionsFromBackendAction, autocomplete from backend does not match the state:", ret.autoCompleteState, action);
            } else {
                ret.autoCompleteState = {
                   ...ret.autoCompleteState, 
                   options: action.rows,
                };
            }
            break;
        case formUserActions.UserEnteredAutocompleteTextN:
            ret = {...state};
            setAutoCompleteState(action.currentObjId, ret, action.formAutocompleteNode);
            break;
        case formUserActions.UserChoseAutocompleteOptionN:
            if (!state.autoCompleteState || !state.autoCompleteState.options || !_.find(state.autoCompleteState.options, action.option) ) {
                console.warn("Internal check failed for UserChoseAutocompleteOption, autocomplete from backend does not match the state:", ret.autoCompleteState, action);
            } else {
                ret = {
                    ...state,
                    autoCompleteState: {
                        ...state.autoCompleteState,
                        selectedOption: action.option,
                    },
                };
            }
            break;
        case formServerActions.FormAutoCompleteOptionsFromBackendActionN:
            break;
    }

    // if (action.type.match(/^\[form\]/)) console.log('[form] reducer:', state, action, ret);
    return ret;
}


function setAutoCompleteState(currentObjId: string, state: FormState, autoCompleteNode: FormAutocomplete) {
    if (!state.form) return;
    state.autoCompleteState = new AutoCompleteState(currentObjId, autoCompleteNode.refEntityAlias || autoCompleteNode.refEntityName, autoCompleteNode);
    walkForm(state.form, state.autoCompleteState);
}
function walkForm(node: NodeElement, autoCompleteState: AutoCompleteState) {
    if (node.nodeType === NodeType.form_autocomplete) {
        let entityName = node.refEntityAlias || node.refEntityName;
        if (autoCompleteState.entityAlias === entityName) {
            autoCompleteState.controls[node.refPropertyName] = node;
        }
    } else if (isNodeElementWithChildren(node)) {
        for (let childNode of node.childNodes || []) {
            walkForm(childNode, autoCompleteState);
        }
    }
}

/**
* Link with global application state
*/
export const reducers = {
    'form': formReducer
};
export const getForm = createFeatureSelector<FormState>('form');
export const getFormDataState = createSelector(
    getForm,
    (state: FormState) => state ? state.formData : formInitialState.formData
);
export const getFormState = createSelector(
    getForm,
    (state: FormState) => state ? state.form : formInitialState.form
);
export const getFormReadOnly = createSelector(
    getForm,
    (state: FormState) => state ? state.rdonly : formInitialState.rdonly
);
export const getAutoCompleteState = createSelector(
    getForm,
    (state: FormState) => state ? state.autoCompleteState : formInitialState.autoCompleteState
);
