import {browser, element, by, ExpectedConditions} from 'protractor';

export class HotelBooking {
 
  async navigateToHome() {
    await browser.get('formuladb-editor/editor.html?t=frmdb-apps&a=hotel-booking&p=index');
  }

  async getTitle() {
    let EC = ExpectedConditions;

    // wait for iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('iframe'))), 5000);
    await browser.switchTo().frame(0);
    // wait for the document inside the iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('h2'))), 5000);
    return element(by.css('h2')).getText();
  }
}
