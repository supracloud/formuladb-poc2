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

describe('Inventory App Base E2E', () => {
  const homePage = new HomePage();
  let sideBar: SideBarPage|undefined = undefined;
  let inventoryPL: InventoryProductLocationPage|undefined = undefined;
  let inventoryOrders: InventoryOrdersPage|undefined = undefined;
  let inventoryOrder: InventoryOrderPage|undefined = undefined;
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
    sideBar = new SideBarPage();
    await sideBar.checkEntities();
  });

  it('Should navigate to inventory', async () => {
    await sideBar!.navigateToInventory();
  });

  it('Should navigate to product locations', async () => {
    await sideBar!.openProductLocations();
  });

  it('Should display correct data', async () => {
    inventoryPL = new InventoryProductLocationPage();
    await inventoryPL!.waitForRowsCount(26);
  });

  it('Should group table by category', async () => {
    expect(await inventoryPL!.groupByCategoryName("Categorie"));
  });

  it('Should open first group', async () => {
    expect(await inventoryPL!.openGroupByIndex(0));
  });

  it('Should have the right number of rows', async () => {
    // categories + childs
    await inventoryPL!.waitForRowsCount(20);
  });

  it('Should select first inventory order', async () => {
    inventoryOrders = new InventoryOrdersPage();
    await sideBar!.openInventoryOrders();
    await inventoryOrders!.selectInventoryOrderByIndex(0);
  });

  it('Should display correct data in order page', async () => {
    inventoryOrder = new InventoryOrderPage();
    await inventoryOrder.checkData();
  });

  it('Should edit item quantity and be auto-corrected', async () => {
    await inventoryOrder!.updateItemQuantity(1, '1000');

    expect(inventoryOrder!.waitForItemQuantity(1, '15', 5000)).toEqual('15');
    expect(inventoryOrder!.waitForErrorQuantity(1, '985', 5000)).toEqual('985');
  });

  it('Should navigate to product locations', async () => {
    await sideBar!.openProductLocations();
  });

  it('Should have zero stock', async () => {
    expect(Number(await inventoryPL!.getStockInRowById('INV__PRD__Location~~1__1a'))).toEqual(Number('0.0'));
  });

});
