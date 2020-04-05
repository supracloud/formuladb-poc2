import * as _ from "lodash";

import * as events from "@domain/event";
import { BACKEND_SERVICE, postData } from "./backend.service";
import { updateDOM } from "./live-dom-template/live-dom-template";
import { DATA_FRMDB_ATTRS_Enum } from "./live-dom-template/dom-node";
import { entityNameFromDataObjId, parseDataObjId, DataObj } from "@domain/metadata/data_obj";
import { FeFunctionsForDataBinding } from "./fe-functions";
import { generateTimestampUUID } from "@domain/uuid";
import { DataGridComponentI } from "./data-grid/data-grid.component.i";
import { SimpleAddHocQuery, SimpleAddHocQueryFilterItem, makeSimpleAddHocQueryFilterItem_filterType, makeSimpleAddHocQueryFilterItem_type } from "@domain/metadata/simple-add-hoc-query";
import { onEventChildren, onEvent } from "./delegated-events";
import { regexExtract, waitUntil } from "@domain/ts-utils";
import { registerChangesFeedHandler } from "./changes-feed-client";
import { $ImageObjT, $AppObjT, $PageObjT, $Table, $App, $Page } from "@domain/metadata/default-metadata";
import { isHTMLElement, getWindow } from "@core/dom-utils";
import { FormService } from "./form.service";

declare var $: any;

const DefaultSimpleAddHocQuery: SimpleAddHocQuery = {
    startRow: 0,
    endRow: 100,
    rowGroupCols: [],
    valueCols: [],
    pivotCols: [],
    pivotMode: false,
    groupKeys: [],
    filterModel: {},
    sortModel: [],
};

export class DataBindingsService {
    tablesCache = {};

