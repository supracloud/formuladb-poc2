/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
import { HotelBooking } from '../po/hotel-booking.po';

const hotelBooking = new HotelBooking();

describe('hotel-booking view mode testing', () => {
  it('should display the home page', async () => {
    // check that page loads and title is as expected
    await hotelBooking.navigateToHome();
    expect(await hotelBooking.getPageTitle()).toEqual('Relax Your Mind');
  });
    
  it('should load the booking tables: RoomType, Room, Booking', async () => {
    // check that at least hotel booking tables ('RoomType', 'Room', 'Booking') are displayed in the left navbar
    let bookingTables: Array<string> = await hotelBooking.getTables();
    ['RoomType', 'Room', 'Booking'].forEach(x => expect(bookingTables.indexOf(x)).toBeGreaterThan(-1));
  });

  it('should load the room types list', async () => {
    // check that room types list is correctly displayed; verify the first row against the e2e data
    let roomTypes: { id: string, value: string }[] = await hotelBooking.getFirstRoomTypeData();
    console.log(roomTypes);
    //expect(['RoomType', 'Room', 'Booking'].sort().toString() == bookingTables.sort().toString());
  });
});
