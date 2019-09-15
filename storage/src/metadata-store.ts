import { App, AppPage } from "@domain/app";
import { Schema, isSchema } from "@domain/metadata/entity";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";
import { InventoryApp, InventorySchema } from "@test/inventory/metadata";
import { FormuladbIoApp, FormuladbIoSchema } from "@test/formuladb.io/metadata";
import { KeyValueStoreFactoryI, KeyObjStoreI } from "@storage/key_value_store_i";
import { Page } from "@domain/uimetadata/page";
import { GitStorageI } from "./git-storage-i";

import { Storage } from '@google-cloud/storage';
const STORAGE = new Storage({
    projectId: "seismic-plexus-232506",
});

export class MetadataStore {
    metadataKOS: KeyObjStoreI<App | Schema | Page>;

    constructor(private gitStorage: GitStorageI, public kvsFactory: KeyValueStoreFactoryI) {}
   
    async getMetadataKOS() {
        if (!this.metadataKOS) {
            this.metadataKOS = await this.kvsFactory.createKeyObjS<App | Schema | Page>('metadata');
        }
        return this.metadataKOS;
    }

    
    async putApp(tenantName: string, appName: string, app: App): Promise<App> {
        let metadataKOS = await this.getMetadataKOS();
        return metadataKOS.put(app) as Promise<App>;
    }
    async putSchema(tenantName: string, appName: string, schema: Schema): Promise<Schema> {
        let metadataKOS = await this.getMetadataKOS();
        return metadataKOS.put({
            ...schema,
            _id: `FRMDB_SCHEMA~~${tenantName}--${appName}`,
        }) as Promise<Schema>;
    }
    async getPage(pageId: string): Promise<Page | null> {
        let metadataKOS = await this.getMetadataKOS();
        return metadataKOS.get(pageId) as Promise<Page>;
    }
        
    async getApp(tenantName: string, appName: string): Promise<App | null> {
        let metadataKOS = await this.getMetadataKOS();

        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("formuladb.io" === appName) {
            return Promise.resolve(FormuladbIoApp);
        } else if ("hotel-booking" === appName) {
            return Promise.resolve(HotelBookingApp);
        } else if ("inventory" === appName) {
            return Promise.resolve(InventoryApp);
        }
        return Promise.resolve(null);
    }

    async getSchema(tenantName: string, appName: string): Promise<Schema | null> {
        let metadataKOS = await this.getMetadataKOS();
        let schema = await metadataKOS.get(`FRMDB_SCHEMA~~${tenantName}--${appName}`);

        if (!schema) {
            //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
            if ("formuladb.io" === appName) {
                return Promise.resolve(FormuladbIoSchema);
            } else if ("hotel-booking" === appName) {
                return Promise.resolve(HotelBookingSchema);
            } else if ("inventory" === appName) {
                return Promise.resolve(InventorySchema);
            } else return null;
        } else if (!isSchema(schema)) throw new Error("Not a schema " + JSON.stringify(schema));
        else return schema;
    }

    async getAppPage(tenantName: string, appName: string, pageName: string): Promise<AppPage | undefined> {
        let metadataKOS = await this.getMetadataKOS();

        let app = await this.getApp(tenantName, appName);
        if (!app) throw new Error(`Cannot find app for page ${tenantName}/${appName}/${pageName}`);
        let appPage = app.pages.find(p => p.name == pageName);
        return appPage;
    }

    async savePageHtml(pagePath: string, html: string): Promise<void> {
        let [tenantName, appName, pageName] = pagePath.split(/\//).filter(x => x);
        
        return this.gitStorage.savePage(tenantName, appName, pageName, html);
    }
}
