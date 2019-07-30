/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import { HomePage } from './page-objects/home-page.po';
import { SideBarPage } from './page-objects/side-bar.po';
import { InventoryProductLocationPage } from './page-objects/inventory-product-location.po';
import { InventoryOrdersPage } from './page-objects/inventory-orders.po';
import { InventoryOrderPage } from './page-objects/inventory-order.po';
import { browser } from 'protractor';
import * as e2e_utils from "./utils";

var messages = [ '<speak>Navigate to inventory page<break time="1s"/></speak>',
                 '<speak>Navigate to inventory<break time="1s"/></speak>',
                 '<speak>Navigate to product locations<break time="1s"/></speak>',
                 '<speak>Notice the data in product locations<break time="1s"/></speak>',
                 '<speak>Group table by category<break time="1s"/></speak>',
                 '<speak>Open first group<break time="1s"/></speak>',
                 '<speak>See the right number of rows<break time="1s"/></speak>',
                 '<speak>Select first inventory order<break time="1s"/></speak>',
                 '<speak>See the data in order page<break time="1s"/></speak>',
                 '<speak>Edit item quantity and be auto-corrected<break time="1s"/></speak>',
                 '<speak>Navigate back to product locations<break time="1s"/></speak>',
                 '<speak>Notice the stock is zero<break time="1s"/></speak>', 
];

var durations = new Array(messages.length);

describe('Inventory App Base E2E', () => {
  console.log("Recordings flag: ", browser.params.recordings);
  console.log("Audio flag: ", browser.params.audio);
  const homePage = new HomePage();
  let sideBar: SideBarPage|undefined = undefined;
  let inventoryPL: InventoryProductLocationPage|undefined = undefined;
  let inventoryOrders: InventoryOrdersPage|undefined = undefined;
  let inventoryOrder: InventoryOrderPage|undefined = undefined;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

  let stream;
  let test_name = 'inventory-base';
  let action_index = 0;

  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
  });

  it('Should navigate to home page and check title', async () => {

    await homePage.navigateToHome();
    expect(homePage.getTitle()).toEqual('Fe');

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

  it('Should navigate to inventory page and check title', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    await homePage.navigateToInventory();
    expect(homePage.getTitle()).toEqual('Fe');
  });

  it('Should have the inventory entities', async () => {
    sideBar = new SideBarPage();
    await sideBar.checkEntities();
  });

  it('Should navigate to inventory', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    await sideBar!.navigateToInventory();
  });

  it('Should navigate to product locations', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    await sideBar!.openProductLocations();
  });

  it('Should display correct data in product locations', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    inventoryPL = new InventoryProductLocationPage();
    await inventoryPL!.waitForRowsCount(26);
  });

  it('Should group table by category', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    expect(await inventoryPL!.groupByCategoryName("Categorie"));
  });

  it('Should open first group', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    expect(await inventoryPL!.openGroupByIndex(0));
  });

  it('Should have the right number of rows', async () => {
    // categories + childs
    await inventoryPL!.waitForRowsCount(20);
  });

  it('Should select first inventory order', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    inventoryOrders = new InventoryOrdersPage();
    await sideBar!.openInventoryOrders();
    await inventoryOrders!.selectInventoryOrderByIndex(0);
  });

  it('Should display correct data in order page', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    inventoryOrder = new InventoryOrderPage();
    await inventoryOrder.checkData();
  });

  it('Should edit item quantity and be auto-corrected', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    await inventoryOrder!.updateItemQuantity(1, '1000');

    expect(inventoryOrder!.waitForItemQuantity(1, '15', 20000)).toEqual('15');
    expect(inventoryOrder!.waitForErrorQuantity(1, '985', 20000)).toEqual('985');
  });

  it('Should navigate to product locations', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    await sideBar!.openProductLocations();
  });

  it('Should have zero stock', async () => {
    await e2e_utils.handle_generic_action(durations[action_index++]);

    expect(Number(await inventoryPL!.getStockInRowById('ProductLocation~~1__1a'))).toEqual(Number('0.0'));
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
