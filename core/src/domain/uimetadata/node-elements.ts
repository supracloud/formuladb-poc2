/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Pn, Entity, EntityStateGraph, FormulaExpression } from "../metadata/entity";
import * as _ from 'lodash';
import { FrmdbLy } from './page';

export enum NodeType {
    root_node = "root_node",
    grid_row = "grid_row",
    grid_col = "grid_col",
    form_input = "form_input",
    form_autocomplete = "form_autocomplete",
    form_tabs = "form_tabs",
    form_table = "form_table",
    data_grid = "form_data_grid",
    form_chart = "form_chart",
    form_datepicker = "form_datepicker",
    form_timepicker = "form_timepicker",
    date_range_picker = "date_range_picker",
    form_text = "form_text",
    form_enum = "form_enum",
    form_state = "form_state",
    card = "card",
    jumbotron = "jumbotron",
    header = "header",
    list = "list",
    gallery = "gallery",
    calendar = "calendar",
    image = "image",
    icon = "icon",
    media = "media",
    v_nav = "v_nav",
    h_nav = "h_nav",
    timeline = "timeline",
    dropdown = "dropdown",
    v_filters = "v_filters",
    h_filters = "h_filters",
    button = "button",
    button_group = "button_group",
    card_container = "card_container",
    ly_admin = "ly_admin",
    ly_cover = "ly_cover",
}


export type ScalarNodeElement = 
    | FormInput
    | FormAutocomplete
    | DataGrid
    | FormDatepicker
    | FormTimepicker
    | DateRangePicker
    | FormText
    | Button
    | Icon
    | Image
;
export type NodeElement =
    | ScalarNodeElement
    | RootNode
    | FormTabs
    | FormTable
    | FormChart
    | ButtonGroup
    | Calendar
    | Card
    | Jumbotron
    | Header
    | Dropdown
    | FormEnum
    | FormState
    | Gallery
    | HFilters
    | GridRow
    | HNav
    | List
    | Media
    | Timeline
    | VFilters
    | GridCol
    | VNav
    | CardContainer
    ;

export type NodeElementWithChildren = RootNode | GridRow | GridCol | FormTable | FormTabs | Card;
export function isNodeElementWithChildren(nodeEl: NodeElement): nodeEl is NodeElementWithChildren {
    return nodeEl.nodeType === NodeType.root_node
        || nodeEl.nodeType === NodeType.grid_row
        || nodeEl.nodeType === NodeType.grid_col
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.card
    ;
}

export interface TableNodeElementBase extends BaseNode {
    refEntityAlias?: string;
    refEntityName: string;
    
    autocompleteProperties?: ({refPropertyName: string} & FormInput)[];

    tableName?: string;

    childNodes?: NodeElement[];

    clickAction?: "select-table-row" | "autocomplete";
    dblClickAction?: "edit-row";
}
export type TableNodeElement = DataGrid | FormTable | FormTabs | CardContainer;
export function isTableNodeElement(nodeEl: NodeElement): nodeEl is TableNodeElement {
    return nodeEl.nodeType === NodeType.data_grid
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.card_container;
}

export type PropertyNodeElement = FormInput | FormTimepicker | FormDatepicker;
export function isPropertyNodeElement(nodeEl: NodeElement): nodeEl is PropertyNodeElement {
    return nodeEl.nodeType === NodeType.form_input
        || nodeEl.nodeType === NodeType.form_timepicker
        || nodeEl.nodeType === NodeType.form_datepicker
        || nodeEl.nodeType === NodeType.form_text
        || nodeEl.nodeType === NodeType.form_autocomplete
        || nodeEl.nodeType === NodeType.image
    ;
}

export function isKnownNodeElement(nodeType: string) {
    return Object.keys(NodeType).includes(nodeType);
}

export function getChildPath(nodeEl: NodeElement) {
    if (isPropertyNodeElement(nodeEl)) return nodeEl.propertyName;
    if (isTableNodeElement(nodeEl)) return nodeEl.tableName;
    return '';
}

export interface BaseNode extends SubObj {
    wcol?: | "col-1" | "col-2"  | "col-3"  | "col-4" | "col-5" | "col-6" | "col-7" | "col-8" | "col-9" | "col-10" | "col-11" | "col-12";
    wrem?: | "wrem-0" | "wrem-5" | "wrem-10" | "wrem-15" | "wrem-20" | "wrem-25" | "wrem-30" | "wrem-35" | "wrem-40" | "wrem-45" | "wrem-50" | "wrem-55" | "wrem-60" | "wrem-65" | "wrem-70" | "wrem-75" | "wrem-80" | "wrem-85" | "wrem-90" | "wrem-95" | "wrem-100";
    misc?: ("row")[];
}

