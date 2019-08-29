import { App } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";
import { InventoryApp, InventorySchema } from "@test/inventory/metadata";
import { FormuladbIoApp, FormuladbIoSchema } from "@test/formuladb.io/metadata";
import { savePage, getPage } from "@be/git-storage";
import { KeyObjStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
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

    async getPage(tenantName: string, appName: string, pageName: string): Promise<Page> {
        let page = await this.kvsFactory.getPage(`${tenantName}/${appName}/${pageName}.html`);
        if (!page) {
            let pageHtml = (await getPage(tenantName, appName, pageName)).content;
            page = {_id: `${tenantName}/${appName}/${pageName}.html`, html: pageHtml};
            await this.kvsFactory.putPage(page);
        }

        return page;
    }

    async savePage(tenantName: string, appName: string, pageName: string, html: string): Promise<void> {
        let page = {_id: `${tenantName}/${appName}/${pageName}.html`, html};
        await this.kvsFactory.putPage(page);

        return savePage(tenantName, appName, pageName, html);
    }
}
