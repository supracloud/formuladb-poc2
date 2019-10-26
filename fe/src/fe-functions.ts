import * as DOMPurify from "dompurify";

import { BACKEND_SERVICE } from "./backend.service";
import { DataObj, isNewDataObjId, entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { updateDOM, html } from "./live-dom-template/live-dom-template";
import { Entity, Pn } from "@domain/metadata/entity";
import { ServerEventPutPageHtml } from "@domain/event";
import { getHtml } from "./get-html";

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

    let url = `/${appBackend.tenantName}/${appBackend.appName}/${page}`;
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
    return Object.values(appBackend.currentSchema.entities).map(ent => ({
        name: ent._id,
    }));
}

export function $DATA_COLUMNS_FOR_ELEM(el: HTMLElement): { text: string, value: string }[] {
    let parentRecordEl: HTMLElement | null = el.getAttribute('data-frmdb-table') || el.getAttribute('data-frmdb-record') ? el : el.closest('[data-frmdb-table],[data-frmdb-record]') as HTMLElement | null;
    if (!parentRecordEl) { console.warn("parent record not found", el.outerHTML); return [] }

    let tableName = parentRecordEl.getAttribute('data-frmdb-table');
    if (!tableName) {
        tableName = entityNameFromDataObjId(parentRecordEl.getAttribute('data-frmdb-record') || '');
    } else {
        tableName = tableName.replace(/^\$FRMDB\./, '').replace(/\[\]$/, '');
    }
    if (!tableName) { console.warn("table not found", tableName, el.outerHTML); return [] }
    let appBackend = BACKEND_SERVICE();
    let entity = appBackend.currentSchema.entities[tableName];
    if (!entity) { console.warn("entity not found", tableName, el.outerHTML); return [] }
    return Object.values(entity.props).map(p => ({
        text: `${tableName}.${p.name}`,
        value: `$FRMDB.${tableName}[].${p.name}`,
    })).concat(
        Object.values(entity.props)
            .filter(p => p.name === "_id" || p.propType_ === Pn.REFERENCE_TO)
            .map(p => ({
                text: `$ID(${tableName}.${p.name})`,
                value: `:$ID:$FRMDB.${tableName}[].${p.name}`,
            }))
    );
}

export function $SAVE_DOC_PAGE(pagePath: string, doc: Document) {
    let html = getHtml(doc);

    BACKEND_SERVICE().putEvent(new ServerEventPutPageHtml(pagePath, html))
        .then(async (ev: ServerEventPutPageHtml) => {
            if (ev.state_ != 'ABORT') {
                alert(`Saved ${pagePath}`);
            } else {
                alert(ev.notifMsg_ || ev.error_ || JSON.stringify(ev));
            }
        })
}

function $ID(_id: string) {
    return _id ? _id.replace(/^.*?~~/, '') : ''
}

export const FeFunctionsForDataBinding = {
    '$ID': $ID,
};

(window as any).$MODAL = $MODAL;
(window as any).$TABLES = $TABLES;
(window as any).$DATA_COLUMNS_FOR_ELEM = $DATA_COLUMNS_FOR_ELEM;
(window as any).$ID = $ID;
(window as any).$SAVE_DOC_PAGE = $SAVE_DOC_PAGE;
