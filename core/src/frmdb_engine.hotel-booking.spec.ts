/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from "lodash";
import { FrmdbEngine } from "@core/frmdb_engine";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { getFrmdbEngine, getTestFrmdbEngine } from "@storage/key_value_store_impl_selector";
import { KeyValueObj } from "@domain/key_value_obj";
import { ServerEventModifiedFormData } from "@domain/event";
import { Schema_booking } from "@test/mocks/mock-metadata";
import { Act_Wiza, Act_Collins } from "@test/mocks/general-data";
import { Room_DoubleDeluxe1, HotelBookingData, RoomType_DoubleDeluxe } from "@test/hotel-booking/data";

describe(`[BE] FrmdbEngine hotel_booking [FRMDB_STORAGE=${process.env.FRMDB_STORAGE}]`, () => {
    let frmdbTStore: FrmdbEngineStore;
    let frmdbEngine: FrmdbEngine;

    beforeEach(async (done) => {
        frmdbEngine = await getTestFrmdbEngine(Schema_booking);
        frmdbTStore = frmdbEngine.frmdbEngineStore;
        await frmdbTStore.kvsFactory.clearAllForTestingPurposes();
        await frmdbEngine.init();

        for (let obj of HotelBookingData) {
            await putObj(obj);
        }

        done();
    });

    async function putObj(obj: KeyValueObj): Promise<ServerEventModifiedFormData> {
        return await frmdbEngine.processEvent(new ServerEventModifiedFormData(obj)) as ServerEventModifiedFormData;
    }

    console.log("Should allow non-overlapping bookings to be created", async (done) => {
        let newBooking = { 
            _id: "Booking~~", 
            room: Room_DoubleDeluxe1._id, 
            start_date: '2019-03-19', 
            end_date: '2019-03-24', 
            user: Act_Wiza._id,
        }

        let newBk: any = (await putObj(newBooking)).obj;
        expect(newBk).toEqual(jasmine.objectContaining({
            days: 6,
            cost: RoomType_DoubleDeluxe.price * 6,
        }));

        let bk1After: any = await frmdbTStore.getDataObj(RoomType_DoubleDeluxe._id);
        expect(bk1After).toEqual(jasmine.objectContaining({
            // overlapping: 3,FIXME: create formula for computing overlaping
        }));

        let newBk2: any = (await putObj({
            ...newBooking,
            user: Act_Collins._id,
        } as any)).obj;
        expect(newBk2).toEqual(jasmine.objectContaining({
            days: 6,
            cost: RoomType_DoubleDeluxe.price * 6,
        }));

        done();
    });
});