export interface FormInput extends BaseNode {
    nodeType: NodeType.form_input;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING;
}
export interface FormText extends BaseNode {
    nodeType: NodeType.form_text;
    _id: string;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING;
    representation: "title" | "h1" | "h2" | "h3" | "h4" | "paragraph" | "caption" | "jumbo" | "link" | "_id" | "string";
    uppercase?: boolean;
}
export interface FormAutocomplete extends BaseNode {
    nodeType: NodeType.form_autocomplete;
    _id: string;
    noLabel?: boolean;
    refEntityAlias?: string;
    refEntityName: string;
    refPropertyName: string;
    propertyName: string;
}
export interface FormTabs extends TableNodeElementBase {
    nodeType: NodeType.form_tabs;
    _id: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export interface FormCard extends BaseNode {
    nodeType: NodeType.form_tabs;
    _id: string;
    tableName: string;
    tabNameFormPath: string;
    childNodes?: NodeElement[];
}
export interface FormTable extends TableNodeElementBase {
    nodeType: NodeType.form_table;
    _id: string;
    tableName: string;
    childNodes?: NodeElement[];
}

export interface Card extends BaseNode {
    nodeType: NodeType.card;
    childNodes?: NodeElement[];
}

export interface CardContainer extends TableNodeElementBase {
    nodeType: NodeType.card_container;
    layout?: FrmdbLy.ly_cards | FrmdbLy.ly_grid | FrmdbLy.ly_fpattern | FrmdbLy.ly_zigzagpattern | FrmdbLy.ly_mosaic;
    card: Card;
}

export interface TableColumn extends BaseNode {
    _id: string;
    width?: number;
    sort?: string;
    filter?: ColumnFilter;
    skipExportExcel?: boolean;
    name: string;
    type: Pn;
}
export interface ColumnFilter {
    operator: string;
    value: string;
}
export interface DataGrid extends TableNodeElementBase {
    nodeType: NodeType.data_grid;
    _id: string;
    conditionalFormatting?: {[cssClassName: string]: FormulaExpression};
    headerHeight?: number;
    headerBackground?: string;
    columns?: TableColumn[];
    layout?: FrmdbLy.ly_admin | FrmdbLy.ly_fpattern;
}

export interface FormDatepicker extends BaseNode {
    nodeType: NodeType.form_datepicker;
    _id: string;
    propertyName: string;
}

export interface FormTimepicker extends BaseNode {
    nodeType: NodeType.form_timepicker;
    _id: string;
    propertyName: string;
}


export interface DateRangePicker extends BaseNode {
    nodeType: NodeType.date_range_picker;
    _id: string;
    startPropertyName: string;
    endPropertyName: string;
}

export interface FormChart extends BaseNode {
    nodeType: NodeType.form_chart;
    _id: string;
    tableName: string;
    chartType: string;
    width: number;
    height: number;
    xPropertyName: string;
    yPropertyName: string;
    groupByPropertyName?: string;
}

export interface Button extends BaseNode {
    nodeType: NodeType.button;
    _id: string;
    propertyName: string;
}


export interface ButtonGroup extends BaseNode {
    nodeType: NodeType.button_group;
    _id: string;
}


export interface Calendar extends BaseNode {
    nodeType: NodeType.calendar;
    _id: string;
}


export interface Header extends BaseNode {
    nodeType: NodeType.header;
    _id: string;
    childNodes?: NodeElement[];
}

export interface Jumbotron extends BaseNode {
    nodeType: NodeType.jumbotron;
    _id: string;
    childNodes?: NodeElement[];
}


export interface Dropdown extends BaseNode {
    nodeType: NodeType.dropdown;
    _id: string;
}


export interface FormEnum extends BaseNode {
    nodeType: NodeType.form_enum;
    _id: string;
}


export interface FormState extends BaseNode {
    nodeType: NodeType.form_state;
    _id: string;
}


export interface Gallery extends BaseNode {
    nodeType: NodeType.gallery;
    _id: string;
}


export interface HFilters extends BaseNode {
    nodeType: NodeType.h_filters;
    _id: string;
}


export interface GridRow extends BaseNode {
    nodeType: NodeType.grid_row;
    _id: string;
    childNodes: NodeElement[];
}

export interface RootNode extends BaseNode {
    nodeType: NodeType.root_node;
    _id: string;
    childNodes?: NodeElement[];
}

export interface HNav extends BaseNode {
    nodeType: NodeType.h_nav;
    _id: string;
}


export interface Icon extends BaseNode {
    nodeType: NodeType.icon;
    _id: string;
}


export interface Image extends BaseNode {
    nodeType: NodeType.image;
    _id: string;
    propertyName: string;
}


export interface List extends BaseNode {
    nodeType: NodeType.list;
    _id: string;
}


export interface Media extends BaseNode {
    nodeType: NodeType.media;
    _id: string;
}


export interface Timeline extends BaseNode {
    nodeType: NodeType.timeline;
    _id: string;
}


export interface VFilters extends BaseNode {
    nodeType: NodeType.v_filters;
    _id: string;
}


export interface GridCol extends BaseNode {
    nodeType: NodeType.grid_col;
    _id: string;
    childNodes?: NodeElement[];
}


export interface VNav extends BaseNode {
    nodeType: NodeType.v_nav;
    _id: string;
}

