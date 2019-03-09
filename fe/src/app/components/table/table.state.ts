/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from "@core/domain/metadata/data_obj";
import { Table } from "@core/domain/uimetadata/table";
import { ChangeObj, applyChanges } from "@core/domain/change_obj";


export { DataObj };
export { Table };
export { ChangeObj, applyChanges };

import * as events from "@core/domain/event";
import { Entity } from "@core/domain/metadata/entity";

export interface FormulaHighlightedColumns {
  [tableName: string]: { 
    [columnName: string]: string 
  }
}

export interface TableState {
  entity: Entity | undefined;
  table: Table;
  selectedColumnName: string | undefined;
  formulaHighlightedColumns: FormulaHighlightedColumns;
}

export const tableInitialState: TableState = {
  entity: undefined,
  table: {} as Table,
  selectedColumnName: undefined,
  formulaHighlightedColumns: {},
};

export const TableFromBackendActionN = "[table] TableFromBackendAction";
export const ServerEventModifiedTableN = events.ServerEventModifiedTableN;
export const UserSelectRowN = "[table] UserSelectRow";
export const ServerEventNewRowN = "[table] ServerEventNewRow";
export const UserSelectCellN = "[table] UserSelectCell";

export { ServerEventDeleteFormData } from '../form.state';

export class ServerEventModifiedTable implements Action {
  readonly type = ServerEventModifiedTableN;
  public event: events.ServerEventModifiedTableEvent;

  constructor(public table: Table) {
    this.event = new events.ServerEventModifiedTableEvent(table);
  }
}

export class TableFormBackendAction implements Action {
  readonly type = TableFromBackendActionN;

  constructor(public table: Table) { }
}

export class UserSelectRow implements Action {
  readonly type = UserSelectRowN;

  constructor(public dataObj: DataObj) { }
}

export class ServerEventNewRow implements Action {
  readonly type = ServerEventNewRowN;

  constructor(type_: string) { }
}

export class UserSelectCell implements Action {
  readonly type = UserSelectCellN;

  constructor(public columnName: string | undefined) { }
}

export type TableActions =
  | TableFormBackendAction
  | ServerEventModifiedTable
  | UserSelectRow
  | ServerEventNewRow
  | UserSelectCell
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
    //user navigates to different tables
    case TableFromBackendActionN:
      ret = {
        ...state,
        table: action.table,
      };
      break;
    case UserSelectCellN:
      ret = {
        ...state,
        selectedColumnName: action.columnName,
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
export const getTableEntityState = createSelector(
  getTable,
  (state: TableState) => state ? state.entity : tableInitialState.entity
);

export const getTableState = createSelector(
  getTable,
  (state: TableState) => state ? state.table : tableInitialState.table
);
export const getTableHighlightColumns = createSelector(
  getTable,
  (state: TableState) => state ? state.formulaHighlightedColumns : tableInitialState.formulaHighlightedColumns
);
