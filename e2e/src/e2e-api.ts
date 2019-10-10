import { browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder, WebElement } from 'protractor';
import { Room, Booking } from '@test/hotel-booking/metadata';
import * as e2e_utils from "./utils";
import { DataObj } from '@domain/metadata/data_obj';

export class E2EApi {

    async navigateTo(url) {
        await browser.get(url);
    }

    async getLogoIcon() {
        let EC = ExpectedConditions;

        // wait for iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('iframe'))), 20000);
        await browser.switchTo().frame(0);
        // wait for the document inside the iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('.navbar-brand.logo_h i'))), 20000);
        return element(by.css('.navbar-brand.logo_h i'));
    }

    async finish() {
        await browser.close();
    }

    async mouseMove(el: ElementFinder | WebElement) {
        await browser.actions().mouseMove(el);
        //TODO: add mouse pointer visual indicator
        //TODO: add speed
    }

    async click(el: ElementFinder | WebElement) {
        await el.click();
        //TODO: add mouse pointer visual indicator
        //TODO: add speed
        // await browser.sleep(1500);
    }

    async clickByCssInMain(selector: string, content?: string) {
        let el = await this.byCssInMain(selector, content);
        await this.click(el);
        return el;
    }

    async clickByCssInShadowDOM(shadowDOMSelector: string, selector: string, content?: string) {
        let el = await this.byCssInShadowDOM(shadowDOMSelector, selector, content);
        await this.click(el);
        return el;
    }

    async acceptAlert(content: string) {
        let EC = ExpectedConditions;
        await browser.wait(EC.alertIsPresent(), 20000);
        var alertDialog = await browser.switchTo().alert();
        let txt = await alertDialog.getText();
        expect(txt).toContain(content);
        await alertDialog.accept();  // Use to accept (simulate clicking ok)
        await browser.wait(EC.not(EC.alertIsPresent()), 20000);
        await browser.switchTo().defaultContent();
    }

    async byCssInMain(selector: string, content?: string) {
        await browser.switchTo().defaultContent();
        return this.byCss(selector, content);
    }
    async byCss(selector: string, content?: string) {
        console.log(`        [E2E]> byCss: ${selector} ${content ? ', expected-content=' + content : ''}`);

        let EC = ExpectedConditions;
        let el: ElementFinder;

        if (content) {
            if (selector.indexOf('textarea') >= 0 || selector.indexOf('input') >= 0) {
                el = element(by.css(selector))
                browser.wait(EC.textToBePresentInElementValue(el, content), 20000);
            } else {
                el = element(by.cssContainingText(selector, content));
            }
        } else {
            el = element(by.css(selector))
        }

        // await browser.wait(EC.presenceOf(el), 20000);
        await browser.wait(EC.visibilityOf(el), 20000, `byCss: ${selector}, ${content}`);

        if (content) {
            let text: string;
            if (selector.indexOf('textarea') >= 0 || selector.indexOf('input') >= 0) {
                text = await el.getAttribute('value');
            } else {
                text = await el.getAttribute('innerText');
            }
            expect(text).toContain(content);
        }
        return el;
    }
    async allByCss(selector: string) {
        await browser.switchTo().defaultContent();
        return await element.all(by.css(selector));
    }

    async waitForSwitchToIframe(selector: string) {
        let EC = ExpectedConditions;
        await browser.switchTo().defaultContent();

        let iframe = await this.byCss(selector);
        // wait for iframe to be loaded
        await browser.wait(EC.presenceOf(iframe), 20000);
        await browser.switchTo().frame(await iframe.getWebElement());
    }

    async byCssInFrame(iframeSelector: string, selector: string, content?: string) {
        await this.waitForSwitchToIframe(iframeSelector);
        return this.byCss(selector, content);
    }

    async allByCssInFrame(selector: string) {
        await this.waitForSwitchToIframe(selector);
        return await element.all(by.css(selector));
    }

    public getDataForTable(appData: DataObj[], tableName: string): DataObj[] {
        const ret: any[] = [];
        for (const obj of appData.slice(1, 2)) {
            if (obj._id.indexOf(`${tableName}~~`) === 0) { ret.push(obj); }
        }
        return ret;
    }

