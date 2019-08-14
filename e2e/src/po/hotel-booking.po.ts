import {browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder} from 'protractor';
import {Room, Booking} from '@test/hotel-booking/metadata';

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

  async getTables() {
    // switch back to page content
    await browser.switchTo().defaultContent();
    let menuItems: Array<ElementFinder> = await element.all(by.css('frmdb-db-editor frmdb-v-nav li.nav-item'));
    
    let tables: Array<string> = [];
    for (var i = 0; i < menuItems.length; i++) {
      tables.push(await menuItems[i].getText());
    }

    return tables;
  }
}
