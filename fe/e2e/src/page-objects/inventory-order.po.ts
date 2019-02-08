import {browser, element, by, ElementFinder, ExpectedConditions, Key} from 'protractor';

export class InventoryOrderPage {
  
  async getTitle() {
    return browser.getTitle();
  }

  async checkData() {
    let salesAgent = element(by.css('input[name="sales_agent"]'));

    await browser.wait(ExpectedConditions.presenceOf(salesAgent), 5000);

    // TODO: Can't get input value, it's always empty
    let salesAgentName = await salesAgent.getAttribute('value');
  }

  async updateItemQuantity(itemId: number, itemQuantity: string) {
    let itemQuantityElem = element(by.css(`input[id="items.${itemId}.quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(itemQuantityElem), 5000);

    await itemQuantityElem.sendKeys(Key.CONTROL, "a", Key.NULL, itemQuantity);
  }

  async getItemQuantity(itemId: number) {
    let itemQuantityElem = element(by.css(`input[id="items.${itemId}.quantity"]`));

    await browser.wait(ExpectedConditions.presenceOf(itemQuantityElem), 5000);

    return await itemQuantityElem.getAttribute('value');
  }
}
