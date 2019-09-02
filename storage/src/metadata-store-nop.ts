import { App, AppPage } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { KeyValueStoreFactoryI } from "./key_value_store_i";
import { MetadataStoreI } from "./metadata-store-i";

export class MetadataStoreNop implements MetadataStoreI {
    constructor(public kvsFactory: KeyValueStoreFactoryI) {}
 
    async getApp(tenantName: string, appName: string): Promise<App | null> { return  null }
    async putApp(tenantName: string, appName: string, app: App): Promise<App> { return app }
    async getSchema(tenantName: string, appName: string): Promise<Schema | null>  { return null }
    async putSchema(tenantName: string, appName: string, schema: Schema): Promise<Schema> { return schema }
    async getAppPage(tenantName: string, appName: string, pageName: string): Promise<AppPage | undefined>  { return undefined }
    async getPageHtml(tenantName: string, appName: string, pageName: string): Promise<string | null>  { return null }
    async savePageHtml(tenantName: string, appName: string, pageName: string, html: string): Promise<void>  { throw new Error('not implemented')}
}
