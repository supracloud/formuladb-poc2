import { App } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { Schema_booking } from "@test/mocks/mock-metadata";

export class MetadataStore {
    getApp(tenantName: string, appName: string): Promise<App | null> {
        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("royal-hotel" === appName) {
            return Promise.resolve({
                _id: "royal-hotel",
                description: "Booking app for Royal Hotel",
                pages: [
                    { name: "index", html: "index.html" },
                    { name: "about", html: "about.html" },
                    { name: "accomodation", html: "accomodation.html" },
                    { name: "blog-single", html: "blog-single.html" },
                    { name: "blog", html: "blog.html" },
                    { name: "contact", html: "contact.html" },
                    { name: "elements", html: "elements.html" },
                    { name: "gallery", html: "gallery.html" },
                ],
            });
        }
        return Promise.resolve(null);  
    }

    getSchema(tenantName: string, appName: string): Promise<Schema | null> {
        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("royal-hotel" === appName) {
            return Promise.resolve(Schema_booking);
        }
        return Promise.resolve(null);  
    }    
}