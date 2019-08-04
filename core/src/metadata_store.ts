import { App } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { HotelBookingApp, HotelBookingSchema } from "@test/hotel-booking/metadata";

export class MetadataStore {
    getApp(tenantName: string, appName: string): Promise<App | null> {
        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("hotel-booking" === appName) {
            return Promise.resolve(HotelBookingApp);
        }
        return Promise.resolve(null);
    }

    getSchema(tenantName: string, appName: string): Promise<Schema | null> {
        //TODO: get this information from persistent storage using a MetadataStorage generic interface (e.g. git storage, object storage)
        if ("hotel-booking" === appName) {
            return Promise.resolve(HotelBookingSchema);
        }
        return Promise.resolve(null);  
    }    
}