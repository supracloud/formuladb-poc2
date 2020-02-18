import * as _ from "lodash";

import * as events from "@domain/event";
import { BACKEND_SERVICE, postData } from "./backend.service";
import { updateDOM } from "./live-dom-template/live-dom-template";
import { DATA_FRMDB_ATTRS_Enum } from "./live-dom-template/dom-node";
import { entityNameFromDataObjId, parseDataObjId } from "@domain/metadata/data_obj";
import { FeFunctionsForDataBinding } from "./fe-functions";
import { generateTimestampUUID } from "@domain/uuid";
import { DataGridComponentI } from "./data-grid/data-grid.component.i";

const CLIENT_ID = generateTimestampUUID();
declare var $: any;

export class DataBindingsMonitor {
    constructor(private rootEl: HTMLElement) {
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
        this.updateDOMOnDataUpdatesFromServer();
    }

    public async updateDOMForRoot() {
        let tableNames = _.uniq(Array.from(this.rootEl.querySelectorAll('[data-frmdb-table]'))
            .map(el => el.getAttribute('data-frmdb-table')));
        for (let tableName of tableNames) {
            let tableEl = this.rootEl.querySelector(`[data-frmdb-table="${tableName}"]`);
            await this.updateDOMForTable(tableEl as HTMLElement);
        }
    }

    private debouncedUpdateDOMForTable = _.debounce((el) => this.updateDOMForTable(el), 100);
    private debouncedUpdateDOMForRecord = _.debounce((el) => this.updateDOMForTable(el), 100);

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
            if (!el.parentElement) { console.warn("Parent not found for table data binding " + el.outerHTML); return }
            let limit = parseInt(el.getAttribute('data-frmdb-table-limit') || '') || 3;
            this.updateDOMForTableParent(el.parentElement, tableName, limit);
        } catch (err) {
            console.error(err);
        }
    }

    async updateDOMForTableParent(parentEl: HTMLElement, tableName: string, limit: number) {
        try {
            if (!parentEl) return;
            let bes = BACKEND_SERVICE();
            if (null == bes.currentSchema.entities[tableName]) return;
            let data = await bes.getTableData(tableName + '~~');
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

    public stop: boolean = false;
    async updateDOMOnDataUpdatesFromServer() {
        if (this.stop) return;

        let startTime = new Date().getTime();

        let events: events.MwzEvents[] = await postData<any, events.MwzEvents[]>(
            `/formuladb-api/changes-feed/${CLIENT_ID}`, {});

        //FIXME: take into account pagination, sorting, filters, now we update the whole table :(

        let tableNames: Set<string> = new Set<string>();
        for (let event of events) {
            if (event.type_ === "ServerEventModifiedFormData") {
                let { entityId } = parseDataObjId(event.obj._id);
                tableNames.add(entityId);
            }
        }

        for (let tableName of tableNames.values()) {
            for (let el of Array.from(this.rootEl.querySelectorAll(`[data-frmdb-table="$FRMDB.${tableName}[]"]`))) {
                this.debouncedUpdateDOMForTable(el);
            }
            for (let el of Array.from(this.rootEl.querySelectorAll(`frmdb-data-grid[table-name="${tableName}"]`))) {
                let dataGrid: DataGridComponentI = el as DataGridComponentI;
                dataGrid.forceReloadData();
            }
        }

        let pollTime = new Date().getTime() - startTime;
        setTimeout(() => this.updateDOMOnDataUpdatesFromServer(), Math.max(500, 1000 - pollTime));
    }
}
