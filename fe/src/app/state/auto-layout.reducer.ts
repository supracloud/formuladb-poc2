import * as _ from 'lodash';
import { AppState, AppActions } from "./app.state";
import { PageChangedActionN } from "../actions/page.user.actions";
import { autoLayoutForm } from "../components/auto-layout-form";
import { FormFromBackendActionN } from '../actions/form.backend.actions';

export function autoLayoutReducer(state: AppState, action: AppActions): AppState {
    let ret: AppState = state;
    switch (action.type) {
        case PageChangedActionN:
            if (!state.entity.selectedEntity || state.entity.entities.length == 0) break;
            ret = {
                ...state,
                form: {
                    ...state.form,
                    form: autoLayoutForm(null, state.entity.selectedEntity, _.keyBy(state.entity.entities, '_id'), action.page),
                },
                table: {
                    ...state.table,
                    table: {
                        ...state.table.table,
                        page: {
                            ...state.table.table.page,
                            layout: action.page.layout,
                        },
                    }
                },
            }
            break;
        case FormFromBackendActionN:
            ret = {
                ...state,
                page: {
                    ...state.page,
                    layout: action.form.page.layout!,
                }
            }

            break;
    }

    return ret;
}