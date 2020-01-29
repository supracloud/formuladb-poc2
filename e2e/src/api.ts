import * as _ from "lodash";
import * as e2e_utils from "./e2e-utils";
import * as os from 'os';
import {
    ElementFinder,
    element,
    by,
    browser,
    ExpectedConditions,
    WebElement
} from "protractor";


by.addLocator('css_sr', (cssSelector: string, opt_parentElement, opt_rootSelector) => {
    let selectors = cssSelector.split('::shadowRoot');
    if (selectors.length === 0) {
        return [];
    }

    let shadowDomInUse = ((document.head as any).createShadowRoot || document.head.attachShadow);
    let getShadowRoot = (el) => ((el && shadowDomInUse) ? el.shadowRoot : el);
    let findAllMatches = (selector: string, targets: any[], firstTry: boolean) => {
        let using: any, i, matches: any[] = [];
        for (i = 0; i < targets.length; ++i) {
            using = (firstTry) ? targets[i] : getShadowRoot(targets[i]);
            if (using) {
                if (selector === '') {
                    matches.push(using);
                } else {
                    Array.prototype.push.apply(matches, using.querySelectorAll(selector));
                }
            }
        }
        return matches;
    };

    let matches = findAllMatches(selectors!.shift()!.trim(), [opt_parentElement || document], true);
    while (selectors.length > 0 && matches.length > 0) {
        matches = findAllMatches(selectors!.shift()!.trim(), matches, false);
    }
    return matches;
});


let MESSAGES: string[] = [];
let DURATIONS: number[] = [];
let action_index = 0;
let stream: any;
let indent = 0;

export type Action = () => Promise<any>;

function _describe(focusOnThisScenario: boolean, text: string, callback: () => void) {
    (focusOnThisScenario ? fdescribe : describe)(text, callback);
}

export function Desc(text: string, callback: () => void) {
    _describe(false, text, callback);
}

export function DescFocus(text: string, callback: () => void) {
    _describe(true, text, callback);
}

export function DescXclude(text: string, callback: () => void) {
    xdescribe(text, callback);
}

export function FullTestWithVideo(text: string, callback: () => void) {

    beforeAll(async () => {
        MESSAGES = [];
        DURATIONS = [];
        action_index = 0;
        indent = 0;

        if (process.platform === "linux" && os.release().toLowerCase().indexOf('microsoft') >= 0) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
        }
        console.log("[E2E] describe: ", text);
        browser.ignoreSynchronization = true;
        browser.driver.manage().window().maximize();

        if (browser.params.recordings || browser.params.audio) {
            e2e_utils.setup_directories();
        }

        if (browser.params.audio) {
            await e2e_utils.create_audio_tracks(MESSAGES, DURATIONS);
        }

        if (browser.params.recordings) {
            stream = e2e_utils.create_stream_and_run();
        }
    });

    afterAll(async () => {
        await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);
        if (browser.params.audio) {
            await e2e_utils.concat_audio(MESSAGES);
            await e2e_utils.merge_video_and_audio();
        } else {
            e2e_utils.create_final_video();
        }
        await e2e_utils.crop_video();
        await e2e_utils.create_gif_palette_and_video();
        e2e_utils.cleanup(text);
    });

    Desc(text, callback);
}

function _it(focusOnThisStep: boolean, text: string, callback: () => Promise<any>) {
    (focusOnThisStep ? fit : it)(text, async () => {
        try {
            console.log("  ".repeat(indent + 1) + "[E2E] Step: ", text);
            await e2e_utils.handle_generic_action(DURATIONS[action_index++]);

            await callback();
        } catch (err) {
            console.warn(err);
            throw err;
        }
    });
}

export function StepXclude(text: string, callback: () => Promise<any>) {
    xit(text, callback);
}

export function Step(text: string, callback: () => Promise<any>) {
    _it(false, text, callback);
}

export function StepWithVideo(text: string, callback: () => Promise<any>) {
    MESSAGES.push(`<speak>${text}<break time="1s"/></speak>`);
    DURATIONS.push(0);
    Step(text, callback);
}

