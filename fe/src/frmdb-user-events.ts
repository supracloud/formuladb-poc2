import { DataObj } from "@domain/metadata/data_obj";
import { Entity, EntityProperty } from "@domain/metadata/entity";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";

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
export interface UserFilterTable {
    type: 'UserFilterTable';
    tableName: string;
    filterModel: SimpleAddHocQuery['filterModel'];
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

export interface FrmdbDeleteColumn {
    type: 'FrmdbDeleteColumn';
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

export interface FrmdbAddPageElementStart {
    type: 'FrmdbAddPageElementStart';
    htmlElement: HTMLElement;
}

export interface FrmdbMovePageElementStart {
    type: 'FrmdbMovePageElementStart';
    el: HTMLElement;
}

export interface FrmdbRemovePageElement {
    type: 'FrmdbRemovePageElement';
    el: HTMLElement;
}

export interface FrmdbHoverPageElement {
    type: 'FrmdbHoverPageElement';
    el: HTMLElement;
}

export interface FrmdbSelectPageElement {
    type: 'FrmdbSelectPageElement';
    el: HTMLElement | null;
}

export interface FrmdbEditWysiwygPageElement {
    type: 'FrmdbEditWysiwygPageElement';
    el: HTMLElement;
}

export interface FrmdbModifyPageElement {
    type: 'FrmdbModifyPageElement';
    value: string | number | boolean;
}

export interface FrmdbIconsCssChanged {
    type: 'FrmdbIconsCssChanged';
}

export interface FrmdbFormulaEditorOn {
    type: 'FrmdbFormulaEditorOn';
}
export interface FrmdbFormulaEditorOff {
    type: 'FrmdbFormulaEditorOff';
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
    | UserFilterTable
    | UserCollapsedNavItem
    | UserNavigation
    | FrmdbDeleteColumn
    | FrmdbSelectChange
    | FrmdbColumnChanged
    | FrmdbAddColumn
    | FrmdbAddPageElement
    | FrmdbRemovePageElement
    | FrmdbHoverPageElement
    | FrmdbSelectPageElement
    | FrmdbEditWysiwygPageElement
    | FrmdbModifyPageElement
    | FrmdbIconsCssChanged
    | FrmdbAddPageElementStart
    | FrmdbMovePageElementStart
    | FrmdbFormulaEditorOn
    | FrmdbFormulaEditorOff
;
