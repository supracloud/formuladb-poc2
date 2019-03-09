/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';
import { Dictioary_ro } from '../crosscutting/i18n/dictionary_ro';
import { Dictioary_en } from '../crosscutting/i18n/dictionary_en';

let Dictionaries = {
    ro: Dictioary_ro,
    en: Dictioary_en,
}

export interface I18nState {
    dictionary: { [literal: string]: string }
    locale: string
}

export const i18nInitialState: I18nState = {
    dictionary: Dictioary_en,
    locale: 'en'
};

export const I18nLoadDictionaryN = "[i18n] I18nLoadDictionary";
export const I18nChangeLocaleN = "[i18n] I18nChangeLocale";


export class I18nLoadDictionary implements Action {
    readonly type = I18nLoadDictionaryN;

    constructor(public dictionary: { [literal: string]: string }) { }
}

export class I18nChangeLocale implements Action {
    readonly type = I18nChangeLocaleN;

    constructor(public locale: string) { }
}


export type I18nActions = 
    | I18nLoadDictionary
    | I18nChangeLocale
;

/**
 * 
 * @param state 
 * @param action 
 */
export function i18nReducer(state = i18nInitialState, action: I18nActions): I18nState {
    let ret: I18nState = state;
    switch (action.type) {
        //changes from the server are coming: properties modified
        case I18nLoadDictionaryN:
            ret = {
                ...state,
                dictionary: action.dictionary,
            };
            break;
        case I18nChangeLocaleN:
            ret = {
                ...state,
                locale: action.locale,
                dictionary: Dictionaries[action.locale]
            };
        break;
    }

    // if (action.type.match(/^\[form\]/)) console.log('[form] reducer:', state, action, ret);
    return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
    'i18n': i18nReducer
};
export const getI18n = createFeatureSelector<I18nState>('i18n');
export const getDictionary = createSelector(
    getI18n,
    (state: I18nState) => state ? state.dictionary : i18nInitialState.dictionary
);