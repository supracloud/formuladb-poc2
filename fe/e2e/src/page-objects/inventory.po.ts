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
    let count = 0;
    try {
      while (true) {
        let row = element(by.css('div[class="ag-center-cols-container"]')).element(by.css(`div[row-id="${count++}"]`));
        await browser.wait(ExpectedConditions.visibilityOf(row), 5000);
      }
    } catch (e) {
      return count - 1;    
    }
  }

  async groupByCategory() {
    // try to get the filter by category row
    let count = 0;
    let elem : ElementFinder | undefined = undefined;
    while (true) {
      elem = element.all(by.css('span[class="ag-column-drag"]')).get(count++);
      let sibling = elem.element(by.xpath('..')).element(by.css('span[class="ag-column-tool-panel-column-label"]'));
      if ((await sibling.getText()) == "Categorie")
        break;
      console.log(await sibling.getText());  
    }
    let target = element(by.css('div[class="ag-column-drop ag-font-style ag-column-drop-vertical ag-column-drop-row-group"]'));
    // This shit is still not working ... elements look good
    browser.driver.actions().dragAndDrop(elem,target).perform();
  }
}
