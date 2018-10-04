/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('frmdb-root h1')).getText();
  }
}
