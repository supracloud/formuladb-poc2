import { DataObj } from "@core/domain/metadata/data_obj";
import { NodeElement } from "@core/domain/uimetadata/form";
import { Table } from "@core/domain/uimetadata/table";

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
    nodeElement: NodeElement | null;
}
export interface UserSelectedCell {
    type: 'UserSelectedCell';
    columnName: string;
}
export interface UserSelectedRow {
    type: 'UserSelectedRow';
    dataObj: DataObj;
}
export interface UserModifiedTableUi {
    type: 'UserModifiedTableUi';
    table: Table;
}
export interface UserCollapsedNavItem {
    type: 'UserCollapsedNavItem';
    id: string;
    collapsed: boolean;
}


export type FrmdbUserEvent = 
    | UserModifiedFormData
    | UserDeletedFormData
    | UserDraggedFormElement
    | UserSelectedCell
    | UserSelectedRow
    | UserModifiedTableUi
    | UserCollapsedNavItem
;
