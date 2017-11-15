import { Params, RouterStateSnapshot } from '@angular/router';
import { Action, ActionReducerMap, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '../domain/metadata/data_obj';
import { Table } from '../domain/uimetadata/table';
import { ChangeObj, applyChanges } from '../domain/change_obj';


export { DataObj };
export { Table };
export { ChangeObj, applyChanges };

import * as events from '../domain/event';

export interface TableState {
  table: Table;
  tableData: DataObj[];
}

export const tableInitialState: TableState = {
  table: {} as Table,
  tableData: [] as DataObj[],
};

export const TableDataFromBackendActionN = "[table] TableDataFromBackendAction";
export const RestTableDataFromBackendActionN = "[table] ResetTableDataFromBackendAction";
export const TableFromBackendActionN = "[table] TableFromBackendAction";
export const UserActionEditedTableN = events.UserActionEditedTableN;
export const UserActionSelectedRowForEditingN = "[table] UserActionSelectedRowForEditing";
export const UserActionNewRowN = "[table] UserActionNewRow";

export class TableDataFromBackendAction implements Action {
  readonly type = TableDataFromBackendActionN;

  constructor(public changes: ChangeObj<DataObj>[]) { }
}

export class ResetTableDataFromBackendAction implements Action {
  readonly type = RestTableDataFromBackendActionN;

  constructor(public tableData: DataObj[]) { }
}

export class UserActionEditedTable implements Action {
  readonly type = UserActionEditedTableN;
  public event: events.UserActionEditedTableEvent;

  constructor(public table: Table) {
    this.event = new events.UserActionEditedTableEvent(table);
  }
}

export class TableFormBackendAction implements Action {
  readonly type = TableFromBackendActionN;

  constructor(public table: Table) { }
}

export class UserActionSelectedRowForEditing implements Action {
  readonly type = UserActionSelectedRowForEditingN;

  constructor(public row: DataObj) { }
}

export class UserActionNewRow implements Action {
  readonly type = UserActionNewRowN;

  constructor(mwzType: string) { }
}

export type TableActions =
  | TableDataFromBackendAction
  | ResetTableDataFromBackendAction
  | TableFormBackendAction
  | UserActionEditedTable
  | UserActionSelectedRowForEditing
  | UserActionNewRow
  ;

/**
 * TODO: check if immutable.js is needed, probably only for large data sets
 * 
 * @param state 
 * @param action 
 */
export function tableReducer(state = tableInitialState, action: TableActions): TableState {
  let ret: TableState = state;
  switch (action.type) {
    //changes from the server are comning: added/removed entities
    case TableDataFromBackendActionN:
      ret = {
        ...state,
        tableData: applyChanges<DataObj>(state.tableData, action.changes),
      };
      break;
    case RestTableDataFromBackendActionN:
      ret = {
        ...state,
        tableData: action.tableData,
      };
      break;
    //user navigates to different tables
    case TableFromBackendActionN:
      ret = {
        ...state,
        table: action.table,
      };
      break;
  }

  // if (action.type.match(/^\[table\]/)) console.log('[table] reducer:', state, action, ret);
  return ret;
}

/**
 * Link with global application state
 */
export const reducers = {
  'table': tableReducer
};
export const getTable = createFeatureSelector<TableState>('table');
export const getTableDataState = createSelector(
  getTable,
  (state: TableState) => state.tableData
);
export const getTableState = createSelector(
  getTable,
  (state: TableState) => state.table
);
