/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

export interface GitStorageI {
    getFiles(appName: string);
    getPages(appName: string): Promise<string[]>;
    savePage(appName: string, pageName: string, html: string);
    getPageContent(appName: string, pageName: string): Promise<string>;
    getFile(appName: string, filePath: string);
}
