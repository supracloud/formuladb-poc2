import { AppPage } from './app.po';
import { NavigationPO } from './navigation.po';
import { TablePO } from "./table.po";
import { browser, by, element, promise } from 'protractor';
import { $wait } from "./common";
import { ElementFinder } from 'protractor/built/element';

describe('1_application_init_flow: ', () => {
  let appPage: AppPage;
  let navPO: NavigationPO;
  let tablePO: TablePO;

  beforeEach(() => {
    appPage = new AppPage();
    navPO = new NavigationPO();
    tablePO = new TablePO();
  });

  it('User should be able to navigate to /General/Actor entity', async () => {
    await appPage.rootPage();
    let link = await navPO.navLinkForEntity('/General/Actor')
    await expect(link.getText()).toContain('Actor');
    await link.click();

    let tableContents = await tablePO.getTable();

    expect(tableContents[0][11]).toEqual('_id');
    expect(tableContents[1][11]).toEqual('UUID-General-Actor:1');
  });
});
