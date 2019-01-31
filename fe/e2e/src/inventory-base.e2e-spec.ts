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

  it('Should navigate to general', async () => {
    await inventory!.navigateToGeneral();
  });
});
