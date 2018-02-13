import { browser, element, ExpectedConditions } from 'protractor';
import { ElementHelper } from 'protractor/built/browser';
import { ElementFinder, ElementArrayFinder } from 'protractor/built/element';

export async function $wait(el: ElementFinder): Promise<ElementFinder> {
    await browser.wait(ExpectedConditions.visibilityOf(el));
    return el;
}

