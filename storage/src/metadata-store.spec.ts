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
import { parsePageUrl, PageOpts } from '@domain/url-utils';
import { $DictionaryObjT } from '@domain/metadata/default-metadata.js';

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
    let dictionaryCache: Map<string, $DictionaryObjT> = new Map<string, $DictionaryObjT>()
        .set('main content', { 'fr': "contenu principal" } as $DictionaryObjT);

    function resetEnv() {
        rimraf.sync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps");
        rimraf.sync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/themes");
        rimraf.sync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/css");
        fs.mkdirSync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/themes");
        fs.mkdirSync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/css");
        fs.mkdirSync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/base-app", { recursive: true });
        fs.mkdirSync("/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app", { recursive: true });
        fs.writeFileSync('/tmp/frmdb-metadata-store-for-specs/formuladb-env/themes/Clean.json', JSON.stringify(CleanTheme));
        fs.writeFileSync('/tmp/frmdb-metadata-store-for-specs/formuladb-env/themes/Frames.json', JSON.stringify(FramesTheme));
        fs.writeFileSync('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/base-app/landing-page.html', templatePage);
        fs.copyFileSync('./git/formuladb-env/css/basic-1a1a1a-ffffff.css', '/tmp/frmdb-metadata-store-for-specs/formuladb-env/css/basic-1a1a1a-ffffff.css');
        fs.copyFileSync('./git/formuladb-env/css/lux-cb8670-363636.css', '/tmp/frmdb-metadata-store-for-specs/formuladb-env/css/lux-cb8670-363636.css');
    }
    beforeAll(async () => {
        frmdbEngineStore = await getTestFrmdbEngineStore({ _id: "FRMDB_SCHEMA", entities: {} });
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
            parsePageUrl('/na-basic-1a1a1a-ffffff-Clean/frmdb-apps/test-app/test.html'),
            PageHtmlFromClientBrowser);

        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app/test.html', /*html*/`
<!DOCTYPE html>
<html>
<head>
    <title>FormulaDB - Build Applications Without Code</title>
    <meta name="author" content="John Author">
    <meta name="description" content="Some page description">
    <meta name="frmdb_display_date" content="">
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

        let headHtml = fs.readFileSync('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app/_head.html', 'utf8');
        expect(headHtml).toEqual(/*html*/`<head>
<title>FormulaDB - Build Applications Without Code</title>
<meta name="description" content="Some page description">
<meta name="author" content="John Author">
<link href="/formuladb-env/static/formuladb-io/favicon.png" rel="icon" type="image/png">
</head>`);
    });

    it("Should save nav fragment", async () => {
        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app/_nav.html', /*html*/`
            <nav class="navbar" data-frmdb-fragment="_nav.html">
                nav content
            </nav>
        `);
    });

    it("Should save scripts fragment", async () => {
        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app/_scripts.html', /*html*/`
            <div style="display: none; pointer-events: none;" data-frmdb-fragment="_scripts.html">
                <script src="/formuladb-env/plugins/vendor/js/jquery-3.4.1.min.js"></script>
            </div>
        `);
    });

    it("Should read page with SSR for fragments and Clean theme and i18n", async () => {
        let readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                parsePageUrl('/fr-basic-1a1a1a-ffffff-Clean/frmdb-apps/test-app/test.html'),
                new Map().set('$Dictionary~~main content', { fr: 'contenu principal' })
            ));

        let expectedHtmlWithCleanThemeAndFrenchLang = PageHtmlFromClientBrowser
            .replace('<html>', '<html lang="fr">')
            .replace('</head>', '<meta name="frmdb_display_date" content=""></head>')
            .replace(
                `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
                `class="jumbotron w-100 text-center bg-transparent border-0" data-frmdb-theme-classes="w-100 text-center bg-transparent border-0"`,
            )
            .replace('<h1 data-i18n-key="main content">main content IN OTHER LANGUAGE</h1>', '<h1 data-i18n-key="main content">contenu principal</h1>')
            .replace('<span>some footer</span>', '<span data-i18n-key="some footer">fr:some footer</span>')
            .replace('<input placeholder="some placeholder"', '<input placeholder="fr:some placeholder" data-i18n-key="some placeholder"')
            .replace('<footer>', '<footer class="pt-4 bg-dark frmdb-section-dark" data-frmdb-theme-classes="pt-4 bg-dark frmdb-section-dark">')
            ;

        let expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithCleanThemeAndFrenchLang);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);
    });

    it("Should read page with SSR for fragments and Frames theme", async () => {
        let readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                parsePageUrl('/en-basic-1a1a1a-ffffff-Frames/frmdb-apps/test-app/test.html'), new Map()));

        let expectedHtmlWithFramesTheme = PageHtmlFromClientBrowser
            .replace('<html>', '<html lang="en">')
            .replace('</head>', '<meta name="frmdb_display_date" content=""></head>')
            .replace(
                `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
                `class="jumbotron min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around" data-frmdb-theme-classes="min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around"`,
            )
            .replace('<h1 data-i18n-key="main content">main content IN OTHER LANGUAGE</h1>', '<h1>main content</h1>')
            .replace('<footer>', '<footer class="pt-4 bg-dark frmdb-section-dark" data-frmdb-theme-classes="pt-4 bg-dark frmdb-section-dark">')
        ;
        let expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithFramesTheme);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);
    });

    it("Should read the correct look css", async () => {
        let [lang, look, primaryColor, secondaryColor, theme, tenantName, appName] =
            ['en', 'basic', '1a1a1a', 'ffffff', 'Frames', 'frmdb-apps', 'test-app'];
        let cssStr = await frmdbEngineStore.kvsFactory.metadataStore.getLookCss({ lang, look, primaryColor, secondaryColor, theme, tenantName, appName } as PageOpts);
        expect(cssStr.indexOf('--frmdb-look-name: basic')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--primary: #1a1a1a')).toBeGreaterThan(0);
        expect(cssStr.indexOf('--secondary: #fff')).toBeGreaterThan(0);

        [lang, look, primaryColor, secondaryColor, theme, tenantName, appName] =
            ['en', 'lux', 'cb8670', '363636', 'Clean', 'frmdb-apps', 'test-app'];
        cssStr = await frmdbEngineStore.kvsFactory.metadataStore.getLookCss({ lang, look, primaryColor, secondaryColor, theme, tenantName, appName } as PageOpts);
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
            screenshot: '/formuladb-env/frmdb-apps/test-app/static/new-page.png',
        };
        await frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(
            parsePageUrl(`/en-basic-1a1a1a-ffffff-Frames/frmdb-apps/test-app/${page1Obj.name}.html`),
            page1Obj, "$LANDING-PAGE$");

        let savedPage = fs.readFileSync('/tmp/frmdb-metadata-store-for-specs/formuladb-env/frmdb-apps/test-app/new-page.html').toString();
        let expected = htmlTools.normalizeHTMLDoc(/*html*/`
            <!DOCTYPE html>
            <html>
            <head>
                <title>New Page Title</title>
                <meta name="description" content="some description">
                <meta name="author" content="John">
                <meta name="frmdb_display_date" content="2020-11-03">
            </head>
            <body>
                <h1>Template Page</h1>
            </body>
        `);
        expect(expected).toEqual(htmlTools.normalizeHTMLDoc(savedPage));

        let pages = await frmdbEngineStore.kvsFactory.metadataStore.getPages('frmdb-apps', 'test-app');
        expect(pages).toEqual([{
            ...page1Obj,
            _id: 'frmdb-apps/test-app/new-page',
        }]);

        let page2Obj = {
            _id: '',
            name: "new-page-2",
            title: "New Page Title 2",
            author: "John",
            description: "some description 2",
            frmdb_display_date: "2020-11-03",
            screenshot: '/formuladb-env/frmdb-apps/test-app/static/new-page-2.png',
        };
        await frmdbEngineStore.kvsFactory.metadataStore.setPageProperties(
            parsePageUrl(`/en-basic-1a1a1a-ffffff-Frames/frmdb-apps/test-app/${page2Obj.name}.html`),
            page2Obj, "new-page");

        pages = await frmdbEngineStore.kvsFactory.metadataStore.getPages('frmdb-apps', 'test-app');
        expect(pages).toEqual([{
            ...page2Obj,
            _id: 'frmdb-apps/test-app/new-page-2',
        }, {
            ...page1Obj,
            _id: 'frmdb-apps/test-app/new-page',
        }]);
    });
});
