import * as DOMPurify from "dompurify";

import { BACKEND_SERVICE } from "./backend.service";
import { DataObj, isNewDataObjId, entityNameFromDataObjId, parseDataObjId } from "@domain/metadata/data_obj";
import { updateDOM, serializeElemToObj } from "@fe/live-dom-template/live-dom-template";
import { Pn } from "@domain/metadata/entity";
import { ServerEventPutPageHtml } from "@domain/event";
import { HTMLTools } from "@core/html-tools";
import { cleanupDocumentDOM } from "../../core/src/page-utils";
import { parseAllPageUrl } from "@domain/url-utils";
import { isShadowRoot, isHTMLElement } from "@core/dom-utils";
import { DataToggleTooltipDirective } from "./directives/data-toggle-tooltip.directive";
import { getElemForKey } from "@core/live-dom-template/dom-node";
import { _idValueStr } from "@domain/key_value_obj";
import { DataGridComponentI } from "./data-grid/data-grid.component.i";

DOMPurify.addHook('uponSanitizeElement', function (node, data) {
    if (node.nodeName && node.nodeName.match(/^\w+-[-\w]+$/)
        && !data.allowedTags[data.tagName]) {
        data.allowedTags[data.tagName] = true;
    }
});

export async function loadPage(pageName: string): Promise<string> {
    let appBackend = BACKEND_SERVICE();

    let url = `/${appBackend.appName}/${pageName}`;
    console.log(`fetching ${url}...`);
    let html = `<html><body><h2>Page ${url} not found</h2></body></html>`;
    try {
        let res = await fetch(url, {
            headers: {
                'accept': 'text/html',
            },
        });
        html = await res.text();
    } catch (err) {
        console.warn(`Cannot find page ${url}`, err);
    }
    return DOMPurify.sanitize(html);
}

async function loadData(dataBindingId: string): Promise<DataObj | DataObj[]> {
    if (isNewDataObjId(dataBindingId)) return { _id: dataBindingId };

    let appBackend = BACKEND_SERVICE();

    if (dataBindingId.indexOf('~~') > 0) {
        let dataObj = await appBackend.getDataObj(dataBindingId);
        (dataObj as any)._id_ = _idValueStr(dataObj._id);
        return dataObj;
    } else {
        return appBackend.getTableData(dataBindingId);
    }
}

async function $MODAL(modalPageName: string, initDataBindingId?: string, recordDataBindingId?: string) {
    let html = await loadPage(modalPageName);
    let modalEl = document.querySelector('#frmdbModal.modal');
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.className = "modal";
        modalEl.setAttribute("id", "frmdbModal");
        document.body.appendChild(modalEl);
    }
    modalEl.innerHTML = html;

    let pageModal = modalEl.querySelector('.modal');
    if (pageModal) {
        modalEl = pageModal;
        modalEl.setAttribute("id", "frmdbModal");
    }

    if (initDataBindingId) {
        let data = await loadData(initDataBindingId);
        updateDOM({ $INITDATA$: data }, modalEl as HTMLElement);
    }

    if (recordDataBindingId) {
        let data = await loadData(recordDataBindingId);
        modalEl.setAttribute('data-frmdb-record', recordDataBindingId);
        updateDOM(data, modalEl as HTMLElement);
    }

    ($('#frmdbModal') as any).modal('show');
}

export function $FRMDB_CHANGE(newData: {}, rootEl?: HTMLElement) {
    updateDOM(newData, rootEl || document.body);
}

export function $TABLES(): { name: string }[] {
    let appBackend = BACKEND_SERVICE();
    return Object.values(appBackend?.getCurrentSchema()?.entities || {}).map(ent => ({
        name: ent._id,
    }));
}

