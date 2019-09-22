import * as DOMPurify from "dompurify";

import { BACKEND_SERVICE } from "./backend.service";
import { AppPage } from "@domain/app";
import { DataObj, isNewDataObjId } from "@domain/metadata/data_obj";
import { updateDOM } from "./live-dom-template/live-dom-template";

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
    let page: AppPage | undefined = app.pages.find(p => p.name == pageName);
    if (!page) throw new Error("App not found");

    let url = `/${appBackend.tenantName}/${appBackend.appName}/${page.name}`;
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
    if (isNewDataObjId(dataBindingId)) return {_id: dataBindingId};
    
    let appBackend = BACKEND_SERVICE();

    if (dataBindingId.indexOf('~~') > 0) {
        return appBackend.getDataObj(dataBindingId);
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
        modalEl.innerHTML = pageModal.innerHTML;
    }

    if (initDataBindingId) {
        let data = await loadData(initDataBindingId);
        updateDOM(data, modalEl as HTMLElement);    
    }

    if (recordDataBindingId) {
        let data = await loadData(recordDataBindingId);
        modalEl.setAttribute('data-frmdb-record', recordDataBindingId);
        updateDOM(data, modalEl as HTMLElement);
    }

    ($('#frmdbModal') as any).modal('show');
}

(window as any).$MODAL = $MODAL;
