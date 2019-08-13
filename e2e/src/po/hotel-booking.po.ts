import {browser, element, by, ExpectedConditions} from 'protractor';

export class HotelBooking {
 
  async navigateToHome() {
    await browser.get('formuladb-editor/editor.html?t=frmdb-apps&a=hotel-booking&p=index');
  }

  async getTitle() {
    // wait for iframe to be loaded
    browser.wait(ExpectedConditions.presenceOf(element(by.tagName('iframe'))), 5000);
    //browser.switchTo().frame(element(by.id('iframe1')));
    console.log(await browser.getPageSource());
    browser.pause();
    return element(by.css('h2')).getText();
  }
}