    async byCssInShadowDOM(shadowDOMSelector: string, selector: string, content?: string): Promise<WebElement> {
        let EC = ExpectedConditions;
        await browser.switchTo().defaultContent();

        await browser.wait(EC.presenceOf(element(by.css(shadowDOMSelector))), 20000);
        let shadowDOMElem = element(by.css(shadowDOMSelector));

        let selectedElem: WebElement | undefined = await e2e_utils.retryUntilFoundOrRetryLimitReached(async () => {
            let elems: WebElement[] = await browser.executeScript(function () {
                return arguments[0].shadowRoot.querySelectorAll(arguments[1])
            }, shadowDOMElem, selector);
            if (elems.length == 0) return undefined;
            let expectedElem: WebElement | undefined = undefined; 
            for (let elem of elems) {
                // if (!(await selectedElem.isPresent())) return undefined;
                if (!(await elem.isDisplayed())) continue;
                if (content) {
                    let text = await elem.getAttribute('innerText')
                    if (text.indexOf(content) >= 0) {
                        expectedElem = elem;
                        break;
                    }
                } else {
                    expectedElem = elem;
                    break;
                }
            }
            return expectedElem;
        })
        if (!selectedElem) throw new Error(`Not found element ${selector} in ShadowDOM of ${shadowDOMSelector}`);
        
        if (content) {
            let text = await selectedElem.getAttribute('innerText');
            expect(text).toContain(content);
        }

        return selectedElem;
    }

    /** NOT WORKING */
    async scrollIntoView(elem) {
        await browser.executeScript(function (el) {
            arguments[0].scrollIntoView();
        }, elem);
    }

    async clickWithJs(elem) {
        console.log(`        [E2E]> clickWithJs`);
        await browser.executeScript(function (el) {
            arguments[0].click();
        }, elem);
    }

    async scrollIframe(scrollHeight: number) {
        let EC = ExpectedConditions;
        await browser.switchTo().defaultContent();
        await browser.wait(EC.presenceOf(element(by.css('iframe'))), 7100);

        await browser.executeScript(function (iframeEl, scrollHeight) {
            let iframe = arguments[0];
            let h = arguments[1];
            iframe.contentWindow.scrollTo(0, h);
        }, element(by.css('iframe')), scrollHeight);
    }

    async __old__getTables() {
        // switch back to page content
        await browser.switchTo().defaultContent();
        let menuItems: Array<ElementFinder> = await element.all(by.css('[data-frmdb-value="$frmdb.tables[]._id"]'));

        let tables: Array<string> = [];
        // Using getAttribute('innerText') hack to get the link text, as explained here https://stackoverflow.com/questions/20888592/gettext-method-of-selenium-chrome-driver-sometimes-returns-an-empty-string
        for (var i = 0; i < menuItems.length; i++) {
            tables.push(await menuItems[i].getAttribute('innerText'));
        }

        return tables;
    }

    async getPages() {
        // switch back to page content
        await browser.switchTo().defaultContent();
        let menuItems: Array<ElementFinder> = await element.all(by.css('[data-frmdb-value="$frmdb.pages[].name"]'));

        let tables: Array<string> = [];
        // Using getAttribute('innerText') hack to get the link text, as explained here https://stackoverflow.com/questions/20888592/gettext-method-of-selenium-chrome-driver-sometimes-returns-an-empty-string
        for (var i = 0; i < menuItems.length; i++) {
            tables.push(await menuItems[i].getAttribute('innerText'));
        }

        return tables;
    }

    /**
    * Get first room type data from ag-grid table
    */
    async getFirstRoomTypeData() {
        // switch back to page content
        await browser.switchTo().defaultContent();

        // get header columns
        // document.querySelector('#data-grid > frmdb-data-grid').shadowRoot.querySelectorAll('#myGrid div.ag-header div.ag-header-cell span.ag-header-cell-text')
        // get first row columns
        // document.querySelector('#data-grid > frmdb-data-grid').shadowRoot.querySelectorAll('#myGrid div.ag-row[row-index="0"] div.ag-cell')
        // let firstRowCells: Array<any> = await element.all(by.js(() => {document.querySelector('#data-grid > frmdb-data-grid').shadowRoot.querySelectorAll('#myGrid div.ag-row[row-index="0"] div.ag-cell')}));
        let firstRowCells: Array<any> = [];

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
