/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/0');
  }

  getParagraphText() {
    return element(by.cssContainingText('.simple-text', 'BRAND')).getText();
  }
}
