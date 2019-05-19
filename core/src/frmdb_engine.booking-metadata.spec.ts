/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngine } from "@core/frmdb_engine";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { getFrmdbEngine } from "@storage/key_value_store_impl_selector";
import { KeyValueObj } from "@domain/key_value_obj";
import { ServerEventModifiedFormDataEvent } from "@domain/event";
import { Schema_booking } from "./mock-metadata";
import { Act_Wiza, Act_Collins } from "./general-data";
import { BookingData, BkItem1 } from "./booking-data";

describe('FrmdbEngine', () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;

    beforeEach(async (done) => {
        frmdbEngine = await getFrmdbEngine(Schema_booking);
        frmdbTStore = frmdbEngine.frmdbEngineStore;
        await frmdbTStore.kvsFactory.clearAll();
        await frmdbEngine.init();

        for (let obj of BookingData) {
            await putObj(obj);
        }

        done();
    });

    async function putObj(obj: KeyValueObj): Promise<ServerEventModifiedFormDataEvent> {
        return await frmdbEngine.processEvent(new ServerEventModifiedFormDataEvent(obj)) as ServerEventModifiedFormDataEvent;
    }

    it("Should allow non-overlapping bookings to be created", async (done) => {
        let newBooking = { 
            _id: "Booking~~", 
            booking_item_id: BkItem1._id, 
            start_date: '2019-03-19', 
            end_date: '2019-03-24', 
            booking_item_name: BkItem1.name,
            booking_item_price: BkItem1.price,
            user_id: Act_Wiza._id,
            user_name: Act_Wiza.name
        }

        let newBk: any = (await putObj(newBooking)).obj;
        expect(newBk).toEqual(jasmine.objectContaining({
            days: 6,
            cost: BkItem1.price * 6,
        }));

        let bk1After: any = await frmdbTStore.getDataObj(BkItem1._id);
        expect(bk1After).toEqual(jasmine.objectContaining({
            name: BkItem1.name,
            overlapping: 3,
        }));

        let newBk2: any = (await putObj({
            ...newBooking,
            user_id: Act_Collins._id,
            user_name: Act_Collins.name
        } as any)).obj;
        expect(newBk2).toEqual(jasmine.objectContaining({
            days: 6,
            cost: BkItem1.price * 6,
        }));

        done();
    });

});
