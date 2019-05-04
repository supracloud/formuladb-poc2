import { DataObj } from "@core/domain/metadata/data_obj";
import { TablePage } from "@core/domain/uimetadata/table-page";
import { NodeElement, FormDataGrid } from "../components/node-element/node_modules/@core/domain/uimetadata/node-elements";

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
    nodel: NodeElement | null;
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
    table: FormDataGrid;
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
