/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 * 
 */

import { HomePage } from './page-objects/home-page.po';
import { InventoryPage } from './page-objects/inventory.po';
import { browser } from 'protractor';

describe('Inventory App Base E2E', () => {
  const homePage = new HomePage();
  let inventory: InventoryPage|undefined = undefined;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
  });

  it('Should navigate to home page and check title', async () => {
    await homePage.navigateToHome();
    expect(homePage.getTitle()).toEqual('Fe');
  });

  it('Should navigate to inventory page and check title', async () => {
    await homePage.navigateToInventory();
    expect(homePage.getTitle()).toEqual('Fe');
  });

  it('Should have the inventory entities', async () => {
    inventory = new InventoryPage();
    await inventory.checkEntities();
  });

  it('Should navigate to inventory', async () => {
    await inventory!.navigateToInventory();
  });

  it('Should navigate to product locations', async () => {
    await inventory!.openProductLocations();
  });

  it('Should display correct data', async () => {
    expect(await inventory!.getRowsCount()).toEqual(26);
  });

  it('Should group table by category', async () => {
    expect(await inventory!.groupByCategory());
  });

  it('Should open first group', async () => {
    expect(await inventory!.openFirstGroup());
  });

  it('Should have the right number of rows', async () => {
    // category + childs
    expect(await inventory!.getRowsCount()).toEqual(27);
  });

  it('Should select first inventory order', async () => {
    expect(await inventory!.selectFirstInventoryOrder());
    browser.sleep(10000);
  });
});