async function pimpCursor() {

    await browser.executeScript(function () {
        function jsPimpCursor(doc) {
            // Create mouse following image.
            var seleniumFollowerImg = doc.createElement("img");
        
            // Set image properties.
            seleniumFollowerImg.setAttribute('src', 'data:image/png;base64,'
                + 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAQAAACGG/bgAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAA'
                + 'HsYAAB7GAZEt8iwAAAAHdElNRQfgAwgMIwdxU/i7AAABZklEQVQ4y43TsU4UURSH8W+XmYwkS2I0'
                + '9CRKpKGhsvIJjG9giQmliHFZlkUIGnEF7KTiCagpsYHWhoTQaiUUxLixYZb5KAAZZhbunu7O/PKf'
                + 'e+fcA+/pqwb4DuximEqXhT4iI8dMpBWEsWsuGYdpZFttiLSSgTvhZ1W/SvfO1CvYdV1kPghV68a3'
                + '0zzUWZH5pBqEui7dnqlFmLoq0gxC1XfGZdoLal2kea8ahLoqKXNAJQBT2yJzwUTVt0bS6ANqy1ga'
                + 'VCEq/oVTtjji4hQVhhnlYBH4WIJV9vlkXLm+10R8oJb79Jl1j9UdazJRGpkrmNkSF9SOz2T71s7M'
                + 'SIfD2lmmfjGSRz3hK8l4w1P+bah/HJLN0sys2JSMZQB+jKo6KSc8vLlLn5ikzF4268Wg2+pPOWW6'
                + 'ONcpr3PrXy9VfS473M/D7H+TLmrqsXtOGctvxvMv2oVNP+Av0uHbzbxyJaywyUjx8TlnPY2YxqkD'
                + 'dAAAAABJRU5ErkJggg==');
            seleniumFollowerImg.setAttribute('id', 'selenium_mouse_follower');
            seleniumFollowerImg.setAttribute('style', 'position: absolute; z-index: 99999999999; pointer-events: none;');
        
            // Add mouse follower to the web page.
            doc.body.appendChild(seleniumFollowerImg);
        
            // Track mouse movements and re-position the mouse follower.
            doc.onmousemove = function (e) {
                let mousePointer = document.getElementById('selenium_mouse_follower')!;
                mousePointer.style.left = e.pageX + 'px';
                mousePointer.style.top = e.pageY + 'px';
            }
        }

        jsPimpCursor(document);

        let frames = document.querySelectorAll('iframe');
        for (let f of Array.from(frames)) {
            f.onload = () => {
                jsPimpCursor(f.contentWindow!.document);
            };
        }
    });
}

export async function GoTo(url: string) {
    console.log("  ".repeat(indent + 1) + "[E2E] GoTo: " + url);
    await browser.get(url);
    await browser.wait(async () => (await browser.executeScript(function () {
        return document.readyState;
    }) == 'complete', 2000, 'wait for page to load ' + url));
    await pimpCursor();
}

export async function Scroll(selector: string, scrollHeight: number) {
    console.log("  ".repeat(indent + 1) + "[E2E] Scroll: " + selector + ", " + scrollHeight);
    let EC = ExpectedConditions;
    await browser.switchTo().defaultContent();
    await browser.wait(EC.presenceOf(element(by.css(selector))), 2500, 'wait for iframe to scroll');
    await browser.executeScript(function () {
        let iframe = arguments[0];
        let h = arguments[1];
        iframe.contentWindow.scrollTo(0, h);
    }, element(by.css(selector)), scrollHeight);
}


export async function AcceptAlert(content: string) {
    let EC = ExpectedConditions;
    await browser.wait(EC.alertIsPresent(), 40000, "wait for alert to be present");
    var alertDialog = await browser.switchTo().alert();
    let txt = await alertDialog.getText();
    expect(txt).toContain(content);
    await alertDialog.accept();  // Use to accept (simulate clicking ok)
    await browser.wait(EC.not(EC.alertIsPresent()), 40000, "wait for alert NOT to be present");
    await browser.switchTo().defaultContent();
}

export async function CheckExists(selector: string) {
    await check(selector, "Exists");
}

export async function CheckColor(red: number, green: number, blue: number, alpha: number, selector: string) {
    await check(selector, "Color", `rgba(${red}, ${green}, ${blue}, ${alpha})`);
}

async function check(selector: string, what: "Exists" | "Color", value?: string) {
    console.log("  ".repeat(indent + 1) + "[E2E] Check: " + selector + "; " + what + " " + value);
    let el = await find(selector);
    if (what === "Exists") {
        expect(await el.isPresent()).toEqual(true);
    } else if (what === "Color") {
        let expectedColor = value || 'expected-color-not-provided';
        await browser.wait(async () => (await el.getCssValue('color')) == expectedColor, 3000, 'wait for color to become ' + expectedColor);
        let color = await el.getCssValue('color');
        expect(color).toEqual(expectedColor);
    }
    console.log("  ".repeat(indent + 1) + "[E2E] END Check: " + selector + "; " + what + " " + value);
}

