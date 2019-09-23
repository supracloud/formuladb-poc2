import { App, AppPage } from "@domain/app";
import { Schema, isSchema } from "@domain/metadata/entity";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";
import { InventoryApp, InventorySchema } from "@test/inventory/metadata";
import { FormuladbIoApp, FormuladbIoSchema } from "@test/formuladb.io/metadata";
import { KeyValueStoreFactoryI, KeyObjStoreI } from "@storage/key_value_store_i";
import { Page } from "@domain/uimetadata/page";
import * as fetch from 'node-fetch';
import * as moment from 'moment';
import * as Diff from 'diff';

import { Storage } from '@google-cloud/storage';
const STORAGE = new Storage({
    projectId: "seismic-plexus-232506",
});

export class MetadataStore {
    metadataKOS: KeyObjStoreI<App | Schema | Page>;

    constructor(private envName: string, public kvsFactory: KeyValueStoreFactoryI) { }

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

        if (!schema) throw new Error(`Schema not found FRMDB_SCHEMA~~${tenantName}--${appName}`);
        else if (!isSchema(schema)) throw new Error("Not a schema " + JSON.stringify(schema));
        else return schema;
    }

    async getAppPage(tenantName: string, appName: string, pageName: string): Promise<AppPage | undefined> {
        let metadataKOS = await this.getMetadataKOS();

        let app = await this.getApp(tenantName, appName);
        if (!app) throw new Error(`Cannot find app for page ${tenantName}/${appName}/${pageName}`);
        let appPage = app.pages.find(p => p.name == pageName);
        return appPage;
    }

    async deletePage(deletedPagePath: string): Promise<void> {
        let [tenantName, appName, pageName] = deletedPagePath.split(/\//).filter(x => x);
        let oldGcFile = STORAGE.bucket('formuladb-static-assets').file(`${this.envName}/${tenantName}/${appName}/${pageName}`);
        await oldGcFile.delete();

        let app = await this.getApp(tenantName, appName);
        if (!app) throw new Error(`App ${tenantName}/${appName} not found`);
        app.pages = app.pages.filter(p => p.name != pageName);
        await this.putApp(tenantName, appName, app);
    }

    async newPage(newPageName: string, startTemplateUrl: string) {
        await this.savePageHtml(startTemplateUrl, '', newPageName);
        let [tenantName, appName, pageName] = startTemplateUrl.split(/\//).filter(x => x);
        let app = await this.getApp(tenantName, appName);
        if (!app) throw new Error(`App ${tenantName}/${appName} not found`);
        app.pages.push({name: newPageName, title: newPageName});
        await this.putApp(tenantName, appName, app);
    }

    async savePageHtml(pagePath: string, html: string, newPageName?: string): Promise<void> {
        let [tenantName, appName, pageName] = pagePath.split(/\//).filter(x => x);

        let oldGcFile = STORAGE.bucket('formuladb-static-assets').file(`${this.envName}/${tenantName}/${appName}/${pageName}`);
        let buf = await oldGcFile.download();
        let oldHtml = buf.toString();

        let newGcFile = oldGcFile;
        let newHtml = html;
        let diff = ''
        if (newPageName) {
            newGcFile = STORAGE.bucket('formuladb-static-assets').file(`${this.envName}/${tenantName}/${appName}/${newPageName}`);
            newHtml = oldHtml;
        } else {
            diff = newPageName ? '' : Diff.createTwoFilesPatch('oldHtml', 'html', oldHtml, html, '', '', { context: 5 });
        }

        await new Promise((resolve, reject) => {
            let stream = newGcFile.createWriteStream({
                resumable: false,
                validation: false,
                contentType: "text/html",
                metadata: {
                    'Cache-Control': 'public, max-age=31536000'
                }
            });
            stream.write(newHtml)
            stream.end();
            stream.on("finish", () => resolve(true));
            stream.on("error", reject);
        });

        this.logHistoryEvent(tenantName, appName, pageName, newPageName, newHtml, diff);
    }

    private async logHistoryEvent(tenantName, appName, pageName, newPageName, newHtml, diff) {

        //this will not work in the browser because of CORS
        const timestamp = moment();
        fetch(`https://elasticsearch.formuladb.io/page-${timestamp.format('YYYY-MM-DD')}/_doc`, {
            method: "POST",
            body: JSON.stringify({
                envName: this.envName,
                tenantName,
                appName,
                pageName,
                newPageName,
                newHtml,
                diff,
                '@timestamp': timestamp.format(/*ISO8601*/),
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from("formuladb:HEwAXwhG5Tqd").toString('base64'),
            },
        })
            .then(async (response) => {
                let res = await response.text();
                console.log(res);
            });
    }
}
