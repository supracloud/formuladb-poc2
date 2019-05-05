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
    form_data_grid = "form_data_grid",
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
    | FormDataGrid
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

export type NodeElementWithChildren = RootNode | GridRow | GridCol | FormTable | FormTabs | CardContainer;
export function isNodeElementWithChildren(nodeEl: NodeElement): nodeEl is NodeElementWithChildren {
    return nodeEl.nodeType === NodeType.root_node
        || nodeEl.nodeType === NodeType.grid_row
        || nodeEl.nodeType === NodeType.grid_col
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
    ;
}

export interface TableNodeElementBase extends SubObj {
    refEntityAlias?: string;
    refEntityName: string;
    
    autocompleteProperties?: ({refPropertyName: string} & FormInput)[];

    tableName?: string;

    childNodes?: NodeElement[];

    clickAction?: "select-table-row" | "autocomplete";
    dblClickAction?: "edit-row";
}
export type TableNodeElement = FormDataGrid | FormTable | FormTabs | CardContainer;
export function isTableNodeElement(nodeEl: NodeElement): nodeEl is TableNodeElement {
    return nodeEl.nodeType === NodeType.form_data_grid
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

export interface FormInput extends SubObj {
    nodeType: NodeType.form_input;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING;
}
export interface FormText extends SubObj {
    nodeType: NodeType.form_text;
    _id: string;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING;
    representation: "title" | "h1" | "h2" | "h3" | "h4" | "paragraph" | "caption" | "jumbo" | "link" | "_id" | "string";
    uppercase?: boolean;
}
export interface FormAutocomplete extends SubObj {
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
export interface FormCard extends SubObj {
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

interface CardBase extends SubObj {
    _id: string;
    horizontal?: boolean;
    childNodes?: NodeElement[];
}

export interface Card extends CardBase {
    nodeType: NodeType.card;
}

export interface CardContainer extends TableNodeElementBase {
    nodeType: NodeType.card_container;
    tableName: string;
    layout?: FrmdbLy.ly_cards | FrmdbLy.ly_grid | FrmdbLy.ly_fpattern | FrmdbLy.ly_zigzagpattern | FrmdbLy.ly_mosaic;
}

export interface TableColumn extends SubObj {
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
export interface FormDataGrid extends TableNodeElementBase {
    nodeType: NodeType.form_data_grid;
    _id: string;
    conditionalFormatting?: {[cssClassName: string]: FormulaExpression};
    headerHeight?: number;
    headerBackground?: string;
    columns?: TableColumn[];
    layout?: FrmdbLy.ly_admin | FrmdbLy.ly_fpattern;
}

export interface FormDatepicker extends SubObj {
    nodeType: NodeType.form_datepicker;
    _id: string;
    propertyName: string;
}

export interface FormTimepicker extends SubObj {
    nodeType: NodeType.form_timepicker;
    _id: string;
    propertyName: string;
}


export interface DateRangePicker extends SubObj {
    nodeType: NodeType.date_range_picker;
    _id: string;
    startPropertyName: string;
    endPropertyName: string;
}

export interface FormChart extends SubObj {
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

export interface Button extends SubObj {
    nodeType: NodeType.button;
    _id: string;
    propertyName: string;
}


export interface ButtonGroup extends SubObj {
    nodeType: NodeType.button_group;
    _id: string;
}


export interface Calendar extends SubObj {
    nodeType: NodeType.calendar;
    _id: string;
}


export interface Header extends SubObj {
    nodeType: NodeType.header;
    _id: string;
    childNodes?: NodeElement[];
}

export interface Jumbotron extends SubObj {
    nodeType: NodeType.jumbotron;
    _id: string;
    childNodes?: NodeElement[];
}


export interface Dropdown extends SubObj {
    nodeType: NodeType.dropdown;
    _id: string;
}


export interface FormEnum extends SubObj {
    nodeType: NodeType.form_enum;
    _id: string;
}


export interface FormState extends SubObj {
    nodeType: NodeType.form_state;
    _id: string;
}


export interface Gallery extends SubObj {
    nodeType: NodeType.gallery;
    _id: string;
}


export interface HFilters extends SubObj {
    nodeType: NodeType.h_filters;
    _id: string;
}


export interface GridRow extends SubObj {
    nodeType: NodeType.grid_row;
    _id: string;
    childNodes: NodeElement[];
}

export interface RootNode extends SubObj {
    nodeType: NodeType.root_node;
    _id: string;
    childNodes?: NodeElement[];
}

export interface HNav extends SubObj {
    nodeType: NodeType.h_nav;
    _id: string;
}


export interface Icon extends SubObj {
    nodeType: NodeType.icon;
    _id: string;
}


export interface Image extends SubObj {
    nodeType: NodeType.image;
    _id: string;
}


export interface List extends SubObj {
    nodeType: NodeType.list;
    _id: string;
}


export interface Media extends SubObj {
    nodeType: NodeType.media;
    _id: string;
}


export interface Timeline extends SubObj {
    nodeType: NodeType.timeline;
    _id: string;
}


export interface VFilters extends SubObj {
    nodeType: NodeType.v_filters;
    _id: string;
}


export interface GridCol extends SubObj {
    nodeType: NodeType.grid_col;
    _id: string;
    childNodes?: NodeElement[];
}


export interface VNav extends SubObj {
    nodeType: NodeType.v_nav;
    _id: string;
}

