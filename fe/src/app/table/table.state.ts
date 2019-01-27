/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Action, createSelector, createFeatureSelector } from '@ngrx/store';

import { DataObj } from '@storage/domain/metadata/data_obj';
import { Table } from '@storage/domain/uimetadata/table';
import { ChangeObj, applyChanges } from '@storage/domain/change_obj';


export { DataObj };
export { Table };
export { ChangeObj, applyChanges };

import * as events from '@storage/domain/event';
import { Entity } from "@storage/domain/metadata/entity";

export interface TableState {
  entity: Entity | undefined;
  table: Table;
  tableData: DataObj[];
  selectedColumnName: string | undefined;
  formulaHighlightedColumns: {[tableName: string]: {[columnName: string]: string}};
}

export const tableInitialState: TableState = {
  entity: undefined,
  table: {} as Table,
  selectedColumnName: undefined,
  tableData: [] as DataObj[],
  formulaHighlightedColumns: {},
};

export const TableDataFromBackendActionN = "[table] TableDataFromBackendAction";
export const RestTableDataFromBackendActionN = "[table] ResetTableDataFromBackendAction";
export const TableFromBackendActionN = "[table] TableFromBackendAction";
export const ServerEventModifiedTableN = events.ServerEventModifiedTableN;
export const ServerEventSelectedRowForEditingN = "[table] ServerEventSelectedRowForEditing";
export const ServerEventNewRowN = "[table] ServerEventNewRow";
export const UserSelectCellN = "[table] UserSelectCell";

export class TableDataFromBackendAction implements Action {
  readonly type = TableDataFromBackendActionN;

  constructor(public changes: ChangeObj<DataObj>[]) { }
}

export class ResetTableDataFromBackendAction implements Action {
  readonly type = RestTableDataFromBackendActionN;

  constructor(public entity: Entity, public tableData: DataObj[]) { }
}

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

export class ServerEventSelectedRowForEditing implements Action {
  readonly type = ServerEventSelectedRowForEditingN;

  constructor(public row: DataObj) { }
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
  | TableDataFromBackendAction
  | ResetTableDataFromBackendAction
  | TableFormBackendAction
  | ServerEventModifiedTable
  | ServerEventSelectedRowForEditing
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
        entity: action.entity,
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
  (state: TableState) => state.entity
);
export const getTableDataState = createSelector(
  getTable,
  (state: TableState) => state.tableData
);
export const getTableState = createSelector(
  getTable,
  (state: TableState) => state.table
);
export const getTableHighlightColumns = createSelector(
  getTable,
  (state: TableState) => state.formulaHighlightedColumns
);
