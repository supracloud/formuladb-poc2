import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { Table } from '../domain/uimetadata/table';
import { ChangeObj, applyChanges } from '../domain/change_obj';


export { DataObj };
export { Table };
export { ChangeObj, applyChanges };


export interface State {
  table: Table;
  tableData: DataObj[];
}

export const initialState: State = {
  table: {} as Table,
  tableData: [] as DataObj[],
};

export const TABLE_DATA_CHANGES = "[table] TableDataChangesAction";
export const TABLE_CHANGES = "[table] TableChangesAction";


export class TableDataChangesAction implements Action {
  readonly type = TABLE_DATA_CHANGES;

  constructor(public changes: ChangeObj<DataObj>[]) { }
}

export class TableChangesAction implements Action {
  readonly type = TABLE_CHANGES;

  constructor(public table: Table) { }
}

export type Actions =
  | TableDataChangesAction
  | TableChangesAction
  ;

/**
 * TODO: check if immutable.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function reducer(state = initialState, action: Actions): State {
  console.log('[table] reducer:', state, action);
  let ret: State = state;
  switch (action.type) {
    //changes from the server are commning: added/removed entities
    case TABLE_DATA_CHANGES:
      ret = {
        ...state,
        tableData: applyChanges<DataObj>(state.tableData, action.changes),
      };
      break;
    //user navigates to different tables
    case TABLE_CHANGES:
      ret = {
        ...state,
        table: action.table
      };
      break
  }

  console.log('[table] reducer returns:', ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'table': reducer
};
export const getTableState = createFeatureSelector<State>('table');
export const getTableDataState = createSelector(
  getTableState,
  (state: State) => state.tableData
);
export const getTableMetaState = createSelector(
  getTableState,
  (state: State) => state.table
);
