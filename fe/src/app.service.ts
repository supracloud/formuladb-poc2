let appName: string | null = null;
let tenantName: string | null = null;
let appRootEl: HTMLElement | null = null;

function findTenantAndApp() {
    appRootEl = document.querySelector('[data-frmdb-app]');
    if (appRootEl) {
        appName = appRootEl.getAttribute("data-frmdb-app") || "unknown-app";
        tenantName = appRootEl.getAttribute("data-frmdb-tenant") || "unknown-tenant";
    } else {
        let [t, a] = window.location.pathname.split('/').filter(x => x);
        if (!t || !a) throw new Error("Cannot find tenant and app in path " + window.location.pathname);
        [tenantName, appName] = [t, a];
        appRootEl = document.body;
    }
}

export function APP_AND_TENANT_ROOT(): [string, string, HTMLElement] {
    if (null == appName || null == tenantName) {
        findTenantAndApp();        
    }
    return [tenantName || "unknown-tenant", appName || "unknown-app", appRootEl || document.body];
}

export function _testResetAppAndTenant() {
    appName = null; tenantName = null;
}
