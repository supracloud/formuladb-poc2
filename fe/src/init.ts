import { FormService, FORM_SERVICE } from "./form.service";
import { APP_AND_TENANT_ROOT } from "./app.service";
import { waitUntil } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";
import { initRoutes } from "./router";
import { DataBindingsService } from "./data-bindings.service";
import { stopChangesFeedLoop, changesFeedLoop } from "./changes-feed-client";
import { inIframe } from "@core/dom-utils";
import { setupDataFrmdbInitDirective } from "./directives/data-frmdb-init";

export var DATA_BINDING_MONITOR: DataBindingsService | null = null;
export async function initFrmdb() {
    let [tenantName, appName, appRootEl] = APP_AND_TENANT_ROOT();
    let formService = new FormService(appRootEl);
    FORM_SERVICE.instance = formService;
    await BACKEND_SERVICE().waitFrmdbEngineTools();
    formService.initFormsFromNewRecordCache();
    initRoutes();

    DATA_BINDING_MONITOR = new DataBindingsService(appRootEl);
    DATA_BINDING_MONITOR.updateDOMWithUrlParameters();
    await DATA_BINDING_MONITOR.updateDOMForRoot();
    await formService.updateOptionsForRoot();

    if (!inIframe()) {
        changesFeedLoop();
    }

    setupDataFrmdbInitDirective(document.body);
}

export function deinitFrmdb() {
    if (DATA_BINDING_MONITOR) {
        DATA_BINDING_MONITOR = null;
    }
    stopChangesFeedLoop();
}