    constructor(private rootEl: HTMLElement, private formService: FormService) {
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (let node of Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes))) {
                        if (!(node as any).tagName) continue;
                        this.applyCustomProcessingForPlugins(node, mutation.target);
                    }
                } else if (mutation.type === 'attributes' && mutation.attributeName && mutation.attributeName.indexOf('data-frmdb-') === 0) {
                    let el: HTMLElement = mutation.target as HTMLElement;
                    if ((mutation.attributeName === 'data-frmdb-table' || mutation.attributeName === 'data-frmdb-table-limit')
                        && (el.getAttribute('data-frmdb-table') || '').indexOf('$FRMDB.') === 0) {
                        this.debouncedUpdateDOMForTable(el);
                    }
                    else if (Object.values(DATA_FRMDB_ATTRS_Enum).includes(mutation.attributeName as any)) {
                        if ((el.getAttribute(mutation.attributeName) || '').indexOf('$FRMDB.') < 0) continue;
                        let parentRecordEl: HTMLElement | null = el.getAttribute('data-frmdb-table') || el.getAttribute('data-frmdb-record') ? el : el.closest('[data-frmdb-table],[data-frmdb-record]') as HTMLElement | null;
                        if (!parentRecordEl) { console.warn("parent record not found", el.outerHTML); continue }
                        if (parentRecordEl.getAttribute('data-frmdb-table')) {
                            this.debouncedUpdateDOMForTable(parentRecordEl);
                        } else {
                            this.debouncedUpdateDOMForTable(parentRecordEl);
                        }
                    }
                }
            }
        });

        observer.observe(rootEl, { attributes: true, childList: true, subtree: true });
        onEvent(rootEl, ["change"], 'input[data-frmdb-filter^="$FRMDB."]', async (event) => {
            if (!event.target || !event.target.outerHTML) return;
            let valExpr = event.target.getAttribute('data-frmdb-filter');
            if (!valExpr) { console.warn("query expr not found ", event.target.outerHTML); return }

            let m: RegExpMatchArray;
            if (m = valExpr.match(/^\$FRMDB\.(\$?\w+)\[\]\./)) {
                let tableName = m[1];
                let tableEl = rootEl.querySelector(`[data-frmdb-table="$FRMDB.${tableName}[]"]`);
                this.debouncedUpdateDOMForTable(tableEl);
            }
        });
        this.updateDOMOnDataUpdatesFromServer();
    }

    public async updateDOMForRoot(forceTableName?: string) {
        let tableNames = forceTableName ? [`$FRMDB.${forceTableName}[]`] : _.uniq(Array.from(this.rootEl.querySelectorAll('[data-frmdb-table^="$FRMDB."]'))
            .map(el => el.getAttribute('data-frmdb-table')));
        for (let tableName of tableNames) {
            let tableEl = this.rootEl.querySelector(`[data-frmdb-table="${tableName}"]`);
            await this.updateDOMForTable(tableEl as HTMLElement);
        }
    }

    public updateDOMWithUrlParameters() {
        let wnd = getWindow(this.rootEl);
        let searchStr = wnd.location.search;
        console.log("updateDOMWithUrlParameters", wnd, searchStr);
        let urlParams = new URLSearchParams(searchStr);
        urlParams.forEach((val, key) => {
            let elems: (HTMLInputElement|HTMLSelectElement)[] = Array.from(
                this.rootEl.querySelectorAll(`input[data-frmdb-value$=":${key}"],input[data-frmdb-value="${key}"]`));
            for (let el of elems) {
                el.value = val;
                el.dispatchEvent(new Event('change', {bubbles: true}));
            }
        });
    }

    private debouncedUpdateDOMForTable = _.debounce((el) => this.updateDOMForTable(el), 100);
    private debouncedUpdateDOMForRecord = _.debounce((el) => this.updateDOMForTable(el), 100);

    handlers: { [name: string]: (tableNme: string, data: any[]) => Promise<void> } = {};
    public registerDataBindingChangeHandler(name: string, handler: (tableName: string, data: any[]) => Promise<void>) {
        this.handlers[name] = handler;
        for (let tableName of Object.keys(this.tablesCache)) {
            handler(tableName, this.tablesCache[tableName]);
        }
    }

    async updateDOMForRecord(el: HTMLElement) {
        try {
            let recordId = el.getAttribute('data-frmdb-record');
            if (!recordId) { console.warn("Empty record id " + el.outerHTML); return }
            let bes = BACKEND_SERVICE();
            let record = await bes.getDataObj(recordId);
            if (!record) { console.warn("record not found " + el.outerHTML); return }
            updateDOM({
                ...record,
                ...FeFunctionsForDataBinding,
            }, el);
        } catch (err) {
            console.error(err);
        }
    }

    async updateDOMForTable(el: HTMLElement) {
        try {
            let tableName = el.getAttribute('data-frmdb-table')!.replace(/^\$FRMDB\./, '').replace(/\[\]$/, '');
            if (!tableName) { console.warn("Empty table name " + el.outerHTML); return }
            let promises: Promise<any>[] = [];
            if (tableName.indexOf('$REFERENCE_TO_OPTIONS') === 0) {
                promises.push(this.formService.updateOptionsForEl(el));
            } else {
                if (!el.parentElement) { console.warn("Parent not found for table data binding " + el.outerHTML); return }
                let limit = parseInt(el.getAttribute('data-frmdb-table-limit') || '') || 3;
                let query = this.getQueryForTable(tableName)
                promises.push(this.updateDOMForTableParent(el.parentElement, tableName, query, limit));
            }
            await Promise.all(promises);
        } catch (err) {
            console.error(err);
        }
    }

    getQueryForTable(tableName: string): SimpleAddHocQuery {
        let ret: SimpleAddHocQuery = _.cloneDeep(DefaultSimpleAddHocQuery);
        
        let filterEls: HTMLInputElement[] = Array.from(this.rootEl.querySelectorAll(`input[data-frmdb-filter^="$FRMDB.${tableName}[].filter."]`));
        for (let filterEl of filterEls) {
            let [x, fieldName, type] = regexExtract(filterEl.getAttribute('data-frmdb-filter')!.replace(`$FRMDB.${tableName}[].filter.`, ''),
                /(\w+?)\.(\w+)/);
            let filterType: SimpleAddHocQueryFilterItem['filterType'] = makeSimpleAddHocQueryFilterItem_filterType(filterEl.type);
            let filter = filterEl.value;
            if (filter) {
                ret.filterModel[fieldName] = {
                    filterType,
                    filter,
                    type: makeSimpleAddHocQueryFilterItem_type(type, filterType),
                }
            }
        }

        return ret;
    }

    async updateDOMForTableParent(parentEl: HTMLElement, tableName: string, query: SimpleAddHocQuery, limit: number) {
        try {
            if (!parentEl) return;
            let bes = BACKEND_SERVICE();
            await BACKEND_SERVICE().waitFrmdbEngineTools();
            if (null == bes?.currentSchema?.entities?.[tableName]) throw new Error("BE not initialized yet");

            let data = await bes.simpleAdHocQuery(tableName, query);
            this.tablesCache[tableName] = data;
            for (let handler of Object.values(this.handlers)) {
                await handler(tableName, data);
            }
            updateDOM({
                $FRMDB: { [tableName]: data.slice(0, limit) },
                ...FeFunctionsForDataBinding
            }, parentEl);
        } catch (err) {
            console.error(err);
        }
    }

    applyCustomProcessingForPlugins(el, parent) {
        // setTimeout(() => {
        //     this.applyCustomProcessing_for_isotopejs(el, parent);
        // }, 350);
    }

    applyCustomProcessing_for_isotopejs(elem, parent) {
        if (typeof $ !== 'undefined' && $(parent).is('.frmdb-isotope-grid') > 0) {
            $(parent).isotope().isotope('reloadItems').isotope({ filter: '*' });
        }
    }

    async updateDOMOnDataUpdatesFromServer() {

        registerChangesFeedHandler("dataBindingsMonitor", async (events: events.MwzEvents[]) => {
            let tableNames: Set<string> = new Set<string>();
            for (let event of events) {
                if (event.type_ === "ServerEventModifiedFormData") {
                    let { entityId } = parseDataObjId(event.obj._id);
                    tableNames.add(entityId);
                } else if (event.type_ === "ServerEventDeleteEntity" || event.type_ === "ServerEventNewEntity") {
                    tableNames.add($Table._id);
                } else if (event.type_ === "ServerEventNewApp") {
                    tableNames.add($App._id);
                } else if (event.type_ === "ServerEventSetPage" || event.type_ === "ServerEventDeletePage") {
                    tableNames.add($Page._id);
                }
            }
    
            for (let tableName of tableNames.values()) {
                for (let el of Array.from(this.rootEl.querySelectorAll(`[data-frmdb-table="$FRMDB.${tableName}[]"],[data-frmdb-table="$FRMDB.$REFERENCE_TO_OPTIONS.${tableName}[]"]`))) {
                    this.debouncedUpdateDOMForTable(el);
                }
                for (let el of Array.from(this.rootEl.querySelectorAll(`frmdb-data-grid[table-name="${tableName}"]`))) {
                    let dataGrid: DataGridComponentI = el as DataGridComponentI;
                    dataGrid.forceReloadData();
                }
            }
        });
    }
}
