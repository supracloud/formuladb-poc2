/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import * as _ from "lodash";
import { HotelBooking } from '../po/hotel-booking.po';
import { browser } from 'protractor';
import * as e2e_utils from "../utils";
import { waitUntilNotNull } from '@domain/ts-utils';

var messages = [ '<speak>Welcome to the Hotel Booking app template. As an admin you can customize the app. On the left side pane there are the available data tables<break time="1s"/></speak>',
                 '<speak>For the Hotel Booking app you will already find a few predefined Tables like RoomType, Room or Booking<break time="1s"/></speak>',
                 '<speak>Also there are a few predefined Pages like the home page, about page, gallery page, contact page<break time="1s"/></speak>',
                 '<speak>Under Room Type you will find predefined types of rooms. You could also add your own if none of the default ones matches<break time="1s"/></speak>',
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
