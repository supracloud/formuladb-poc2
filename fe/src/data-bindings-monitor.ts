import { BACKEND_SERVICE } from "./backend.service";
import { updateDOM } from "./live-dom-template/live-dom-template";
import * as _ from "lodash";

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
                    console.log('The ' + mutation.attributeName + ' attribute was modified to ' + el.getAttribute(mutation.attributeName));
                    if ((mutation.attributeName === 'data-frmdb-table' || mutation.attributeName === 'data-frmdb-table-limit')
                        && (el.getAttribute('data-frmdb-table')||'').indexOf('$FRMDB.') === 0) 
                    {
                        this.debouncedUpdateDOMForTable(el);
                    }

                }
            }
        });
        observer.observe(rootEl || document, { attributes: true, childList: true, subtree: true });
    }

    private debouncedUpdateDOMForTable = _.debounce((el) => this.updateDOMForTable(el), 100);

    async updateDOMForTable(el: HTMLElement) {
        try {
            let tableName = el.getAttribute('data-frmdb-table')!.replace(/^[$]FRMDB\./, '').replace(/\[\]$/, '');
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
        }, 100);
    }

    applyCustomProcessing_for_isotopejs(elem, parent) {
        console.log('applyCustomProcessing_for_isotopejs', elem, parent);
        if ($ && $(parent).is('.frmdb-isotope-grid') > 0) {
            $(parent).isotope().isotope('reloadItems').isotope( { filter: '*' } );
        }
    }    
}
