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
  }
}
