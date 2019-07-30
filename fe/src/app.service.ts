let appName: string | null = null;
let tenantName: string | null = null;

function findTenantAndApp() {
    let appRootEl = document.querySelector('[data-frmdb-app]');
    if (appRootEl) {
        appName = appRootEl.getAttribute("data-frmdb-app") || "unknown-app";
        tenantName = appRootEl.getAttribute("data-frmdb-tenant") || "unknown-tenant";
    } else {
        let [t, a] = window.location.pathname.split('/').filter(x => x);
        if (!t || !a) throw new Error("Cannot find tenant and app in path " + window.location.pathname);
        [tenantName, appName] = [t, a];
    }
}

export function APP_AND_TENANT(): [string, string] {
    if (null == appName || null == tenantName) {
        findTenantAndApp();        
    }
    return [tenantName || "unknown-tenant", appName || "unknown-app"];
}