export async function CheckDataGridHighlighted(colName: string) {
    let expectedBgImg = 'linear-gradient(45deg, rgb(214, 239, 255) 25%, rgb(245, 251, 255) 25%, rgb(245, 251, 255) 50%, rgb(214, 239, 255) 50%, rgb(214, 239, 255) 75%, rgb(245, 251, 255) 75%, rgb(245, 251, 255) 100%)';
    let el = await find(`frmdb-data-grid::shadowRoot .ag-cell[col-id="${colName}"]`);
    await browser.wait(async () => (await el.getCssValue('background-image')) == expectedBgImg, 2500, `wait for data grid column ${colName} to have bg ${expectedBgImg}, found ${await el.getCssValue('background-image')}`);
    expect(await el.getCssValue('background-image')).toEqual(expectedBgImg);
}

export async function Click(selector: string) {

    console.log("  ".repeat(indent + 1) + "[E2E] Click: " + selector);
    let el = await find(selector);
    let EC = ExpectedConditions;
    await browser.wait(EC.elementToBeClickable(el), 2000, `waiting for ${selector} to be clickable`);
    await el.click();
    console.log("  ".repeat(indent + 1) + "[E2E] END Click: " + selector);
}
export async function ClickWithJs(selector: string) {

    console.log("  ".repeat(indent + 1) + "[E2E] ClickBottomLeft: " + selector);
    let el = await find(selector);
    await browser.executeScript(function (el) {
        arguments[0].click();
    }, el);
    console.log("  ".repeat(indent + 1) + "[E2E] END ClickBottomLeft: " + selector);
}
export async function MouseOver(selector: string) {

    console.log("  ".repeat(indent + 1) + "[E2E] MouseOver: " + selector);
    let el = await find(selector);
    await browser.actions().mouseMove(el).perform();
    console.log("  ".repeat(indent + 1) + "[E2E] END MouseOver: " + selector);
}
export async function Sleep(timeMillisecods: number) {

    console.log("  ".repeat(indent + 1) + "[E2E] Sleep: " + timeMillisecods);
    await browser.sleep(timeMillisecods);
}
export async function SendKeys(selector: string, keys: string) {
    console.log("  ".repeat(indent + 1) + "[E2E] SendKeys: " + selector + ", " + keys);
    let el = await find(selector);
    await el.sendKeys(keys);
}

async function getShadowRoot(el: ElementFinder): Promise<WebElement | null> {
    let shadowRoot: WebElement = await browser.executeScript(function () {
        console.warn("In executeScript", arguments[0], arguments[0].shadowRoot);
        return arguments[0].shadowRoot || arguments[0];
    }, el);
    return shadowRoot;
}

async function checkMultipleMatches(elFinder: ElementFinder, cssSel: string, textContent: string | RegExp) {
    let allEls = await elFinder.all(by.cssContainingText(cssSel, textContent));
    if (allEls.length > 1) {
        let err = `More than one element matches ${cssSel}:contains(${textContent})`;
        for (let ef of allEls) {
            let html = await ef.getAttribute('outerHTML');
            err = err + "\n" + html;
        }
        throw new Error(err);
    }
}

