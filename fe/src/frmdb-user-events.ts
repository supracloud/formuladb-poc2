import { DataObj } from "@domain/metadata/data_obj";
import { AutocompleteAttrs } from "./autocomplete/autocomplete.component";

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

export interface UserEnteredAutocompleteText {
    type: "frmdbUserEnteredAutocompleteText";
    currentObjId: string;
    text: string;
    referencedObj
    targetAttrs: AutocompleteAttrs;
}

export interface UserChoseAutocompleteOption {
    type: "frmdbUserChoseAutocompleteOption";
    option: {};
    targetAttrs: AutocompleteAttrs;
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
    | UserEnteredAutocompleteText
    | UserChoseAutocompleteOption
    ;
