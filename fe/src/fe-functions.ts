import * as DOMPurify from "dompurify";

import { BACKEND_SERVICE } from "./backend.service";
import { DataObj, isNewDataObjId, entityNameFromDataObjId, parseDataObjId } from "@domain/metadata/data_obj";
import { updateDOM } from "./live-dom-template/live-dom-template";
import { Pn } from "@domain/metadata/entity";
import { ServerEventPutPageHtml } from "@domain/event";
import { HTMLTools } from "@core/html-tools";
import { cleanupDocumentDOM } from "../../core/src/page-utils";
import { parseAllPageUrl } from "@domain/url-utils";
import { isShadowRoot, isHTMLElement } from "@core/dom-utils";
import { APP_AND_TENANT_ROOT } from "./app.service";
import { getElemValue } from "./live-dom-template/dom-node";

DOMPurify.addHook('uponSanitizeElement', function (node, data) {
    if (node.nodeName && node.nodeName.match(/^\w+-[-\w]+$/)
        && !data.allowedTags[data.tagName]) {
        data.allowedTags[data.tagName] = true;
    }
});

export async function loadPage(pageName: string): Promise<string> {
    let appBackend = BACKEND_SERVICE();
    let app = await appBackend.getApp();
    if (!app) throw new Error("App not found");
    let page: string | undefined = app.pages.find(p => p == pageName);
    if (!page) throw new Error("App not found");

    let url = `/${appBackend.appName}/${page}`;
    console.log(`fetching ${url}...`);
    let res = await fetch(url, {
        headers: {
            'accept': 'text/html',
        },
    });
    let html = await res.text();
    return DOMPurify.sanitize(html);
}

async function loadData(dataBindingId: string): Promise<DataObj | DataObj[]> {
    if (isNewDataObjId(dataBindingId)) return { _id: dataBindingId };

    let appBackend = BACKEND_SERVICE();

    if (dataBindingId.indexOf('~~') > 0) {
        let dataObj = await appBackend.getDataObj(dataBindingId);
        (dataObj as any)._id_ = dataObj._id.replace(/^.*?~~/, '');
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

export function $TABLES(): { name: string }[] {
    let appBackend = BACKEND_SERVICE();
    return Object.values(appBackend?.currentSchema?.entities || {}).map(ent => ({
        name: ent._id,
    }));
}

export function $REFERENCE_TO_OPTIONS(el: HTMLElement): { name: string, value: string }[] {
    let recordEl = el.parentElement?.closest('[data-frmdb-record]');
    if (!recordEl) return [];
    if (!BACKEND_SERVICE().currentSchema) { console.warn(`currentSchema not initialized yet`); return [] }
    let entityId = recordEl.getAttribute('data-frmdb-record')!.replace(/~~.*/, '');
    let entity = BACKEND_SERVICE().currentSchema?.entities[entityId];
    if (!entity) { console.warn(`entity ${entityId} not known`, BACKEND_SERVICE().currentSchema?.entities); return [] }
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
    let entity = appBackend.currentSchema?.entities?.[tableName];
    if (!entity) { console.warn("entity not found", tableName, el.outerHTML); return [] }
    let suf = isDirectRecordBinding ? '{}' : '[]';
    return Object.values(entity.props).map(p => ({
        text: `${prefix}.${p.name}`,
        value: `$FRMDB.${tableName}${suf}.${p.name}`,
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

export function $SAVE_DOC_PAGE(pagePath: string, doc: Document): Promise<boolean> {
    let htmlTools = new HTMLTools(doc, new DOMParser());
    let cleanedUpDOM = cleanupDocumentDOM(doc);
    let html = htmlTools.document2html(cleanedUpDOM);

    let pageOpts = parseAllPageUrl(pagePath);
    return BACKEND_SERVICE().putEvent(new ServerEventPutPageHtml(pageOpts, html))
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
export function $_FRMDB_SCOPE(el: HTMLElement): any {
    let parent: Node | null = el;
    while (parent) {
        if ((parent as any).$_FRMDB_SCOPE) return (parent as any).$_FRMDB_SCOPE;
        else parent = parent.parentNode;
    }
    return null;
}
export function $LABEL(id: string) {
    if (id.indexOf('-') >= 0) {
        return id.replace(/-/g, ' ').replace(/(^|(?<= ))[a-z]/g, v => v.toUpperCase());
    } else if (id.indexOf('_') >= 0) {
        return this.value.replace(/_/g, ' ');
    } else return id;
}

(window as any).$MODAL = $MODAL;
(window as any).$TABLES = $TABLES;
(window as any).$DATA_COLUMNS_FOR_ELEM = $DATA_COLUMNS_FOR_ELEM;
(window as any).$LABEL = $LABEL;
(window as any).$SAVE_DOC_PAGE = $SAVE_DOC_PAGE;
(window as any).$FCMP = $FCMP;
(window as any).$FSCMP = $FSCMP;