function extractTextOrRegexFromSelector(sel: string, pseudoSelector: "value" | "contains"): { cssSel: string, textOrRegex: string | RegExp } {
    let matcher = new RegExp(`:${pseudoSelector}\\((.*?)\\)`).exec(sel);
    if (!matcher || !matcher[1]) throw new Error(`${pseudoSelector} not found in ${sel}`);
    let textOrRegex: string | RegExp = matcher[1];
    if (textOrRegex.indexOf('/') === 0) textOrRegex = new RegExp(textOrRegex.replace(/^\//, '').replace(/\/$/, ''));
    let cssSel = sel.replace(new RegExp(`\\s*:${pseudoSelector}\\((.*?)\\)\\s*`), '') || '*';
    return { cssSel, textOrRegex };
}

async function findByValue(cssSel: string, parent: ElementFinder, value: string | RegExp) {
    let allMatches: ElementFinder[] = await parent.all(by.css(cssSel));
    let matches: ElementFinder[] = [];
    for (let elF of allMatches) {
        let tagName = await elF.getWebElement().getTagName();
        if (!['input', 'textarea', 'select'].includes(tagName.toLowerCase())) throw new Error(":value(some value) is only allowe for input, textarea and select, not for " + tagName);
        let elVal = await elF.getAttribute('value');
        let elMatches: boolean = false;
        if (typeof value === 'string' && elVal === value) elMatches = true;
        else if (value instanceof RegExp && elVal.match(value)) elMatches = true;

        if (elMatches) {
            let html = await elF.getAttribute('outerHTML');
            console.log("  ".repeat(indent + 3) + "found value: " + cssSel + " " + value + " --> " + html);
            matches.push(elF);
        }
    }

    if (matches.length > 1) throw new Error("multiple matches for " + cssSel + " :value(" + value + ")");
    return matches;
}

const specialTokenRegex = /(iframe[^ ]*|::shadowRoot|:contains\(.*?\)|:value\(.*?\)|::parent)/;
async function find(selector: string, parent?: ElementFinder): Promise<ElementFinder> {
    let EC = ExpectedConditions;
    await browser.switchTo().defaultContent();

    let tokens = selector.split(specialTokenRegex).filter(t => !t.match(/^\s*$/));
    let selectors: string[] = [];
    for (let [i, token] of tokens.entries()) {
        let prevToken = i == 0 ? '' : tokens[i - 1];
        if ("::parent" == token) {
            if (prevToken && !specialTokenRegex.test(prevToken)) selectors.push(prevToken);
            selectors.push(token);
        } else if (specialTokenRegex.test(token)) {
            if (!specialTokenRegex.test(prevToken)) {
                selectors.push(prevToken + token);
            } else selectors.push(token);
        } else if (i == tokens.length - 1) {
            selectors.push(token);
        }
    }
    let elFinder: ElementFinder = parent || (await element(by.css('body')));
    await browser.wait(EC.presenceOf(elFinder), 5000, `wait for parent of ${selector}`);

    for (let sel of selectors) {
        let childElFinder: ElementFinder;
        if (sel.indexOf('iframe') >= 0) {
            if (sel.indexOf('(') >= 0) throw new Error(`iframe selector ${sel} cannot contain parantheses (text content)`);
            childElFinder = await elFinder.element(by.css(sel));
        } else if (sel.indexOf(':contains(') >= 0) {
            let { cssSel, textOrRegex } = extractTextOrRegexFromSelector(sel, 'contains');
            await checkMultipleMatches(elFinder, cssSel, textOrRegex);
            childElFinder = await elFinder.element(by.cssContainingText(cssSel, textOrRegex));
        } else if (sel.indexOf(':value(') >= 0) {
            let { cssSel, textOrRegex } = extractTextOrRegexFromSelector(sel, 'value');
            await browser.wait(async () => (await findByValue(cssSel, elFinder, textOrRegex)).length == 1, 2500, "waiting for :value selector " + sel);
            childElFinder = (await findByValue(cssSel, elFinder, textOrRegex))[0];
        } else if (sel.indexOf('::shadowRoot') >= 0) {
            childElFinder = await elFinder.element(by.css_sr(sel));
        } else if (sel.indexOf('::parent') >= 0) {
            childElFinder = await elFinder.element(by.xpath('..'));
        } else {
            childElFinder = await elFinder.element(by.css(sel));
        }

        await browser.wait(EC.presenceOf(childElFinder), 3500, `waiting for ${sel} from ${selector}`);
        expect(await childElFinder.isPresent()).toEqual(true);

        if (sel.indexOf('iframe') >= 0) {
            await browser.switchTo().frame(await childElFinder.getWebElement());
            elFinder = await element(by.css('body'));
            await browser.wait(EC.presenceOf(elFinder), 3500, `waiting for iframe ${sel} from ${selector}`);
        } else if (sel.indexOf('::shadowRoot') >= 0 || sel == '::parent') {
            elFinder = childElFinder;
        } else {
            let loc = await childElFinder.getLocation();
            console.log("  ".repeat(indent + 2) + "location: " + sel + " --> " + loc.x + ',' + loc.y);
            await browser.executeScript('window.scrollTo(0,arguments[0]);', loc.y - 150 ? loc.y - 150 : loc.y);

            elFinder = childElFinder;
        }

        if (sel.indexOf('::shadowRoot') < 0) {
            let html = await elFinder.getAttribute('outerHTML');
            console.log("  ".repeat(indent + 2) + "found: " + sel + " => " + html.substr(0, 50));
        } else console.log("  ".repeat(indent + 2) + "found " + sel);
    }

    return elFinder;
}