export function $REFERENCE_TO_OPTIONS(el: HTMLElement): { name: string, value: string }[] {
    let recordEl = el.parentElement?.closest('[data-frmdb-record],[data-frmdb-bind-to-record]');
    if (!recordEl) return [];
    if (!BACKEND_SERVICE().getCurrentSchema()) { console.warn(`getCurrentSchema() not initialized yet`); return [] }
    let entityId = (recordEl.getAttribute('data-frmdb-record') || recordEl.getAttribute('data-frmdb-bind-to-record') )?.replace(/^\$FRMDB\./, '')?.replace(/~~.*/, '');
    if (!entityId) { console.warn(`Could not get tableName for checking references`, el.outerHTML, recordEl.outerHTML); return [] };
    let entity = BACKEND_SERVICE().getCurrentSchema()?.entities[entityId];
    if (!entity) { console.warn(`entity ${entityId} not known`, BACKEND_SERVICE().getCurrentSchema()?.entities); return [] }
    let references: Set<string> = new Set();
    for (let prop of Object.values(entity.props)) {
        if (prop.propType_ === Pn.REFERENCE_TO) {
            references.add(prop.referencedEntityName);
        }
    }
    return Array.from(references).map(r => ({
        name: `$REFERENCE_TO_OPTIONS.${r}`,
        value: `$FRMDB.$REFERENCE_TO_OPTIONS.${r}[]`,
    }));
}

export function $DATA_COLUMNS_FOR_ELEM(el: HTMLElement): { text: string, value: string }[] {
    let parentRecordEl: HTMLElement | null = el.getAttribute('data-frmdb-table')
        || el.getAttribute('data-frmdb-record')
        || el.getAttribute('data-frmdb-bind-to-record') ? el :
        el.closest('[data-frmdb-table],[data-frmdb-record],[data-frmdb-bind-to-record]') as HTMLElement | null;
    if (!parentRecordEl) { return [] }

    let isDirectRecordBinding = parentRecordEl.hasAttribute('data-frmdb-bind-to-record');
    let tableDataBindingName = parentRecordEl.getAttribute('data-frmdb-table') || parentRecordEl.getAttribute('data-frmdb-bind-to-record')?.replace(/~~.*/, '');
    let tableName: string, prefix: string;
    if (!tableDataBindingName) {
        tableName = entityNameFromDataObjId(parentRecordEl.getAttribute('data-frmdb-record') || '');
        prefix = tableName;
    } else {
        tableName = tableDataBindingName.replace(/^\$FRMDB(\.\$REFERENCE_TO_OPTIONS)?\./, '').replace(/\[\]$/, '');
        prefix = tableDataBindingName.replace(/^\$FRMDB\./, '').replace(/\[\]$/, '');
    }
    if (!tableName) { console.warn("table not found", tableName, el.outerHTML); return [] }
    let appBackend = BACKEND_SERVICE();
    let entity = appBackend.getCurrentSchema()?.entities?.[tableName];
    if (!entity) { console.warn("entity not found", tableName, el.outerHTML); return [] }
    let suf = isDirectRecordBinding ? '{}' : '[]';
    return Object.values(entity.props).map(p => ({
        text: `${prefix}.${p.name}`,
        value: `$FRMDB.${prefix}${suf}.${p.name}`,
    }));
}

// function uploadBlob(blobUrl: string, contentType: string){
//     var reader = new FileReader();
//     // this function is triggered once a call to readAsDataURL returns
//     reader.onload = function(event){
//         var fd = new FormData();
//         fd.append('fname', 'test.txt');
//         fd.append('data', new Blob([event?.target?.result || ''], {type: contentType}));
//         $.ajax({
//             type: 'POST',
//             url: 'upload.php',
//             data: fd,
//             processData: false,
//             contentType: false
//         }).done(function(data) {
//             // print the output from the upload.php script
//             console.log(data);
//         });
//     };      
//     // trigger the read from the reader...
//     reader.readAsDataURL(blob);

// }

