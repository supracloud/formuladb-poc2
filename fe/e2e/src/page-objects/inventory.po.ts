import {browser, element, by} from 'protractor';

export class InventoryPage {
  general = element(by.xpath('body/frmdb-root[1]/frmdb-layout[1]/div[1]/div[1]/div[1]/frmdb-navigation[1]/ul[1]/li[1]/a[1]'));
  inventory = element(by.xpath('body/frmdb-root[1]/frmdb-layout[1]/div[1]/div[1]/div[1]/frmdb-navigation[1]/ul[1]/li[2]/a[1]'));
  reports = element(by.xpath('body/frmdb-root[1]/frmdb-layout[1]/div[1]/div[1]/div[1]/frmdb-navigation[1]/ul[1]/li[3]/a[1]'));
  
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
    await this.general.getText();
    await this.inventory.getText();
    await this.reports.getText();
  }
}
