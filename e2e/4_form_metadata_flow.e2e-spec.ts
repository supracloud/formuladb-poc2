import { AppPage } from './app.po';
import { NavigationPO } from './navigation.po';
import { TablePO } from "./table.po";
import { browser, by, element, promise, Browser } from 'protractor';
import { $wait } from "./common";
import { ElementFinder } from 'protractor/built/element';
import { FormPO } from './form.po';

fdescribe('4_form_metadata_flow: ', () => {
  let appPage: AppPage;
  let navPO: NavigationPO;
  let tablePO: TablePO;
  let formPO: FormPO;

  beforeEach(async () => {
    // hack required in order to locate elements on the page, otherwise we get
    browser.waitForAngularEnabled(false);

    appPage = new AppPage();
    navPO = new NavigationPO();
    tablePO = new TablePO();
    formPO = new FormPO();

    await appPage.rootPage();
  });

  /**
   * Verify that use is able to change the form layout using the metadata visual editor
   * Currently we're testing 2 scenarios:
   *  - move the 4th column on the 2nd place, right after the 1st column/property (should be 'code')
   *  - move the 5th column/property on the same row with the 1st column/property (should be 'code')
   */
  it('User should be able to change the form layout and fields order for /General/Actor entity', async () => {
    // navigate to Actor entity using the side panel menu
    await navPO.navToEntityPage('/General/Actor', 'Actor');

    // save original actor name value
    let tableContents = await tablePO.getTable();

    let colName1 = tableContents[0][1];
    let colName4 = tableContents[0][4];
    let colName5 = tableContents[0][5];

    let firstCell = await tablePO.firstCell();

    // open service form in edit mode by double clicking on the table entry
    await browser.actions().doubleClick(firstCell).perform();

    // get html elements for properties 1,4,5 from the editor panel
    let field1: ElementFinder = await formPO.getFormGridRow(1);
    let field4: ElementFinder = await formPO.getFormGridRow(4);
    let field5: ElementFinder = await formPO.getFormGridRow(5);
    
    console.log('============XXX============');

    // move the 4th column to the second place, drop it over the 1st element
    await browser.actions().dragAndDrop(field4, field1).perform();

    console.log('============YYY============');
    
    // wait to cover the sample time in rxJS
    browser.sleep(1000)
 
    await browser.get('/General/Actor');
  });

});
