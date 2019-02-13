import {browser, element, by, ElementFinder, ExpectedConditions} from 'protractor';

export class InventoryOrdersPage {
  
  async getTitle() {
    return browser.getTitle();
  }

  async selectInventoryOrderByIndex(index: number) {
    let row = element(by.css('div[class="ag-center-cols-container"]')).element(by.css(`div[row-id="${index}"]`)).element(by.css('div[col-id="sales_agent"]'));
    await browser.wait(ExpectedConditions.visibilityOf(row), 5000);
    await browser.actions().doubleClick(row).perform();
  }
}
