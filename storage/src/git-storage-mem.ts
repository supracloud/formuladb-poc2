/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { GitStorageI } from './git-storage-i';

export class GitStorageMem implements GitStorageI {
    private storage: Map<string, string> = new Map();

    async getFiles(tenantName: string, appName: string) {
        throw new Error("not implemented");
    }

    async getPages(tenantName: string, appName: string): Promise<string[]> {
        throw new Error("not implemented");
    }

    async savePage(tenantName: string, appName: string, pageName: string, html: string) {
        throw new Error("not implemented");
    }

    async getPageContent(tenantName: string, appName: string, pageName: string): Promise<string> {
        throw new Error("not implemented");
    }

    async getFile(tenantName: string, appName: string, filePath: string) {
        throw new Error("not implemented");
    }
}
