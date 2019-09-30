/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import * as _ from "lodash";
import { HotelBooking } from '../po/hotel-booking.po';
import { browser } from 'protractor';
import * as e2e_utils from "../utils";

var messages = [ '<speak>Welcome to the Hotel Booking app template. As an admin you can customize the app. On the left side pane there are the available data tables<break time="1s"/></speak>',
                 '<speak>For the Hotel Booking app you will already find a few predefined Tables like RoomType, Room or Booking<break time="1s"/></speak>',
                 '<speak>Also there are the predefined Pages like the home page, about page, gallery page, contact page<break time="1s"/></speak>',
                 '<speak>You will be able to make quick cosmetic/branding changes like change the color palette</speak>',
                 '<speak>and the website language<break time="1s"/></speak>',
                 '<speak>You will be able to manage dynamic content and logic by mapping Table data to Page elements, for example we can display a list of Room Types as a list of cards on the home page.<break time="1s"/></speak>',
                 '<speak>Please follow formuladb.io and our social media for news about the official launch.<break time="1s"/></speak>',
];
var durations = new Array(messages.length);

const hotelBooking = new HotelBooking();

describe('hotel-booking view mode testing', () => {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
  let stream;
  let test_name = 'hotel-booking';
  let action_index = 0;

  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
  });

  it('should display the home page', async () => {
    // check that page loads and title is as expected
    await hotelBooking.navigateToHome();
    expect(await hotelBooking.getPageTitle()).toEqual('Relax Your Mind');

    if (browser.params.recordings || browser.params.audio) {
      e2e_utils.setup_directories();
    }

    if (browser.params.audio) {
      await e2e_utils.create_audio_tracks(messages, durations);
    }

    if (browser.params.recordings) {
      stream = e2e_utils.create_stream_and_run();
    }
  });

  it('should have tables drop down', async () => {
    await e2e_utils.handle_element_click(await hotelBooking.getTablesDropdown(), durations[action_index++]);
  });
    
  it('should load the booking tables: RoomType, Room, Booking', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);
    // check that at least hotel booking tables ('RoomType', 'Room', 'Booking') are displayed in the left navbar
    let foundTables = await e2e_utils.retryUntilTrueOrRetryLimitReached(async () => {
      let tables = await hotelBooking.getTables();
      console.log(tables);
      return _.difference(['RoomType', 'Room', 'Booking'], tables).length === 0
    })
    expect(foundTables).toEqual(true);
  });

  it('should load the room types list', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);
    // check that room types list is correctly displayed; verify the first row against the e2e data
    let roomTypes: { id: string, value: string }[] = await hotelBooking.getFirstRoomTypeData();
    console.log(roomTypes);
    //expect(['RoomType', 'Room', 'Booking'].sort().toString() == bookingTables.sort().toString());
  });

  it('should load the page list: index.html, about.html, contact.html', async () => {
    await e2e_utils.handle_element_click(await hotelBooking.getPagesDropdown(), durations[action_index++]);
    // check that at least hotel booking tables ('RoomType', 'Room', 'Booking') are displayed in the left navbar
    let foundPages = await e2e_utils.retryUntilTrueOrRetryLimitReached(async () => {
      let pages = await hotelBooking.getPages();
      console.log(pages);
      return _.difference(['index.html', 'about.html', 'contact.html'], pages).length === 0
    })
    expect(foundPages).toEqual(true);
  });

  it('should change theme color', async () => {
    await e2e_utils.handle_element_click(await hotelBooking.byCss('#frmdb-editor-color-palette-select'), durations[action_index++]);
    let colors = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
    await colors[1].click();
    await browser.sleep(200);
    let icon = await hotelBooking.getLogoIcon();
    let color = await icon.getCssValue('color');
    expect(color).toEqual('rgba(255, 0, 0, 1)');
    await browser.sleep(1000);

    await (await hotelBooking.byCss('#frmdb-editor-color-palette-select')).click();
    colors = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
    await colors[0].click();
    await browser.sleep(500);
    icon = await hotelBooking.getLogoIcon();
    color = await icon.getCssValue('color');
    expect(color).toEqual('rgba(243, 195, 0, 1)');
  });

  it('should change language', async () => {
    await e2e_utils.handle_element_click(await hotelBooking.byCss('#frmdb-editor-i18n-select'), durations[action_index++]);
    let languages = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
    await languages[1].click();
    expect(await hotelBooking.getPageTitle()).toEqual('Relax Your Mind');

    await (await hotelBooking.byCss('#frmdb-editor-i18n-select')).click();
    languages = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
    await languages[0].click();
    expect(await hotelBooking.getPageTitle()).toEqual('Relax Your Mind');
  });

  it('Should end recording and cleanup', async () => {
    if (browser.params.recordings) {
      await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);
      if (browser.params.audio) {
        await e2e_utils.concat_audio(messages);
        await e2e_utils.merge_video_and_audio();
      } else {
        e2e_utils.create_final_video();
      }
      await e2e_utils.crop_video();
      await e2e_utils.create_gif_palette_and_video();
        e2e_utils.cleanup(test_name);
    }
  });

});
