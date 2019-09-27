import { BACKEND_SERVICE } from "./backend.service";
import { updateDOM } from "./live-dom-template/live-dom-template";
import * as _ from "lodash";
import { DATA_FRMDB_ATTRS_Enum } from "./live-dom-template/dom-node";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";

declare var $: any;

export class DataBindingsMonitor {
    constructor(rootEl?) {
        const observer = new MutationObserver((mutationsList, observer) => {
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (let node of Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes))) {
                        if (!(node as any).tagName) continue;
                        this.applyCustomProcessingForPlugins(node, mutation.target);
                    }
                } else if (mutation.type === 'attributes' && mutation.attributeName && mutation.attributeName.indexOf('data-frmdb-') === 0) {
                    let el: HTMLElement = mutation.target as HTMLElement;
                    if ((mutation.attributeName === 'data-frmdb-table' || mutation.attributeName === 'data-frmdb-table-limit')
                        && (el.getAttribute('data-frmdb-table')||'').indexOf('$FRMDB.') === 0) 
                    {
                        this.debouncedUpdateDOMForTable(el);
                    } 
                    else if (Object.values(DATA_FRMDB_ATTRS_Enum).includes(mutation.attributeName as any))
                    {
                        if ((el.getAttribute(mutation.attributeName)||'').indexOf('$FRMDB.') < 0) continue;
                        let parentRecordEl: HTMLElement | null = el.getAttribute('data-frmdb-table') || el.getAttribute('data-frmdb-record') ? el : el.closest('[data-frmdb-table],[data-frmdb-record]') as HTMLElement | null;
                        if (!parentRecordEl) {console.warn("parent record not found", el.outerHTML); continue}
                        if (parentRecordEl.getAttribute('data-frmdb-table')) {
                            this.debouncedUpdateDOMForTable(parentRecordEl);
                        } else {
                            this.debouncedUpdateDOMForTable(parentRecordEl);
                        }
                    }
                }
            }
        });
        observer.observe(rootEl || document, { attributes: true, childList: true, subtree: true });
    }

    private debouncedUpdateDOMForTable = _.debounce((el) => this.updateDOMForTable(el), 100);
    private debouncedUpdateDOMForRecord = _.debounce((el) => this.updateDOMForTable(el), 100);

    async updateDOMForRecord(el: HTMLElement) {
        try {
            let recordId = el.getAttribute('data-frmdb-record');
            if (!recordId) {console.warn("Empty record id " + el.outerHTML); return}
            let bes = BACKEND_SERVICE();
            let record = await bes.getDataObj(recordId);
            if (!record) {console.warn("record not found " + el.outerHTML); return}
            updateDOM(record, el);
        } catch (err) {
            console.error(err);
        }
    }

    async updateDOMForTable(el: HTMLElement) {
        try {
            let tableName = el.getAttribute('data-frmdb-table')!.replace(/^\$FRMDB\./, '').replace(/\[\]$/, '');
            if (!tableName) {console.warn("Empty table name " + el.outerHTML); return}
            if (!el.parentElement) {console.warn("Parent not found for table data binding " + el.outerHTML); return}
            let limit = parseInt(el.getAttribute('data-frmdb-table-limit')||'') || 3;
            let bes = BACKEND_SERVICE();
            let data = await bes.getTableData(tableName + '~~');
            updateDOM({$FRMDB: {[tableName]: data.slice(0, limit)}}, el.parentElement);
        } catch (err) {
            console.error(err);
        }
    }

    applyCustomProcessingForPlugins(el, parent) {
        setTimeout(() => {
            this.applyCustomProcessing_for_isotopejs(el, parent);
        }, 350);
    }

    applyCustomProcessing_for_isotopejs(elem, parent) {
        if ($ && $(parent).is('.frmdb-isotope-grid') > 0) {
            $(parent).isotope().isotope('reloadItems').isotope( { filter: '*' } );
        }
    }    
}
