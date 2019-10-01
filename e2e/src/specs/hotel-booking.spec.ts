/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import * as _ from "lodash";
import { HotelBooking } from '../po/hotel-booking.po';
import { browser } from 'protractor';
import * as e2e_utils from "../utils";

var messages = [ '<speak>Welcome to the Hotel Booking app template draft intro video. As an admin you can customize the app. On the left side pane there are the available data tables<break time="1s"/></speak>',
                 '<speak>For the Hotel Booking app you will find a few predefined Tables like RoomType, Room or Booking<break time="1s"/></speak>',
                 '<speak>You will also find the predefined Pages like the home page, about page, gallery page, contact page<break time="1s"/></speak>',
                 '<speak>You can get started quickly with very simple cosmetic/branding changes like change the color palette</speak>',
                 '<speak>and the website language<break time="1s"/></speak>',
                 '<speak>You can create more powerful customizations by binding Page elements to data from Table Records<break time="1s"/></speak>',
                 '<speak>For example you can display the room types as a list of cards<break time="1s"/></speak>',
                 '<speak>You can use Formulas to perform computations<break time="1s"/></speak>',
                 '<speak>Please follow formuladb.io for more details and news about the official launch.<break time="1s"/></speak>',
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
    await browser.sleep(550);
    await colors[1].click();
    await browser.sleep(200);
    let icon = await hotelBooking.getLogoIcon();
    let color = await icon.getCssValue('color');
    expect(color).toEqual('rgba(255, 0, 0, 1)');
    await browser.sleep(2200);

    await (await hotelBooking.byCss('#frmdb-editor-color-palette-select')).click();
    colors = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
    await colors[0].click();
    await browser.sleep(1500);
    icon = await hotelBooking.getLogoIcon();
    color = await icon.getCssValue('color');
    expect(color).toEqual('rgba(243, 195, 0, 1)');
  });

  it('should change language', async () => {
    await e2e_utils.handle_element_click(await hotelBooking.byCss('#frmdb-editor-i18n-select'), durations[action_index++]);
    let languages = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
    await browser.sleep(550);
    await languages[1].click();
    await browser.sleep(2200);
    expect(await hotelBooking.getPageTitle()).toEqual('Détends ton esprit');

    await (await hotelBooking.byCss('#frmdb-editor-i18n-select')).click();
    languages = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
    await languages[0].click();
    await browser.sleep(2200);
    expect(await hotelBooking.getPageTitle()).toEqual('Relax Your Mind');
  });

  it('should highlight column for data binding', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);
    await hotelBooking.scrollIframe(350);
    let arivalDateFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::start_date"]');
    await browser.sleep(1000);
    let departureDateFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::end_date"]');
    await hotelBooking.clickWithJs(arivalDateFormEl);
    await browser.sleep(150);
    await hotelBooking.clickWithJs(departureDateFormEl);
    await browser.sleep(150);
    await hotelBooking.clickWithJs(arivalDateFormEl);

    await browser.sleep(1050);
    await hotelBooking.clickWithJs(departureDateFormEl);
    //TODO check background color of column in the data grid

    await browser.sleep(1050);
    //TODO check background color of column in the data grid
    let nbAdultsFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::nb_adults"]');
    await hotelBooking.clickWithJs(nbAdultsFormEl);

    await browser.sleep(1050);
    //TODO check background color of column in the data grid
    let nbChildrenFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::nb_children"]');
    await hotelBooking.clickWithJs(nbChildrenFormEl);
    await browser.sleep(1050);
    //TODO check background color of column in the data grid
  });

  it('should work with data binding for cards', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);
    await hotelBooking.scrollIframe(950);
    await browser.sleep(150);
    let el = await hotelBooking.byCss('[href="#data-left-panel-tab"]');
    await el.click();

    for (let i = 0; i < 3; i++) {
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
      await hotelBooking.clickWithJs(el);
      await browser.sleep(450);
      el = await hotelBooking.byCss('#select-box #select-actions #delete-btn');
      await el.click();
    }

    el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
    await hotelBooking.clickWithJs(el);
    await browser.sleep(450);
    el = await hotelBooking.byCss('#select-box #select-actions #delete-btn');

    await browser.sleep(10050);
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
