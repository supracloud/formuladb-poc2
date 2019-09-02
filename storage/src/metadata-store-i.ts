import { App, AppPage } from "@domain/app";
import { Schema } from "@domain/metadata/entity";

export interface MetadataStoreI {
    getApp(tenantName: string, appName: string): Promise<App | null>;
    putApp(tenantName: string, appName: string, app: App): Promise<App>;
    getSchema(tenantName: string, appName: string): Promise<Schema | null>;
    putSchema(tenantName: string, appName: string, schema: Schema): Promise<Schema>;
    getAppPage(tenantName: string, appName: string, pageName: string): Promise<AppPage | undefined>;
    getPageHtml(tenantName: string, appName: string, pageName: string): Promise<string | null>;
    savePageHtml(tenantName: string, appName: string, pageName: string, html: string): Promise<void>;
}
