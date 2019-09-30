import { DataObj } from "@domain/metadata/data_obj";
import { AutocompleteAttrs } from "./autocomplete/autocomplete.component";
import { Entity, EntityProperty } from "@domain/metadata/entity";

export interface UserModifiedFormData {
    type: 'UserModifiedFormData';
    obj: DataObj;
}
export interface UserDeletedFormData {
    type: 'UserDeletedFormData';
    obj: DataObj;
}
export interface UserDraggedFormElement {
    type: 'UserDraggedFormElement';
    // nodel: NodeElement | null;
}
export interface UserSelectedCell {
    type: 'UserSelectedCell';
    columnName: string;
}
export interface UserSelectedRow {
    type: 'UserSelectedRow';
    dataObj: DataObj;
}
export interface UserDblClickRow {
    type: 'UserDblClickRow';
    dataObj: DataObj;
}

export interface UserAddRow {
    type: 'UserAddRow';
    entityId: string;
}
export interface UserDeleteRow {
    type: 'UserDeleteRow';
    dataObj: DataObj;
}
export interface UserModifiedTableUi {
    type: 'UserModifiedTableUi';
    // table: DataGrid;
}
export interface UserCollapsedNavItem {
    type: 'UserCollapsedNavItem';
    id: string;
    collapsed: boolean;
}

export interface UserNavigation {
    type: 'frmdbUserNavigation';
    path: string;
}

export interface UserDeleteColumn {
    type: 'UserDeleteColumn';
    tableName: string;
    columnName: string;
}

export interface FrmdbSelectChange {
    type: 'FrmdbSelectChange';
    oldValue: string;
    newValue: string;
}

export interface FrmdbColumnChanged {
    type: 'FrmdbColumnChanged';
    table: Entity;
    newColumn: EntityProperty;
}

export interface FrmdbAddColumn {
    type: 'FrmdbAddColumn';
}

export interface FrmdbAddPageElement {
    type: 'FrmdbAddPageElement';
    el: HTMLElement;
}

export interface FrmdbRemovePageElement {
    type: 'FrmdbRemovePageElement';
    el: HTMLElement;
}

export type FrmdbUserEvent =
    | UserModifiedFormData
    | UserDeletedFormData
    | UserDraggedFormElement
    | UserSelectedCell
    | UserSelectedRow
    | UserDblClickRow
    | UserAddRow
    | UserDeleteRow
    | UserModifiedTableUi
    | UserCollapsedNavItem
    | UserNavigation
    | UserDeleteColumn
    | FrmdbSelectChange
    | FrmdbColumnChanged
    | FrmdbAddColumn
    | FrmdbAddPageElement
    | FrmdbRemovePageElement
    ;
