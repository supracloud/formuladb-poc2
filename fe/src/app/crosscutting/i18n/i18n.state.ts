/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';


export interface I18nState {
    dictionary: { [literal: string]: string }
    locale: string
}

export const i18nInitialState: I18nState = {
    dictionary: {
        'Enable-Developer-Mode':'Activare Mod Dezvoltator',
        'Disable-Developer-Mode':'Dezactivare Mod Dezvoltator',

        'Financial': 'Financiar',
        'Financial___Account': 'Financiar / Conturi',
        'Financial___Transaction': 'Financiar / Transactii',
        'General':'General',
        'General___Settings': 'General / Setari',
        'General___Actor': 'General / Actori',
        'General___Currency': 'General / Monezi',
        'General___Person': 'General / Persoane',
        'General___User': 'General / Utilizatori',
        'General___Client': 'General / Clienti',
        'Inventory':'Gestiune',
        'Inventory___Product': 'Gestiune / Produse',
        'Inventory___Product___Location': 'Gestiune / Locatii Produs',
        'Inventory___ProductUnit': 'Gestiune / Echipamente',
        'Inventory___Receipt': 'Gestiune / Intrari',
        'Inventory___Receipt___Item': 'Gestiune / Produse Intrari',
        'Inventory___Order': 'Gestiune / Comenzi',
        'Inventory___Order___Item': 'Gestiune / Produse Comenzi',
        'Reports': 'Rapoarte',
        'Reports___DetailedCentralizerReport': 'Rapoarte / Centralizator Lunar Detaliat',
        'Reports___ServiceCentralizerReport': 'Rapoarte / Centralizator Lunar Service',
        'Reports___TestReport1': 'Rapoarte / Raport de Test 1',
        'Forms': 'Formulare',
        'Forms___ServiceForm': 'Formulare / Formular Service',


        'DeliveryRate': 'Rata de livrare',
        orderNb: 'Nr Comanda',
        externalOrderNb: 'Nr extern Comanda',
        orderCreationDate: 'Data Creare Comanda',
        clientCode: 'Cod Client',
        client: 'Client',
        addressCode: 'Cod Adresa',
        addressName: 'Nume Adresa',
        location: 'Locatie',
        productCode: 'Cod Produs',
        barcode: 'Cod Bare',
        quantity: 'Cantitate',
        quantityError: 'Cantitate Eroare',
        price: 'Pret',

        'General___Currency!rate1!max': 'Maximum rate1 exceeded',
        'items$': 'Items',
    },
    locale: 'ro-RO'
};

export const I18nLoadDictionaryN = "[i18n] I18nLoadDictionary";


export class I18nLoadDictionary implements Action {
    readonly type = I18nLoadDictionaryN;

    constructor(public dictionary: { [literal: string]: string }) { }
}



export type I18nActions = I18nLoadDictionary
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
    (state: I18nState) => state.dictionary
);