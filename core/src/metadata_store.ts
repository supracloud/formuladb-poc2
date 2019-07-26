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
                    { name: "booking", html: "booking.html" },
                    { name: "footer [Fragment]", html: "footer._fragment_.html" },
                    { name: "index [Template]", html: "index._template_.html" },
                    { name: "accommodation [Template]", html: "accommodation._template_.html" },
                    { name: "contact [Template]", html: "contact._template_.html" },
                    { name: "gallery [Template]", html: "gallery._template_.html" },
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