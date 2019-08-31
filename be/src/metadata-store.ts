import { App, AppPage } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";
import { InventoryApp, InventorySchema } from "@test/inventory/metadata";
import { FormuladbIoApp, FormuladbIoSchema } from "@test/formuladb.io/metadata";
import { savePage, getPageContent } from "@be/git-storage";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { Page } from "@domain/uimetadata/page";

export class MetadataStore {
    constructor(public kvsFactory: KeyValueStoreFactoryI) {

    }
   
    getApp(tenantName: string, appName: string): Promise<App | null> {
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

    getSchema(tenantName: string, appName: string): Promise<Schema | null> {
        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("formuladb.io" === appName) {
            return Promise.resolve(FormuladbIoSchema);
        } else if ("hotel-booking" === appName) {
            return Promise.resolve(HotelBookingSchema);
        } else if ("inventory" === appName) {
            return Promise.resolve(InventorySchema);
        }
        return Promise.resolve(null);
    }

    async getAppPage(tenantName: string, appName: string, pageName: string): Promise<AppPage | undefined> {
        let app = await this.getApp(tenantName, appName);
        if (!app) throw new Error(`Cannot find app for page ${tenantName}/${appName}/${pageName}`);
        let appPage = app.pages.find(p => p.name == pageName);
        return appPage;
    }

    async getPageHtml(tenantName: string, appName: string, pageName: string): Promise<string> {
        let page = await this.kvsFactory.getPage(`${tenantName}/${appName}/${pageName}`);
        if (!page) {
            let appPage = await this.getAppPage(tenantName, appName, pageName);
            if (!appPage) throw new Error(`Cannot find app page for ${tenantName}/${appName}/${pageName}`);
            let pageHtml = (await getPageContent(tenantName, appName, pageName));
            page = {_id: `${tenantName}/${appName}/${pageName}`, name: appPage.name, title: appPage.title, html: pageHtml};
            await this.kvsFactory.putPage(page);
        }
        return page.html;
    }

    async savePageHtml(tenantName: string, appName: string, pageName: string, html: string): Promise<void> {
        let appPage = await this.getAppPage(tenantName, appName, pageName);
        if (!appPage) throw new Error(`Cannot find app page for ${tenantName}/${appName}/${pageName}`);
        let page = {_id: `${tenantName}/${appName}/${pageName}`, name: appPage.name, title: appPage.title, html: html};
        await this.kvsFactory.putPage(page);

        return savePage(tenantName, appName, pageName, html);
    }
}
