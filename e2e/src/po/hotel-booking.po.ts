import {browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder} from 'protractor';
import {Room, Booking} from '@test/hotel-booking/metadata';

export class HotelBooking {
 
  async navigateToHome() {
    await browser.get('formuladb-editor/editor.html?t=frmdb-apps&a=hotel-booking&p=index');
  }

  /**
   * Get page title from iframe
   */
  async getPageTitle() {
    let EC = ExpectedConditions;

    // wait for iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('iframe'))), 50000);
    await browser.switchTo().frame(0);
    // wait for the document inside the iframe to be loaded
    await browser.wait(EC.presenceOf(element(by.css('h2'))), 50000);
    return element(by.css('h2')).getText();
  }

  /**
   * Get tables in left navigation bar
   */
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

  /**
   * Get first room data from ag-grid table
   */
  async getFirstRoomData() {
    // switch back to page content
    await browser.switchTo().defaultContent();

    // get header columns
    // document.querySelector('#db-main > frmdb-data-grid').shadowRoot.querySelectorAll('#myGrid div.ag-header div.ag-header-cell span.ag-header-cell-text')
    // get first row columns
    // document.querySelector('#db-main > frmdb-data-grid').shadowRoot.querySelectorAll('#myGrid div.ag-row[row-index="0"] div.ag-cell')
    let firstRowCells: Array<ElementFinder> = await element.all(by.deepCss('#myGrid div.ag-row[row-index="0"] div.ag-cell'));
    
    let firstRoomData: { id: string, value: string }[] = [];
    for (var i = 0; i < firstRowCells.length; i++) {
      firstRoomData.push({
        id: await firstRowCells[i].getAttribute('col-id'),
        value: await firstRowCells[i].getText()
      });
    }

    return firstRoomData;
  }
}