export function $SAVE_DOC_PAGE(pagePath: string, doc: Document, specificPageOpts?: boolean): Promise<boolean> {
    let htmlTools = new HTMLTools(doc, new DOMParser());
    let cleanedUpDOM = cleanupDocumentDOM(doc);
    let html = htmlTools.document2html(cleanedUpDOM);

    let pageOpts = parseAllPageUrl(pagePath);
    return BACKEND_SERVICE().putEvent(new ServerEventPutPageHtml(pageOpts, html, specificPageOpts))
        .then(async (ev: ServerEventPutPageHtml) => {
            if (ev.state_ != 'ABORT' && !ev.error_) {
                alert(`Saved ${pagePath}`);
                return true;
            } else {
                alert(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
                return false;
            }
        })
}

export const FeFunctionsForDataBinding = {
    '$LABEL': $LABEL,
};

function $FCMP(el: HTMLElement): HTMLElement | null {
    let parent: Node | null = el;
    while (parent) {
        if (isHTMLElement(parent) && parent.tagName.toLowerCase().indexOf('frmdb-') === 0) return parent;
        else parent = parent.parentNode;
    }
    return parent;
}
function $FSCMP(el: HTMLElement): HTMLElement | null {
    let parent: Node | null = el;
    while (parent) {
        if (isShadowRoot(parent) && parent.host.tagName.toLowerCase().indexOf('frmdb-') === 0) {
            return parent.host as HTMLElement;
        } else parent = parent.parentNode;
    }
    return parent;
}

export function $FRMDB_RECORD_EL(control: HTMLElement): HTMLElement | null {
    let parentEl: HTMLElement = control.closest('[data-frmdb-record],[data-frmdb-bind-to-record]') as HTMLElement;
    if (!parentEl) return null;
    return parentEl;
}
export function $FRMDB_RECORD(el: HTMLElement): {parentEl: HTMLElement, parentObj: DataObj} | null {
    let parentEl = $FRMDB_RECORD_EL(el);
    if (!parentEl) return null;
    let parentObj = serializeElemToObj(parentEl) as DataObj;
    let recordId = parentEl.getAttribute('data-frmdb-record') || parentEl.getAttribute('data-frmdb-bind-to-record')?.replace(/^\$FRMDB\./, '') || '';
    if (!parentObj._id || (!isNewDataObjId(recordId) && isNewDataObjId(parentObj._id))) {
        parentObj._id = recordId;
    }
    if (!parentObj._id) throw new Error("Cannot find obj id for " + el);
    return {parentEl, parentObj};
}
export function $FRMDB_CLOSEST_ELS(el: HTMLElement, key: string): HTMLElement[] | null {
    let parentEl: HTMLElement | null = el.closest('[data-frmdb-record],[data-frmdb-bind-to-record]') as HTMLElement;
    while (parentEl) {
        let targetEls = getElemForKey(parentEl, key);
        if (targetEls && targetEls.length > 0) return targetEls;
        parentEl = parentEl.parentElement;
    }
    return null;
}
export function $LABEL(id: string) {
    if (id.indexOf('-') >= 0) {
        return id.replace(/-/g, ' ').replace(/ [a-z]/g, v => v.toUpperCase());
    } else if (id.indexOf('_') >= 0) {
        return id.replace(/_/g, ' ');
    } else return id;
}

export function $INCLUDE_FILTER_IN_LINK_URL(a: HTMLLinkElement) {
    let url = new URL(a.href, window.location.href);
    let m = url.pathname.match(/\/formuladb-api\/xlsx\/(\w+)\/(\w+)\/(\w+)/);
    if (m) {
        let lang = m[1];
        let app = m[2];
        let tableName = m[3];
        let dataGrid: DataGridComponentI = document.querySelector(`frmdb-data-grid[table-name="${tableName}"]`) as DataGridComponentI;
        if (!dataGrid) return '';
    
        let filter = encodeURIComponent(JSON.stringify(dataGrid.getFilterModel()));
        //TODO: use data-frmdb-filter filters if data grid is not found
    
        a.href = `/formuladb-api/xlsx/${lang}/${app}/${tableName}?addHocQueryFilter=${filter}`;
    }
}

(window as any).$MODAL = $MODAL;
(window as any).$TABLES = $TABLES;
(window as any).$DATA_COLUMNS_FOR_ELEM = $DATA_COLUMNS_FOR_ELEM;
(window as any).$LABEL = $LABEL;
(window as any).$SAVE_DOC_PAGE = $SAVE_DOC_PAGE;
(window as any).$FCMP = $FCMP;
(window as any).$FSCMP = $FSCMP;
(window as any).$FRMDB_CHANGE = $FRMDB_CHANGE;
(window as any).$INCLUDE_FILTER_IN_LINK_URL = $INCLUDE_FILTER_IN_LINK_URL;
