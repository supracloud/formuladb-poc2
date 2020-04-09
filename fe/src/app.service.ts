import { parseAllPageUrl } from "@domain/url-utils";

let appName: string | null = null;
let appRootEl: HTMLElement | null = null;

function findTenantAndApp() {
    ({appName} = parseAllPageUrl(window.location.pathname));
    appRootEl = document.body;
}

export function APP_AND_TENANT_ROOT(): [string, HTMLElement] {
    if (null == appName) {
        findTenantAndApp();        
    }
    return [appName || "unknown-app", appRootEl || document.body];
}

export function _resetAppAndTenant() {
    appName = null;
}
