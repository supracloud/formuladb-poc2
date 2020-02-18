import { parsePageUrl } from "@domain/url-utils";

let appName: string | null = null;
let tenantName: string | null = null;
let appRootEl: HTMLElement | null = null;

function findTenantAndApp() {
    ({tenantName, appName} = parsePageUrl(window.location.pathname));
    appRootEl = document.body;
}

export function APP_AND_TENANT_ROOT(): [string, string, HTMLElement] {
    if (null == appName || null == tenantName) {
        findTenantAndApp();        
    }
    return [tenantName || "unknown-tenant", appName || "unknown-app", appRootEl || document.body];
}

export function _resetAppAndTenant() {
    appName = null; tenantName = null;
}
