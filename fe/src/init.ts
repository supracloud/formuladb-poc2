import { FormService, FORM_SERVICE } from "./form.service";
import { APP_AND_TENANT_ROOT } from "./app.service";
import { waitUntil } from "@domain/ts-utils";
import { BACKEND_SERVICE } from "./backend.service";
import { initRoutes } from "./router";
import { DataBindingsService } from "./data-bindings.service";
import { stopChangesFeedLoop, changesFeedLoop, registerChangesFeedHandler } from "./changes-feed-client";
import { DirectivesService } from "./directives/directives.service";
import { DataToggleintroDirective } from "./directives/data-toggle-intro.directive";
import { parseMandatoryPageUrl } from "@domain/url-utils";
import { I18nLang } from "@domain/i18n";
import { setDictionary } from "./i18n.service";
import * as events from "@domain/event";
import { entityNameFromDataObjId } from "@domain/metadata/data_obj";
import { $Dictionary } from "@domain/metadata/default-metadata";

export var DATA_BINDING_MONITOR: DataBindingsService | null = null;
export async function getDATA_BINDING_MONITOR(): Promise<DataBindingsService> {
    await waitUntil(() => DATA_BINDING_MONITOR);
    return DATA_BINDING_MONITOR!;
}
export async function initFrmdb() {

    window.addEventListener('load', (event) => {
        let urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('frmdbIntro')) {
            setTimeout(() => DataToggleintroDirective.startIntro(), 1200);
        }
    });

    let [appName, appRootEl] = APP_AND_TENANT_ROOT();
    let formService = new FormService(appRootEl);
    FORM_SERVICE.instance = formService;
    await BACKEND_SERVICE().waitSchema();
    formService.initFormsFromNewRecordCache();
    initRoutes();

    let dbm = new DataBindingsService(appRootEl, formService);
    dbm.updateDOMWithUrlParameters();
    await dbm.updateDOMForRoot();
    dbm.init();
    DATA_BINDING_MONITOR = dbm;

    // if (!inIframe()) {
    changesFeedLoop();
    // }

    let directivesService = new DirectivesService(appRootEl);
    directivesService.init();

    let pageOpts = parseMandatoryPageUrl(window.location.pathname);
    let dict = await BACKEND_SERVICE().getDictionary(pageOpts.lang as I18nLang);
    setDictionary(dict);
    console.log('Setting dictionary', pageOpts.lang, dict);

    registerChangesFeedHandler("global-fe-changes-handler", async (events: events.MwzEvents[]) => {
        for (let event of events) {
            if (event.type_ === "ServerEventModifiedFormData" || event.type_ === "ServerEventDeletedFormData") {
                let entityId = entityNameFromDataObjId(event.obj._id);
                if (entityId === $Dictionary._id) {
                    let dict = await BACKEND_SERVICE().getDictionary(pageOpts.lang as I18nLang);
                    setDictionary(dict);
                    console.log('Setting dictionary', pageOpts.lang, dict);
                }
            }
        }
    }, () => []);
}

export function deinitFrmdb() {
    if (DATA_BINDING_MONITOR) {
        DATA_BINDING_MONITOR = null;
    }
    stopChangesFeedLoop();
}
