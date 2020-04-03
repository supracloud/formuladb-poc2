/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { GitStorageI } from './git-storage-i';

export class GitStorageMem implements GitStorageI {
    private storage: Map<string, string> = new Map();

    async getFiles(appName: string) {
        throw new Error("not implemented");
    }

    async getPages(appName: string): Promise<string[]> {
        throw new Error("not implemented");
    }

    async savePage(appName: string, pageName: string, html: string) {
        throw new Error("not implemented");
    }

    async getPageContent(appName: string, pageName: string): Promise<string> {
        throw new Error("not implemented");
    }

    async getFile(appName: string, filePath: string) {
        throw new Error("not implemented");
    }
}
