/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { KeyValueObj, SubObj } from '../key_value_obj';
import { Pn, Entity, EntityStateGraph, FormulaExpression } from "../metadata/entity";
import * as _ from 'lodash';
import { PickOmit } from '../ts-utils';
import { FrmdbLayoutType } from './page';

export enum NodeType {
    root_node = "root_node",
    flex_layout = "flex_layout",
    grid_layout = "grid_layout",
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
    media_container = "media_container",
    v_nav = "v_nav",
    h_nav = "h_nav",
    timeline = "timeline",
    dropdown = "dropdown",
    v_filters = "v_filters",
    h_filters = "h_filters",
    button = "button",
    button_group = "button_group",
    grid_container = "grid_container",
}


export type ScalarNodeElement = 
    | FormInput
    | FormAutocomplete
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
    | TableNodeElement
    | RootNode
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
    | HNav
    | List
    | Media
    | MediaContainer
    | Timeline
    | VFilters
    | FlexLayout
    | GridLayout
    | VNav
    ;

export type NodeElementWithChildren = RootNode | FlexLayout | GridLayout | FormTable | FormTabs | Card | GridContainer | Media | MediaContainer;
export function isNodeElementWithChildren(nodeEl: NodeElement): nodeEl is NodeElementWithChildren {
    return nodeEl.nodeType === NodeType.root_node
        || nodeEl.nodeType === NodeType.flex_layout
        || nodeEl.nodeType === NodeType.grid_layout
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.card
        || nodeEl.nodeType === NodeType.grid_container
        || nodeEl.nodeType === NodeType.media
        || nodeEl.nodeType === NodeType.media_container
    ;
}

export interface TableNodeElementBase extends BaseNodeElement {
    refEntityAlias?: string;
    refEntityName: string;
    
    autocompleteProperties?: ({refPropertyName: string} & FormInput)[];

    tableName?: string;

    childNodes?: NodeElement[];

