import { AutocompleteAttrs } from "./autocomplete/autocomplete.component";

export class AutoCompleteState {
    controls: { [refPropertyName: string]: AutocompleteAttrs } = {};
    options: {}[] = [];
    selectedOption: {} | null;

    constructor(public currentObjId: string, public entityAlias: string, public currentControl: AutocompleteAttrs) { }
}

export interface AppStateI {
    autoCompleteState: AutoCompleteState | null;
}

const AppState: AppStateI = {
    autoCompleteState: null,
}

export const APP_STATE = new Proxy(AppState, {
    set: function(obj, prop: string | number | symbol, value, receiver) {
        let ret = Reflect.set(obj, prop, value, receiver);
        
        //TODO: render changed to the UI

        return ret;
    }
});
