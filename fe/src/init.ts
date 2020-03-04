import { FormService, FORM_SERVICE } from "./form.service";
import { APP_AND_TENANT_ROOT } from "./app.service";
import { waitUntil } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";
import { initRoutes } from "./router";
import { DataBindingsMonitor } from "./data-bindings-monitor";
import { stopChangesFeedLoop, changesFeedLoop } from "./changes-feed-client";
import { inIframe } from "@core/dom-utils";

let dataBindingMonitor: DataBindingsMonitor | null = null;
export async function initFrmdb() {
    let [tenantName, appName, appRootEl] = APP_AND_TENANT_ROOT();
    let formService = new FormService(appRootEl);
    FORM_SERVICE.instance = formService;
    await waitUntil(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));
    formService.initFormsFromNewRecordCache();
    initRoutes();

    dataBindingMonitor = new DataBindingsMonitor(document.body);
    dataBindingMonitor.updateDOMForRoot();

    if (!inIframe()) {
        changesFeedLoop();
    }
}

export function deinitFrmdb() {
    if (dataBindingMonitor) {
        dataBindingMonitor = null;
    }
    stopChangesFeedLoop();
}
