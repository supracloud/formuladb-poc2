import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';
import {
  StoreRouterConnectingModule,
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from '@ngrx/router-store';

import { Form } from './domain/uimetadata/form';
import { Table } from './domain/uimetadata/table';
import { DataObj } from './domain/metadata/data_obj';
import { Entity } from './domain/metadata/entity';
import { ChangeObj, applyChanges } from './domain/change_obj';


export { Form };
export { Table };
export { DataObj };
export { Entity };
export { ChangeObj, applyChanges };

import * as fromNav from './navigation/navigation.state';
import * as fromTable from './table/table.state';
import * as fromForm from './form/form.state';

export interface RouterState {
  url: string;
  queryParams: Params;
  path: string;
}

export interface AppState {
  'router': RouterReducerState<RouterState>;
  'nav': fromNav.State;
  'table': fromTable.State;
  'form': fromForm.State;
};

export class CustomSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    console.log(routerState);
    const { url } = routerState;
    const queryParams = routerState.root.queryParams;
    const path = queryParams['path'];

    // Only return an object including the URL and query params
    // instead of the entire snapshot
    return { url, queryParams, path };
  }
}

export const reducers = {
  'router': routerReducer,
  ...fromNav.reducers,
  ...fromTable.reducers,
  ...fromForm.reducers
};
