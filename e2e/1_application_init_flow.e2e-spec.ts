import { AppPage } from './app.po';
import { NavigationPO } from './navigation.po';
import { browser } from 'protractor';

describe('1_application_init_flow: ', () => {
  let appPage: AppPage;
  let navPO: NavigationPO;

  beforeEach(() => {
    appPage = new AppPage();
    navPO = new NavigationPO();
  });

  it('User should be able to navigate to /General/Actor entity', async () => {
    await appPage.rootPage();
    let link = await navPO.navLinkForEntity('/General/Actor')
    await expect(link.getText()).toContain('Actor');
    await link.click();
  });
});
