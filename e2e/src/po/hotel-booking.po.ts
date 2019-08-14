import {browser, element, by, ExpectedConditions} from 'protractor';

export class HotelBooking {
 
  async navigateToHome() {
    await browser.get('formuladb-editor/editor.html?t=frmdb-apps&a=hotel-booking&p=index');
  }

  async getTitle() {
    // wait for iframe to be loaded
    await browser.wait(ExpectedConditions.presenceOf(element(by.css('iframe'))), 5000);
    await browser.wait(ExpectedConditions.presenceOf(element(by.css('h2'))), 5000);
    return element(by.css('h2')).getText();
  }
}
