/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export interface GitStorageI {
    getFiles(tenantName: string, appName: string);
    getPages(tenantName: string, appName: string): Promise<string[]>;
    savePage(tenantName: string, appName: string, pageName: string, html: string);
    getPageContent(tenantName: string, appName: string, pageName: string): Promise<string>;
    getFile(tenantName: string, appName: string, filePath: string);
}