    clickAction?: "select-table-row" | "autocomplete";
    dblClickAction?: "edit-row";
}
export type TableNodeElement = DataGrid | FormTable | FormTabs | GridContainer;
export function isTableNodeElement(nodeEl: NodeElement): nodeEl is TableNodeElement {
    return nodeEl.nodeType === NodeType.data_grid
        || nodeEl.nodeType === NodeType.form_table
        || nodeEl.nodeType === NodeType.form_tabs
        || nodeEl.nodeType === NodeType.grid_container;
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

//for side in t b l r x y ""; do for i in 0 1 2 3 4 5 auto; do echo " | \"m${side}-${i}\""; done; done
export interface BaseNodeElement extends SubObj {
    colspan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    cssWidth?: | "wcol-1" | "wcol-2"  | "wcol-3"  | "wcol-4" | "wcol-5" | "wcol-6" | "wcol-7" | "wcol-8" | "wcol-9" | "wcol-10" | "wcol-11" | "wcol-12";
    cssWidthInChars?: | "wrem-0" | "wrem-5" | "wrem-10" | "wrem-15" | "wrem-20" | "wrem-25" | "wrem-30" | "wrem-35" | "wrem-40" | "wrem-45" | "wrem-50" | "wrem-55" | "wrem-60" | "wrem-65" | "wrem-70" | "wrem-75" | "wrem-80" | "wrem-85" | "wrem-90" | "wrem-95" | "wrem-100";
    cssWidthViewport?: | "vw-0" | "vw-5" | "vw-10" | "vw-15" | "vw-20" | "vw-25" | "vw-30" | "vw-35" | "vw-40" | "vw-45" | "vw-50" | "vw-55" | "vw-60" | "vw-65" | "vw-70" | "vw-75" | "vw-80" | "vw-85" | "vw-90" | "vw-95" | "vw-100";
    cssMaxHeightPercent?: | "mh-0" | "mh-5" | "mh-10" | "mh-15" | "mh-20" | "mh-25" | "mh-30" | "mh-35" | "mh-40" | "mh-45" | "mh-50" | "mh-55" | "mh-60" | "mh-65" | "mh-70" | "mh-75" | "mh-80" | "mh-85" | "mh-90" | "mh-95" | "mh-100";
    cssMisc?: ("w-100" | "row")[];
    cssCards?: ("card-text" | "card-title" | "card-subtitle" | "card-body" | "card-header" | "card-footer")[];
    cssText?: | "h1"| "h2"| "h3"| "h4"| "h5"| "h6"| "blockquote";
    cssTextEx?: | "lead"| "text-muted"| "mark"| "small";
    cssMargin?: | "mt-0" | "mt-1" | "mt-2" | "mt-3" | "mt-4" | "mt-5" | "mt-auto" | "mb-0" | "mb-1" | "mb-2" | "mb-3" | "mb-4" | "mb-5" | "mb-auto" | "ml-0" | "ml-1" | "ml-2" | "ml-3" | "ml-4" | "ml-5" | "ml-auto" | "mr-0" | "mr-1" | "mr-2" | "mr-3" | "mr-4" | "mr-5" | "mr-auto" | "mx-0" | "mx-1" | "mx-2" | "mx-3" | "mx-4" | "mx-5" | "mx-auto" | "my-0" | "my-1" | "my-2" | "my-3" | "my-4" | "my-5" | "my-auto" | "m-0" | "m-1" | "m-2" | "m-3" | "m-4" | "m-5" | "m-auto";
    cssPadding?: | "pt-0" | "pt-1" | "pt-2" | "pt-3" | "pt-4" | "pt-5" | "pt-auto" | "pb-0" | "pb-1" | "pb-2" | "pb-3" | "pb-4" | "pb-5" | "pb-auto" | "pl-0" | "pl-1" | "pl-2" | "pl-3" | "pl-4" | "pl-5" | "pl-auto" | "pr-0" | "pr-1" | "pr-2" | "pr-3" | "pr-4" | "pr-5" | "pr-auto" | "px-0" | "px-1" | "px-2" | "px-3" | "px-4" | "px-5" | "px-auto" | "py-0" | "py-1" | "py-2" | "py-3" | "py-4" | "py-5" | "py-auto" | "p-0" | "p-1" | "p-2" | "p-3" | "p-4" | "p-5" | "p-auto";
    cssTextAlign?: | "text-center"| "text-right";    
    cssFlex?: | "order-1";
}
export type CssForNodeElement = PickOmit<BaseNodeElement, "_id">;

export interface FormInput extends BaseNodeElement {
    nodeType: NodeType.form_input;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING | Pn.BOOLEAN;
}
export interface FormText extends BaseNodeElement {
    nodeType: NodeType.form_text;
    _id: string;
    noLabel?: boolean;
    propertyName: string;
    propertyType: Pn.DOCUMENT | Pn.NUMBER | Pn.STRING | Pn.BOOLEAN;
    uppercase?: boolean;
}

export interface FormAutocomplete extends BaseNodeElement {
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
export interface FormCard extends BaseNodeElement {
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

interface CardBase extends BaseNodeElement {
    imageNode?: Image;
    titleNode?: FormText;
    subtitleNode?: FormText; 
    childNodes?: NodeElement[];
    textNode?: FormText; 
}

export interface Card extends CardBase {
    nodeType: NodeType.card;
}

export interface GridContainer extends TableNodeElementBase {
    nodeType: NodeType.grid_container;
    cssLayout?: FrmdbLayoutType;
}

export function isCard(nodel: NodeElement): nodel is Card | GridContainer {
    return [NodeType.card, NodeType.grid_container].includes(nodel.nodeType);
}

export interface TableColumn extends BaseNodeElement {
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
    layout?: "frmdb-ly-admin" | "frmdb-ly-fpattern";
}

export interface FormDatepicker extends BaseNodeElement {
    nodeType: NodeType.form_datepicker;
    _id: string;
    propertyName: string;
}

export interface FormTimepicker extends BaseNodeElement {
    nodeType: NodeType.form_timepicker;
    _id: string;
    propertyName: string;
}


export interface DateRangePicker extends BaseNodeElement {
    nodeType: NodeType.date_range_picker;
    _id: string;
    startPropertyName: string;
    endPropertyName: string;
}

export interface FormChart extends BaseNodeElement {
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

export interface Button extends BaseNodeElement {
    nodeType: NodeType.button;
    _id: string;
    propertyName: string;
}


export interface ButtonGroup extends BaseNodeElement {
    nodeType: NodeType.button_group;
    _id: string;
}


export interface Calendar extends BaseNodeElement {
    nodeType: NodeType.calendar;
    _id: string;
}


export interface Header extends BaseNodeElement {
    nodeType: NodeType.header;
    _id: string;
    childNodes?: NodeElement[];
}

export interface Jumbotron extends BaseNodeElement {
    nodeType: NodeType.jumbotron;
    _id: string;
    childNodes?: NodeElement[];
}


export interface Dropdown extends BaseNodeElement {
    nodeType: NodeType.dropdown;
    _id: string;
}


export interface FormEnum extends BaseNodeElement {
    nodeType: NodeType.form_enum;
    _id: string;
}


export interface FormState extends BaseNodeElement {
    nodeType: NodeType.form_state;
    _id: string;
}


export interface Gallery extends BaseNodeElement {
    nodeType: NodeType.gallery;
    _id: string;
}


export interface HFilters extends BaseNodeElement {
    nodeType: NodeType.h_filters;
    _id: string;
}


export interface GridLayout extends BaseNodeElement {
    nodeType: NodeType.grid_layout;
    _id: string;
    childNodes: NodeElement[];
    cssLayout?: FrmdbLayoutType;
}

export interface FlexLayout extends BaseNodeElement {
    nodeType: NodeType.flex_layout;
    _id: string;
    direction: "row" | "column";
    childNodes?: NodeElement[];
}

export interface RootNode extends BaseNodeElement {
    nodeType: NodeType.root_node;
    _id: string;
    childNodes?: NodeElement[];
}

export interface HNav extends BaseNodeElement {
    nodeType: NodeType.h_nav;
    _id: string;
}


export interface Icon extends BaseNodeElement {
    nodeType: NodeType.icon;
    _id: string;
}


export interface Image extends BaseNodeElement {
    nodeType: NodeType.image;
    _id: string;
    propertyName: string;
    cssImageRatio?: "img-ratio-1-1" | "img-ratio-4-3" | "img-ratio-16-9";
}


export interface List extends BaseNodeElement {
    nodeType: NodeType.list;
    _id: string;
}


interface MediaBase extends BaseNodeElement {
    imageNode?: Image;
    titleNode?: FormText;
    subtitleNode?: FormText;
    textNode?: FormText; 
    childNodes?: NodeElement[];
}

export interface Media extends MediaBase {
    nodeType: NodeType.media;
    _id: string;
}

export interface MediaContainer extends TableNodeElementBase, MediaBase {
    nodeType: NodeType.media_container;
    _id: string;
}

export function isMedia(nodel: NodeElement): nodel is Media | MediaContainer {
    return [NodeType.media, NodeType.media_container].includes(nodel.nodeType);
}

export interface Timeline extends BaseNodeElement {
    nodeType: NodeType.timeline;
    _id: string;
}


export interface VFilters extends BaseNodeElement {
    nodeType: NodeType.v_filters;
    _id: string;
}

export interface VNav extends BaseNodeElement {
    nodeType: NodeType.v_nav;
    _id: string;
}

