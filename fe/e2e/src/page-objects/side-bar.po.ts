import {browser, element, by, ElementFinder, ExpectedConditions} from 'protractor';

export class SideBarPage {
  general = element(by.css('a[ng-reflect-router-link*="GEN"]'));
  inventory = element(by.css('a[ng-reflect-router-link*="INV"]'));
  reports = element(by.css('a[ng-reflect-router-link*="REP"]'));
  
  async getTitle() {
    return browser.getTitle();
  }

  async navigateToHome() {
    await browser.get('/inventory/0');
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

  async openInventoryOrders() {
    let prod = element(by.css('a[ng-reflect-router-link="INV__Order"]'));
    await browser.wait(ExpectedConditions.visibilityOf(prod), 10000);
    await prod.click();
  }

  async checkEntities() {
    await browser.wait(ExpectedConditions.visibilityOf(this.general), 10000);
    await browser.wait(ExpectedConditions.visibilityOf(this.inventory), 10000);
    await browser.wait(ExpectedConditions.visibilityOf(this.reports), 10000);
  }

  async openProductLocations() {
    let prod = element(by.css('a[ng-reflect-router-link*="INV__PRD"]'));
    let prodLoc = element(by.css('a[ng-reflect-router-link*="INV__PRD__Location"]'));
    await browser.wait(ExpectedConditions.visibilityOf(prod), 10000);
    await prod.click();
    await browser.wait(ExpectedConditions.visibilityOf(prodLoc), 10000);
    await prodLoc.click();
    
  }
}
