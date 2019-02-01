import {browser, element, by} from 'protractor';

export class InventoryPage {
  general = element.all(by.tagName('li')).all(by.className("nav-item")).first();
  inventory = element.all(by.tagName('li')).all(by.className("nav-item")).get(1)
  reports = element.all(by.tagName('li')).all(by.className("nav-item")).get(2);
  
  async navigateToHome() {
    await browser.get('/inventory/0');
  }

  async getTitle() {
    return browser.getTitle();
  }

  async navigateToGeneral() {
    await this.general.click();
  }

  async navigateToInventory() {
    await this.inventory.click();
  }

  async navigateToReports() {
    await this.reports.click();
  }

  async checkEntities() {
    let c = await element.all(by.tagName('li')).count();
    expect(c).toEqual(3);
    await this.general.getText();
    await this.inventory.getText();
    await this.reports.getText();
  }
}
