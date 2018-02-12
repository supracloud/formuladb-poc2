import { browser, by, ProtractorBy, element, ExpectedConditions } from 'protractor';

export class AppPage {
  rootPage() {
    return browser.get('/');
  }

  sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  getBrand() {
    return element(by.css('.navbar-brand')).getText();
  }

}
