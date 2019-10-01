/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import * as _ from "lodash";
import { HotelBooking } from '../po/hotel-booking.po';
import { browser, Key } from 'protractor';
import * as e2e_utils from "../utils";

var messages = ['<speak>Welcome to the Hotel Booking app template draft intro video. As an admin you can customize the app. On the left side pane there are the available data tables<break time="2s"/></speak>',
  '<speak>For the Hotel Booking app you will find a few predefined Tables like RoomType, Room or Booking<break time="2s"/></speak>',
  '<speak>You will also find the predefined Pages like the home page, about page, gallery page, contact page<break time="2s"/></speak>',
  '<speak>You can get started quickly with very simple cosmetic/branding changes like change the color palette<break time="2s"/></speak>',
  '<speak>and the website language<break time="2s"/></speak>',
  '<speak>You can create more powerful customizations by binding Page elements to data from Table Records<break time="5s"/></speak>',
  '<speak>For example you can display the room types as a list of cards<break time="12s"/></speak>',
  '<speak>You can use Formulas to perform computations<break time="9s"/></speak>',
  '<speak>Please follow formuladb.io for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations and much much more.<break time="2s"/></speak>',
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
    await browser.sleep(2500);
    let icon = await hotelBooking.getLogoIcon();
    let color = await icon.getCssValue('color');
    expect(color).toEqual('rgba(255, 0, 0, 1)');

    await (await hotelBooking.byCss('#frmdb-editor-color-palette-select')).click();
    colors = await hotelBooking.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
    await colors[0].click();
    await browser.sleep(2500);
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
    await browser.sleep(1051);
    let departureDateFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::end_date"]');
    await hotelBooking.clickWithJs(arivalDateFormEl);
    await browser.sleep(150);
    await hotelBooking.clickWithJs(departureDateFormEl);
    await browser.sleep(150);
    await hotelBooking.clickWithJs(arivalDateFormEl);

    await browser.sleep(1051);
    await hotelBooking.clickWithJs(departureDateFormEl);
    //TODO check background color of column in the data grid

    await browser.sleep(1051);
    //TODO check background color of column in the data grid
    let nbAdultsFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::nb_adults"]');
    await hotelBooking.clickWithJs(nbAdultsFormEl);

    await browser.sleep(1051);
    //TODO check background color of column in the data grid
    let nbChildrenFormEl = await hotelBooking.byCssInFrame('[data-frmdb-value="::nb_children"]');
    await hotelBooking.clickWithJs(nbChildrenFormEl);
    await browser.sleep(1051);
    //TODO check background color of column in the data grid
  });

  it('should work with data binding for cards', async () => {
    try {
      await e2e_utils.handle_generic_action(durations[action_index++]);
      await hotelBooking.scrollIframe(950);
      await browser.sleep(150);
      let el = await hotelBooking.byCss('[href="#data-left-panel-tab"]');
      await el.click();

      console.log(new Date(), 'delete hardcoded cards, leave just the first one');
      for (let i = 0; i < 3; i++) {
        el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
        await hotelBooking.clickWithJs(el);
        await browser.sleep(956);
        el = await hotelBooking.byCss('#select-box #select-actions #delete-btn');
        await el.click();
      }

      console.log(new Date(), 'configure data binding for the fist card');
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
      await hotelBooking.clickWithJs(el);
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-table-limit"] input');
      await el.sendKeys('1');
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-table"] select');
      await el.click();
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-table"] select [value="$FRMDB.RoomType[]"]');
      await el.click();
      await browser.sleep(956);

      console.log(new Date(), 'configure data binding for img');
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) img');
      await hotelBooking.clickWithJs(el);
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-value"] select');
      await el.click();
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].picture"]');
      await el.click();
      await browser.sleep(956);

      console.log(new Date(), 'configure data binding for h4');
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) a h4');
      await hotelBooking.clickWithJs(el);
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-value"] select');
      await el.click();
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].name"]');
      await el.click();
      await browser.sleep(956);

      console.log(new Date(), 'repeat card 7 times');
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
      await hotelBooking.clickWithJs(el);
      await browser.sleep(956);
      el = await hotelBooking.byCss('[data-key="data-frmdb-table-limit"] input');
      await el.clear(); await el.sendKeys('7'); await el.sendKeys(Key.ENTER);
      await browser.sleep(956);

      console.log(new Date(), 'scroll to each of the 7 cards');
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(980);
      await browser.sleep(550);
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(3)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(1000);
      await browser.sleep(550);
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(4)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(1100);
      await browser.sleep(550);
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(5)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(1200);
      await browser.sleep(550);
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(6)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(1300);
      await browser.sleep(550);
      el = await hotelBooking.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(7)');
      await hotelBooking.clickWithJs(el);
      await hotelBooking.scrollIframe(1350);
      await browser.sleep(550);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it('should allow basic formula editing', async () => {
    try {
      await e2e_utils.handle_generic_action(durations[action_index++]);
      
      //select booking table
      let el = await hotelBooking.byCss('[data-frmdb-value="$frmdb.selectedTableId"]');
      await el.click();
      await browser.sleep(957);
      let els = await hotelBooking.allByCss('[data-frmdb-value="$frmdb.tables[]._id"]');
      let found = false;
      for (el of els) {
        let txt = await el.getAttribute('innerText');
        if ('Booking' === txt) {
          found = true;
          await (await hotelBooking.byCss('[data-frmdb-value="$frmdb.selectedTableId"]')).click();
          await el.click();
        }
      }
      expect(found).toEqual(true);
      await browser.sleep(957);
      
      //select day column
      el = await hotelBooking.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
      await el.click();
      await browser.sleep(150);
      el = await hotelBooking.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="nb_children"]');
      await el.click();
      await browser.sleep(150);
      el = await hotelBooking.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
      await el.click();
      await browser.sleep(957);

      el = await hotelBooking.byCss('.editor-textarea');
      expect(await el.getAttribute('value')).toEqual('DATEDIF(start_date, end_date, "D") + 1');
      await browser.sleep(250);
      
      el = await hotelBooking.byCss('#toggle-formula-editor');
      await el.click();
      await browser.sleep(957);

      el = await hotelBooking.byCss('.editor-textarea');
      await el.click();
      await browser.sleep(551);
      await browser.sleep(957);
      await el.sendKeys('00'); await el.sendKeys(Key.TAB);
      await browser.sleep(957);

      el = await hotelBooking.byCss('#apply-formula-changes');
      await el.click();
      await browser.sleep(957);

      var alertDialog = browser.switchTo().alert();
      let txt = await alertDialog.getText();
      expect(txt).toContain('Please confirm, apply modifications to DB');
      await alertDialog.accept();  // Use to accept (simulate clicking ok)
      await browser.switchTo().defaultContent();
      await browser.sleep(957);
      await browser.sleep(957);

      el = await hotelBooking.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
      await el.click();
      txt = await el.getAttribute('innerText');
      expect(txt).toContain('104.00');
      await browser.sleep(1150);

    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  it('please follow formuladb.io', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);
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
