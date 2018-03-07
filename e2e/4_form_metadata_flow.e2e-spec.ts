import { AppPage } from './app.po';
import { NavigationPO } from './navigation.po';
import { TablePO } from "./table.po";
import { browser, by, element, promise, Browser } from 'protractor';
import { $wait } from "./common";
import { ElementFinder } from 'protractor/built/element';

xdescribe('2_formdata_flow: ', () => {
  let appPage: AppPage;
  let navPO: NavigationPO;
  let tablePO: TablePO;

  beforeEach(() => {
    appPage = new AppPage();
    navPO = new NavigationPO();
    tablePO = new TablePO();
  });

  it('User should be able to change the name property for an /General/Actor entity', async () => {
    // hack required in order to locate elements on the page, otherwise we get
    browser.waitForAngularEnabled(false)

    await appPage.rootPage();

    // navigate to Actor entity page
    await navPO.navToEntityPage('/General/Actor', 'Actor');

    // save original actor name value
    let tableContents = await tablePO.getTable();

    let actorName = tableContents[1][3];
    let actorNameUpdated = actorName + 'New';

    let firstCell = await tablePO.firstCell();

    // open service form in edit mode by double clicking on the table entry
    await browser.actions().doubleClick(firstCell).perform();

    // update the actor name to actorNameUpdated
    navPO.fieldActorName().clear()
      .then(function () {
        navPO.fieldActorName().sendKeys(actorNameUpdated);
      })
      .then(function () {
        browser.sleep(500);
      });

    // navigate back to Actor entity page
    await navPO.navToEntityPage('/General/Actor', 'Actor');

    tableContents = await tablePO.getTable();

    console.log(tableContents[1][3]);

    // check that name property changed for the first Actor entity
    expect(tableContents[1][3]).toEqual(actorNameUpdated);
  });

});
