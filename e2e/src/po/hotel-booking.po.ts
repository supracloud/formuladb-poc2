import {browser, element, by, ExpectedConditions} from 'protractor';

export class HotelBooking {
 
  async navigateToHome() {
    await browser.get('formuladb-editor/editor.html#/frmdb-apps/hotel-booking/index.html');
  }

  async getTitle() {
    let EC = ExpectedConditions;

    // wait for iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('iframe'))), 50000);
    await browser.switchTo().frame(0);
    // wait for the document inside the iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('h2'))), 50000);
    return element(by.css('h2')).getText();
  }
}
