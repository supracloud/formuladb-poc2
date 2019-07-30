import { App } from "@domain/app";
import { getData } from "./backend.service";

export class AppBackend {
    constructor(public tenantName: string, public appName: string) {}

    async getApp(): Promise<App | null> {
        return getData<App | null>(`/formuladb-api/${this.tenantName}/${this.appName}`);
    }
}

let _appBackend: AppBackend | null = null;
export function APP_BACKEND(): AppBackend {
    if (!_appBackend) {
        let [tenantName, appName] = window.location.pathname.split('/').filter(x => x);
        if (!tenantName || !appName) throw new Error("Cannot find tenant and app in path " + window.location.pathname);
        _appBackend = new AppBackend(tenantName, appName);
    }
    return _appBackend;
}

//WARNING: global scope modification!
(window as any).FrmdbAppBackend = AppBackend;
