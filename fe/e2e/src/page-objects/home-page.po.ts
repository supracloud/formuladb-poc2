import {browser, element, by} from 'protractor';

export class HomePage {
  inventory = element(by.linkText('Basic Inventory, Single Warehouse'));
  
  async navigateToHome() {
    await browser.get('/');
  }

  async getTitle() {
    return browser.getTitle();
  }

  async navigateToInventory() {
    await this.inventory.click();
    await browser.waitForAngular();
    // Looking for a mechanism in protractor to wait for the page to load ...
    await browser.sleep(1000);
  }
}
