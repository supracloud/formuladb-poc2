import {browser, element, by, ElementFinder, ExpectedConditions} from 'protractor';

export class InventoryProductLocationPage {
  
  async getTitle() {
    return browser.getTitle();
  }

  async waitForRowsCount(count: number) {
    let row = element(by.css('div[class="ag-center-cols-container"]')).element(by.css(`div[row-index="${count-1}"]`));
    await browser.wait(ExpectedConditions.presenceOf(row), 5000);
  }

  async groupByCategoryName(categoryName: string) {
    // try to get the filter by category row
    let count = 0;
    let elem : ElementFinder | undefined = undefined;
    while (true) {
      elem = element.all(by.css('span[class="ag-column-drag"]')).get(count++);
      let sibling = elem.element(by.xpath('..')).element(by.css('span[class="ag-column-tool-panel-column-label"]'));
      if ((await sibling.getText()) == categoryName)
        break;
      console.log(await sibling.getText());  
    }
    let target = element(by.css('div[class*="ag-tool-panel-wrapper"]')).element(by.css('div[class*="ag-column-drop-row-group"]'));
    // This shit is still not working ... elements look good
    browser.driver.actions().dragAndDrop(elem,target).perform();
  }

  async openGroupByIndex(index: number) {
    // try to get the filter by category row
    let count = 0;
    let elem = element(by.css('div[class="ag-center-cols-container"]')).element(by.css(`div[row-id="${index}"]`)).element(by.css('span[class="ag-group-contracted"]'));
    await browser.wait(ExpectedConditions.visibilityOf(elem), 5000);
    await elem.click();
  }

  async getStockInRowById(id: string) { /* e.g. INV__PRD__Location~~1__1a */
    let count = 0;
    let elem = element(by.cssContainingText('.ag-cell', id)).element(by.xpath('..')).element(by.css('div[col-id="available_stock__"]'));
    await browser.wait(ExpectedConditions.visibilityOf(elem), 5000);
    return await elem.getText();
  }

}
