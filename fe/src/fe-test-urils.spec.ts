import { _testResetBackendService } from "./backend.service";
import { _resetAppAndTenant } from "./app.service";
import { initFrmdb } from "./init";

const fetchMock = require('fetch-mock');
export async function navigate(path: string, html: string) {
    _testResetBackendService();
    _resetAppAndTenant();
    window.location.pathname = path;
    document.body.innerHTML = html;

    await new Promise(r => setTimeout(r, 0));//wait for fragments to be rendered

    fetchMock.post(/\/formuladb-api\/changes-feed/, []);
    await initFrmdb();
}

export function setValue(el: HTMLInputElement, val: string): HTMLInputElement {
    el.value = val;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return el;
}

export async function testSleep(ms: number, message: string = "") {
    await new Promise(resolve => setTimeout(resolve, ms));
}

export function frmdbxit(str, callback) { }
