import { FormService, FORM_SERVICE } from "./form.service";
import { APP_AND_TENANT_ROOT } from "./app.service";
import { waitUntilNotNull } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";

export async function initFrmdb() {
    let [tenantName, appName, appRootEl] = APP_AND_TENANT_ROOT();
    let formService = new FormService(appRootEl);
    FORM_SERVICE.instance = formService;
    await waitUntilNotNull(() => Promise.resolve(BACKEND_SERVICE().getFrmdbEngineTools()));
    formService.initFormsFromNewRecordCache();
}