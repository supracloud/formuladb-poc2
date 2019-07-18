import { App } from "@domain/app";
import { getData } from "./backend.service";

export class AppBackend {
    constructor(public tenantName: string, public appName: string) {}

    async getApp(): Promise<App | null> {
        return getData<App | null>(`/formuladb-api/${this.tenantName}/${this.appName}`);
    }
}

//WARNING: global scope modification!
(window as any).FrmdbAppBackend = AppBackend;
