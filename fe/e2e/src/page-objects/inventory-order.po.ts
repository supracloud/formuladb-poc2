import {browser, element, by, ElementFinder, ExpectedConditions, Key} from 'protractor';

export class InventoryOrderPage {
  
  async getTitle() {
    return browser.getTitle();
  }

  async checkData() {
    let salesAgent = element(by.css('input[name="sales_agent"]'));

    await browser.wait(ExpectedConditions.presenceOf(salesAgent), 5000);

    // Workaround to get the list of items updated
    await browser.actions().mouseMove(salesAgent, {x: 51, y: 51}).perform();
    await browser.sleep(1000);
    await browser.actions().mouseMove(salesAgent, {x: 52, y: 52}).perform();

    // TODO: Can't get input value, it's always empty
    let salesAgentName = await salesAgent.getAttribute('value');
  }

  async updateItemQuantity(itemId: number, itemQuantity: string) {
    let itemQuantityElem = element(by.css(`input[id="items.${itemId}.quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(itemQuantityElem), 50000);

    await itemQuantityElem.sendKeys(Key.CONTROL, "a", Key.NULL, itemQuantity, Key.TAB);
  }

  async getItemQuantity(itemId: number) {
    let itemQuantityElem = element(by.css(`input[id="items.${itemId}.quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(itemQuantityElem), 50000);

    return await itemQuantityElem.getAttribute('value');
  }

  async waitForItemQuantity(itemId: number, quantity: string, timeout: number) {
    let itemQuantityElem = element(by.css(`input[id="items.${itemId}.quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(itemQuantityElem), 50000);

    while (timeout > 0) {
      let newQuantity = await itemQuantityElem.getAttribute('value');
      if (newQuantity == quantity) break;
      browser.sleep(100);
      timeout -= 100;
    }

    return await itemQuantityElem.getAttribute('value');
  }

  async waitForErrorQuantity(itemId: number, quantity: string, timeout: number) {
    let errorQuantityElem = element(by.css(`input[id="items.${itemId}.error_quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(errorQuantityElem), 50000);

    while (timeout > 0) {
      let newQuantity = await errorQuantityElem.getAttribute('value');
      if (newQuantity == quantity) break;
      browser.sleep(100);
      timeout -= 100;
    }
    return await errorQuantityElem.getAttribute('value');
  }
}
