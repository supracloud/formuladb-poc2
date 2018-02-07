import { BaseObj } from '../base_obj';
import { EntityProperty } from "../metadata/entity";
import { Label } from './label';

export class NodeElementAttributes {
    copiedProperties?: string[];//this only applies to entities
    tabNameFormPath?: string;//used for form_tabs to select which field gives the name for the tab
    [x: string]: any;
}

export enum NodeType { 
    form_grid              = "form_grid"        ,
    form_grid_row          = "form_grid-row"    ,
    form_grid_col          = "form_grid-col"    ,
    form_input             = "form_input"       ,
    form_autocomplete      = "form_autocomplete",
    form_tabs              = "form_tabs"        ,
    form_table             = "form_table"       ,
    form_datepicker        = "form_datepicker"  ,
    form_timepicker        = "form_timepicker"  ,
}

// export interface NodeElementBase {
//     form_grid?: FormGrid;
//     form_grid_row: FormGridRow;
//     form_grid_col: FormGridCol;
//     form_input: FormInput;
//     form_autocomplete: FormAutocomplete;
//     form_tabs: FormTabs;
//     form_table: FormTable;
//     form_datepicker: FormDatepicker;
//     form_timepicker: FormTimepicker;
// }

export class FormGrid {
    readonly nodeType = NodeType.form_grid;
    childNodes?: NodeElement[];
}
export class FormGridRow {
    readonly nodeType = NodeType.form_grid_row;
    childNodes?: NodeElement[];
}
export class FormGridCol {
    readonly nodeType = NodeType.form_grid_col;
    childNodes?: NodeElement[];
}
export class FormInput {
    readonly nodeType = NodeType.form_input;
    propertyName: string;
}
export class FormAutocomplete {
    readonly nodeType = NodeType.form_autocomplete;
    entityName: string;
    copiedProperties?: string[];
}
export class FormTabs {
    readonly nodeType = NodeType.form_tabs;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export class FormTable {
    readonly nodeType = NodeType.form_table;
    tableName: string;
    childNodes?: NodeElement[];
}
export class FormDatepicker {
    readonly nodeType = NodeType.form_datepicker;
    propertyName: string;
}
export class FormTimepicker {
    readonly nodeType = NodeType.form_timepicker;
    propertyName: string;
}

export class Form extends BaseObj {
    readonly type_ = 'Form_';
    childNodes?: NodeElement[];
}

export type NodeElement =
| FormGrid
| FormGridRow
| FormGridCol
| FormInput
| FormAutocomplete
| FormTabs
| FormTable
| FormDatepicker
| FormTimepicker
;