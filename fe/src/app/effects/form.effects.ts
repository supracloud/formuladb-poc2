/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import * as appState from '../state/app.state';
import { BackendService } from "./backend.service";
import { SimpleAddHocQuery } from '@core/key_value_store_i';
import { UserEnteredAutocompleteText, UserEnteredAutocompleteTextN } from '../actions/form.user.actions';
import { FormAutoCompleteOptionsFromBackendAction } from '../actions/form.backend.actions';


@Injectable()
export class FormEffects {

    constructor(
        private actions$: Actions,
        private store: Store<appState.AppState>,
        private backendService: BackendService,
    ) {

        this.actions$.pipe(ofType<UserEnteredAutocompleteText>(UserEnteredAutocompleteTextN)).subscribe(async (action) => {
            let referencedRows = await this.backendService.simpleAdHocQuery(action.formAutocompleteNode.refEntityName, {
                startRow: 0,
                endRow: 25,
                rowGroupCols: [],
                valueCols: [],
                pivotCols: [],
                pivotMode: false,
                groupKeys: [],
                filterModel: {
                    [action.formAutocompleteNode.refPropertyName]: {
                        type: "contains",
                        filter: action.text,
                        filterType: "text"
                    }
                },
                sortModel: [],
              } as SimpleAddHocQuery);
            this.store.dispatch(new FormAutoCompleteOptionsFromBackendAction(action.currentObjId, action.formAutocompleteNode, referencedRows));
        });
    }
}
