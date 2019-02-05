import {browser, element, by, ElementFinder, ExpectedConditions} from 'protractor';
import { NoRowsOverlayComponent } from 'ag-grid-community/dist/lib/rendering/overlays/noRowsOverlayComponent';

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

  async getRowsCount() {
    let rows = element.all(by.css('div[role*="row"]'));
    await browser.wait(ExpectedConditions.visibilityOf(rows.get(0)), 10000);
    await browser.wait(ExpectedConditions.visibilityOf(rows.get(25)), 10000);
    return await rows.count();    
  }
}
