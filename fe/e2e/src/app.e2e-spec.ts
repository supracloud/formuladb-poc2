/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { browser, element, ExpectedConditions, by } from 'protractor';

describe('workspace-project App', () => {
  var until = ExpectedConditions;
  beforeEach(() => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();  });

  it('should display main page', () => {
    browser.driver.get('http://localhost:4200/');
    expect(browser.getTitle()).toEqual('Fe');
  });

  it('Go to Financial page', () => {
    var financial = element(by.css('[href="/0/Financial"]'));
    browser.wait(until.presenceOf(financial), 50000, 'Element taking too long to appear in the DOM');
    financial.click();
    browser.sleep(2000);
  });

  it('Go to Forms page', () => {
    var forms = element(by.css('[href="/0/Forms"]'));
    browser.wait(until.presenceOf(forms), 50000, 'Element taking too long to appear in the DOM');
    forms.click();
    browser.sleep(2000);
  })

  it('Go to General page', () => {
    var general = element(by.css('[href="/0/General"]'));
    browser.wait(until.presenceOf(general), 50000, 'Element taking too long to appear in the DOM');
    general.click();
    browser.sleep(2000);
  })

  it('Go to Inventory page', () => {
    var inventory = element(by.css('[href="/0/Inventory"]'));
    browser.wait(until.presenceOf(inventory), 50000, 'Element taking too long to appear in the DOM');
    inventory.click();
    browser.sleep(2000);
  })

  it('Go to Reports page', () => {
    var reports = element(by.css('[href="/0/Reports"]'));
    browser.wait(until.presenceOf(reports), 50000, 'Element taking too long to appear in the DOM');
    reports.click();
    browser.sleep(2000);
  })
});
