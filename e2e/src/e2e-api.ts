import { browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder, WebElement } from 'protractor';
import { Room, Booking } from '@test/hotel-booking/metadata';
import * as e2e_utils from "./utils";
import { DataObj } from '@domain/metadata/data_obj';

export class E2EApi {

    async navigateTo(url) {
        await browser.get(url);
    }

    /**
    * Get page title from iframe
    */
    async __old__getPageTitle() {
        let EC = ExpectedConditions;

        // wait for iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('iframe'))), 7000);
        await browser.switchTo().frame(0);
        // wait for the document inside the iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('h2'))), 7000);
        return element(by.css('h2')).getText();
    }

    async getLogoIcon() {
        let EC = ExpectedConditions;

        // wait for iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('iframe'))), 7000);
        await browser.switchTo().frame(0);
        // wait for the document inside the iframe to be loaded
        await browser.wait(EC.presenceOf(element(by.css('.navbar-brand.logo_h i'))), 7000);
        return element(by.css('.navbar-brand.logo_h i'));
    }

    async finish() {
        await browser.close();
    } 

    /**
    * Get tables in left navigation bar
    */
    async getTablesDropdown() {
        // switch back to page content
        await browser.switchTo().defaultContent();
        let tablesDropDown: Array<ElementFinder> = await element.all(by.css('[data-frmdb-value="$frmdb.selectedTableId"]'));
        return tablesDropDown[0];
    }

    /**
    * Get pages in left navigation bar
    */
    async getPagesDropdown() {
        // switch back to page content
        await browser.switchTo().defaultContent();
        let pagesDropDown: Array<ElementFinder> = await element.all(by.css('[data-frmdb-value="$frmdb.selectedPageName"]'));
        return pagesDropDown[0];
    }

    async byCssInMain(selector: string, content?: string) {
        await browser.switchTo().defaultContent();
        return this.byCss(selector, content);
    }
    async byCss(selector: string, content?: string) {
        console.log(`        [E2E]> byCss: ${selector}, ${content}`);

        let EC = ExpectedConditions;
        let el: ElementFinder;
        if (content) {
            el = element(by.cssContainingText(selector, content))
        } else {
            el = element(by.css(selector))
        }

        // await browser.wait(EC.presenceOf(el), 5000);
        await browser.wait(EC.visibilityOf(el), 50000);

        if (content) {
            let text = await el.getAttribute('innerText');
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
        await browser.wait(EC.presenceOf(iframe), 7000);
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

        await browser.wait(EC.presenceOf(element(by.css(shadowDOMSelector))), 7000);
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
        if (!selectedElem) throw new Error(`element ${selector} not retrieved, opts=${JSON.stringify(selector)}`);
        
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
