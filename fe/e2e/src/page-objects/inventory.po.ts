import {browser, element, by, ElementFinder} from 'protractor';

export class InventoryPage {
  general = element(by.css('a[ng-reflect-router-link*="GEN"]'));
  inventory = element(by.css('a[ng-reflect-router-link*="INV"]'));
  reports = element(by.css('a[ng-reflect-router-link*="REP"]'));
  
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
    await browser.sleep(10);
    await this.general.getText();
    await this.inventory.getText();
    await this.reports.getText();    
  }
}
