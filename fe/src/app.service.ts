let appName: string | null = null;
let tenantName: string | null = null;
let appRootEl: HTMLElement | null = null;

function findTenantAndApp() {
    appRootEl = document.querySelector('[data-frmdb-app]');
    if (appRootEl) {
        appName = appRootEl.getAttribute("data-frmdb-app") || "unknown-app";
        tenantName = appRootEl.getAttribute("data-frmdb-tenant") || "unknown-tenant";
    } else {
        let path = window.location.pathname;
        if (window.location.pathname === '/formuladb/editor.html') path = window.location.hash.replace(/^#/, '');
        path = path.replace(/[?].*$/, '');
        ({tenantName, appName} = decodePageUrl(path));
        appRootEl = document.body;
    }
}

export function decodePageUrl(url: string): {tenantName: string, appName: string, page: string} {
    let m = url.match(/(\w+)\/(\w+)\/(\w+)/);
    if (m && m.length == 4) {
        return {tenantName: m[1], appName: m[2], page: m[3]}; 
    } else throw new Error("Bad page url " + url)
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
