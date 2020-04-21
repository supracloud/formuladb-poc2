import * as fs from 'fs';
var rimraf = require("rimraf");
import { HTMLTools } from "@core/html-tools";

import * as CleanTheme from '../../git/formuladb-env/themes/Clean.json';
import * as FramesTheme from '../../git/formuladb-env/themes/Frames.json';

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('', {}, {
    features: {
        'FetchExternalResources': false,
        'ProcessExternalResources': false
    }
});
const htmlTools = new HTMLTools(jsdom.window.document, new jsdom.window.DOMParser());

import { getTestFrmdbEngineStore } from "./key_value_store_impl_selector";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { parseFullPageUrl, FullPageOpts } from '@domain/url-utils';
import { $DictionaryObjT } from '@domain/metadata/default-metadata.js';
import { generateUUID } from '@domain/uuid';

const templatePage =  /*html*/`
<!DOCTYPE html>
<html>
<head>
    <title>FormulaDB - Build Applications Without Code</title>
    <link href="/formuladb-env/static/formuladb-io/favicon.png" rel="icon" type="image/png">
</head>
<body>
    <h1>Template Page</h1>
</body>
`;

describe('MetadataStore', () => {
    let frmdbEngineStore: FrmdbEngineStore;
    let envDir;
    let dictionaryCache: Map<string, $DictionaryObjT> = new Map<string, $DictionaryObjT>()
        .set('main content', { 'fr': "contenu principal" } as $DictionaryObjT);

    function resetEnv() {
        rimraf.sync(`${envDir}/frmdb-apps`);
        rimraf.sync(`${envDir}/themes`);
        rimraf.sync(`${envDir}/css`);
        fs.mkdirSync(`${envDir}/themes`);
        fs.mkdirSync(`${envDir}/css`);
        fs.mkdirSync(`${envDir}/frmdb-apps/base-app`, { recursive: true });
        fs.mkdirSync(`${envDir}/frmdb-apps/kvsf-test-app-for-specs`, { recursive: true });
        fs.writeFileSync(`${envDir}/themes/Clean.json`, JSON.stringify(CleanTheme));
        fs.writeFileSync(`${envDir}/themes/Frames.json`, JSON.stringify(FramesTheme));
        fs.writeFileSync(`${envDir}/frmdb-apps/base-app/landing-page.html`, templatePage);
        fs.copyFileSync('./git/formuladb-env/css/basic-1a1a1a-ffffff.css', `${envDir}/css/basic-1a1a1a-ffffff.css`);
        fs.copyFileSync('./git/formuladb-env/css/lux-cb8670-363636.css', `${envDir}/css/lux-cb8670-363636.css`);
    }
    beforeAll(async () => {
        frmdbEngineStore = await getTestFrmdbEngineStore({ _id: "FRMDB_SCHEMA", entities: {} });
        envDir = frmdbEngineStore.kvsFactory.metadataStore.envDir;
        resetEnv();
    });

    function expectSavedPageToEqual(pagePath: string, html: string) {
        let htmlFromFile = fs.readFileSync(pagePath, 'utf8');
        let savedHtmlNormalized = htmlTools.normalizeHTML(htmlFromFile);
        let expectedNormalized = htmlTools.normalizeHTML(html);
        expect(savedHtmlNormalized).toEqual(expectedNormalized);
    }

    const PageHtmlFromClientBrowser = /*html*/`
    <!DOCTYPE html>
    <html>
    <head>
        <title>FormulaDB - Build Applications Without Code</title>
        <meta name="description" content="Some page description">
        <meta name="author" content="John Author">
        <link href="/formuladb-env/static/formuladb-io/favicon.png" rel="icon" type="image/png">
    </head>
    <body data-frmdb-tenant="formuladb-env/frmdb-apps" data-frmdb-app="formuladb-io">
        <header>
            <div class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"></div>
            <nav class="navbar" data-frmdb-fragment="_nav.html">
                nav content
            </nav>
        </header>
        <main>
            <h1 data-i18n-key="main content">main content IN OTHER LANGUAGE</h1>
            <input placeholder="some placeholder" />
        </main>
        <footer><span>some footer</span></footer>
        <div style="display: none; pointer-events: none;" data-frmdb-fragment="_scripts.html">
            <script src="/formuladb-env/plugins/vendor/js/jquery-3.4.1.min.js"></script>
        </div>
    </body>
    </html>`;

    it("Should save page without fragments/themes and default language", async () => {
        await frmdbEngineStore.kvsFactory.metadataStore.savePageHtml(
            parseFullPageUrl('/na-basic-1a1a1a-ffffff-Clean/kvsf-test-app-for-specs/test.html'),
            PageHtmlFromClientBrowser);

        expectSavedPageToEqual(`${envDir}/frmdb-apps/kvsf-test-app-for-specs/test.html`, /*html*/`
<!DOCTYPE html>
<html>
<head>
    <title>FormulaDB - Build Applications Without Code</title>
    <meta name="author" content="John Author">
    <meta name="description" content="Some page description">
    <meta name="frmdb_display_date" content="">
    <meta name="frmdb_featured_page_order" content="">
</head>

<body data-frmdb-tenant="formuladb-env/frmdb-apps" data-frmdb-app="formuladb-io">
    <header>
        <div class="jumbotron"></div>
        <div data-frmdb-fragment="_nav.html"></div>
    </header>
    <main>
        <h1>main content</h1>
        <input placeholder="some placeholder">
    </main>
    <footer><span>some footer</span></footer>
    <div data-frmdb-fragment="_scripts.html"></div>
</body>

</html>`);
    });

    it("Should save head fragment", async () => {

        let headHtml = fs.readFileSync(`${envDir}/frmdb-apps/kvsf-test-app-for-specs/_head.html`, 'utf8');
        expect(headHtml).toEqual(/*html*/`<head>
<title>FormulaDB - Build Applications Without Code</title>
<link href="/formuladb-env/static/formuladb-io/favicon.png" rel="icon" type="image/png">
</head>`);
    });

    it("Should save nav fragment", async () => {
        expectSavedPageToEqual(`${envDir}/frmdb-apps/kvsf-test-app-for-specs/_nav.html`, /*html*/`
            <nav class="navbar" data-frmdb-fragment="_nav.html">
                nav content
            </nav>
        `);
    });

    it("Should save scripts fragment", async () => {
        expectSavedPageToEqual(`${envDir}/frmdb-apps/kvsf-test-app-for-specs/_scripts.html`, /*html*/`
            <div style="display: none; pointer-events: none;" data-frmdb-fragment="_scripts.html">
                <script src="/formuladb-env/plugins/vendor/js/jquery-3.4.1.min.js"></script>
            </div>
        `);
    });

    it("Should read page with SSR for fragments and Clean theme and i18n", async () => {
        let fullPageOpts = parseFullPageUrl('/fr-basic-1a1a1a-ffffff-Clean/kvsf-test-app-for-specs/test.html');
        let readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                fullPageOpts, fullPageOpts,
                new Map().set('$Dictionary~~main content', { fr: 'contenu principal' })
            ));

        let expectedHtmlWithCleanThemeAndFrenchLang = PageHtmlFromClientBrowser
            .replace('<html>', '<html lang="fr">')
            .replace('<meta name="description" content="Some page description">', '')
            .replace('<meta name="author" content="John Author">', '')
            .replace('</head>', `
                <meta name="author" content="John Author">    
                <meta name="description" content="Some page description">
                <meta name="frmdb_display_date" content="">
                <meta name="frmdb_featured_page_order" content="">
                </head>`)
            .replace(
                `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
                `class="jumbotron w-100 text-center bg-transparent border-0" data-frmdb-theme-classes="w-100 text-center bg-transparent border-0"`,
            )
            .replace('<h1 data-i18n-key="main content">main content IN OTHER LANGUAGE</h1>', '<h1 data-i18n-key="main content">contenu principal</h1>')
            .replace('<span>some footer</span>', '<span data-i18n-key="some footer">fr:some footer</span>')
            .replace('<input placeholder="some placeholder"', '<input placeholder="fr:some placeholder" data-i18n-key="some placeholder"')
            .replace('<footer>', '<footer class="pt-4 bg-dark frmdb-section-dark" data-frmdb-theme-classes="pt-4 bg-dark frmdb-section-dark">')
            .replace('</body>', '<frmdb-notification-container></frmdb-notification-container>\n</body>')
        ;

        let expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithCleanThemeAndFrenchLang);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);
    });

    it("Should read page with SSR for fragments and Frames theme", async () => {
        let fullPageOpts = parseFullPageUrl('/en-basic-1a1a1a-ffffff-Frames/kvsf-test-app-for-specs/test.html');
        let readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                fullPageOpts, fullPageOpts, new Map()));

        let expectedHtmlWithFramesTheme = PageHtmlFromClientBrowser
            .replace('<html>', '<html lang="en">')
            .replace('<meta name="description" content="Some page description">', '')
            .replace('<meta name="author" content="John Author">', '')
            .replace('</head>', `
                <meta name="author" content="John Author">    
                <meta name="description" content="Some page description">
                <meta name="frmdb_display_date" content="">
                <meta name="frmdb_featured_page_order" content="">
                </head>`)
            .replace(
                `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
                `class="jumbotron min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around" data-frmdb-theme-classes="min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around"`,
            )
            .replace('<h1 data-i18n-key="main content">main content IN OTHER LANGUAGE</h1>', '<h1>main content</h1>')
            .replace('<footer>', '<footer class="pt-4 bg-dark frmdb-section-dark" data-frmdb-theme-classes="pt-4 bg-dark frmdb-section-dark">')
            .replace('</body>', '<frmdb-notification-container></frmdb-notification-container>\n</body>')
        ;
        let expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithFramesTheme);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);
    });

    it("Should read the correct look css", async () => {
        let [lang, look, primaryColor, secondaryColor, theme, appName] =
            ['en', 'basic', '1a1a1a', 'ffffff', 'Frames', 'kvsf-test-app-for-specs'];
        let cssStr = await frmdbEngineStore.kvsFactory.metadataStore.getLookCss({ lang, look, primaryColor, secondaryColor, theme, appName } as FullPageOpts);
        expect(cssStr.indexOf('--frmdb-look-name: basic')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--primary: #1a1a1a')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--secondary: #fff')).toBeGreaterThan(0);

        [lang, look, primaryColor, secondaryColor, theme, appName] =
            ['en', 'lux', 'cb8670', '363636', 'Clean', 'kvsf-test-app-for-specs'];
        cssStr = await frmdbEngineStore.kvsFactory.metadataStore.getLookCss({ lang, look, primaryColor, secondaryColor, theme, appName } as FullPageOpts);
        expect(cssStr.indexOf('--frmdb-look-name: lux')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--primary: #cb8670')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--secondary: #363636')).toBeGreaterThan(0);
    });

    it("Should create new page and read table of pages", async () => {
        resetEnv();

        let page1Obj = {
            _id: '',
            name: "new-page",
            title: "New Page Title",
            author: "John",
            description: "some description",
            frmdb_display_date: "2020-11-03",
            frmdb_featured_page_order: 'none',
            frmdb_look: '',
            frmdb_primary_color: '',
            frmdb_secondary_color: '',
            frmdb_theme: '',
            screenshot: '/formuladb-env/frmdb-apps/kvsf-test-app-for-specs/static/new-page.png',
        };
        await frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(
            parseFullPageUrl(`/en-basic-1a1a1a-ffffff-Frames/kvsf-test-app-for-specs/${page1Obj.name}.html`),
            page1Obj, "$LANDING-PAGE$");

        let savedPage = fs.readFileSync(`${envDir}/frmdb-apps/kvsf-test-app-for-specs/new-page.html`).toString();
        let expected = htmlTools.normalizeHTMLDoc(/*html*/`
            <!DOCTYPE html>
            <html>
            <head>
                <title>New Page Title</title>
                <meta name="author" content="John">
                <meta name="description" content="some description">
                <meta name="frmdb_display_date" content="2020-11-03">
                <meta name="frmdb_featured_page_order" content="none">
            </head>
            <body>
                <h1>Template Page</h1>
            </body>
        `);
        expect(expected).toEqual(htmlTools.normalizeHTMLDoc(savedPage));

        let pages = await frmdbEngineStore.kvsFactory.metadataStore.getPages('kvsf-test-app-for-specs');
        expect(pages).toEqual([{
            ...page1Obj,
            _id: 'kvsf-test-app-for-specs/new-page',
        }]);

        let page2Obj = {
            _id: '',
            name: "new-page-2",
            title: "New Page Title 2",
            author: "John",
            description: "some description 2",
            frmdb_display_date: "2020-11-03",
            frmdb_featured_page_order: 'none',
            frmdb_look: '',
            frmdb_primary_color: '',
            frmdb_secondary_color: '',
            frmdb_theme: '',
            screenshot: '/formuladb-env/frmdb-apps/kvsf-test-app-for-specs/static/new-page-2.png',
        };
        await frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(
            parseFullPageUrl(`/en-basic-1a1a1a-ffffff-Frames/kvsf-test-app-for-specs/${page2Obj.name}.html`),
            page2Obj, "new-page");

        pages = await frmdbEngineStore.kvsFactory.metadataStore.getPages('kvsf-test-app-for-specs');
        expect(pages).toEqual([{
            ...page2Obj,
            _id: 'kvsf-test-app-for-specs/new-page-2',
        }, {
            ...page1Obj,
            _id: 'kvsf-test-app-for-specs/new-page',
        }]);
    });
});
