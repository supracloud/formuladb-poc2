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
    
  it('should load the booking tables', async () => {
    // check that all hotel booking tables are displayed (left menu)
    let bookingTables: Array<string> = await hotelBooking.getTables();
    expect(['RoomType', 'Room', 'Booking'].sort().toString() == bookingTables.sort().toString());
  });

  it('should load the rooms list', async () => {
    // check that rooms list is correctly displayed after clicking on Room table; verify the first row against the e2e data
    let bookingTables: { id: string, value: string }[] = await hotelBooking.getFirstRoomData();
    console.log(bookingTables);
    //expect(['RoomType', 'Room', 'Booking'].sort().toString() == bookingTables.sort().toString());
  });
});
