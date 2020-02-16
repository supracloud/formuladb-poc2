import * as fs from 'fs';
var rimraf = require("rimraf");
import { HTMLTools } from "@core/html-tools";

import * as CleanTheme from '../../formuladb-env/themes/Clean.json';
import * as FramesTheme from '../../formuladb-env/themes/Frames.json';

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
import { parsePageUrl } from '@domain/url-utils';

describe('MetadataStore', () => {
    let frmdbEngineStore: FrmdbEngineStore;

    beforeAll(async () => {
        frmdbEngineStore = await getTestFrmdbEngineStore({ _id: "FRMDB_SCHEMA", entities: {} });
        rimraf.sync("/tmp/frmdb-metadata-store-for-specs/frmdb-apps");
        rimraf.sync("/tmp/frmdb-metadata-store-for-specs/themes");
        fs.mkdirSync("/tmp/frmdb-metadata-store-for-specs/themes");
        fs.writeFileSync('/tmp/frmdb-metadata-store-for-specs/themes/Clean.json', JSON.stringify(CleanTheme));
        fs.writeFileSync('/tmp/frmdb-metadata-store-for-specs/themes/Frames.json', JSON.stringify(FramesTheme));
    });

    function expectSavedPageToEqual(pagePath: string, html: string) {
        let htmlFromFile = fs.readFileSync(pagePath, 'utf8');
        let savedHtmlNormalized = htmlTools.normalizeHTML(htmlFromFile);
        expect(savedHtmlNormalized).toEqual(htmlTools.normalizeHTML(html));
    }

    const PageHtmlFromClientBrowser = /*html*/`
    <!DOCTYPE html>
    <head>
        <title>FormulaDB - Build Applications Without Code</title>
        <link href="/formuladb-env/static/formuladb_io/favicon.png" rel="icon" type="image/png">
    </head>
    <body data-frmdb-tenant="formuladb-env/frmdb-apps" data-frmdb-app="formuladb_io">
        <header>
            <div class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"></div>
            <nav class="navbar" data-frmdb-fragment="_nav.html">
                nav content
            </nav>
        </header>
        <main>main content</main>
        <footer>some footer</footer>
        <div style="display: none; pointer-events: none;" data-frmdb-fragment="_scripts.html">
            <script src="/formuladb-env/plugins/vendor/js/jquery-3.4.1.min.js"></script>
        </div>
    </body>
    </html>`;

    it("Should save page without fragments", async () => {
        await frmdbEngineStore.kvsFactory.metadataStore.savePageHtml(
            parsePageUrl('/en-basic-1a1a1a-ffffff-Clean-e/frmdb-apps/testApp/test.html'),
            PageHtmlFromClientBrowser);

        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/frmdb-apps/testApp/test.html', /*html*/`
<!DOCTYPE html>

<head>
    <title>FormulaDB - Build Applications Without Code</title>
</head>

<body data-frmdb-tenant="formuladb-env/frmdb-apps" data-frmdb-app="formuladb_io">
    <header>
        <div class="jumbotron"></div>
        <div data-frmdb-fragment="_nav.html"></div>
    </header>
    <main>main content</main>
    <footer>some footer</footer>
    <div data-frmdb-fragment="_scripts.html"></div>
</body>

</html>`);
    });

    it("Should save head fragment", async () => {

        let headHtml = fs.readFileSync('/tmp/frmdb-metadata-store-for-specs/frmdb-apps/testApp/_head.html', 'utf8');
        expect(headHtml).toEqual(/*html*/`<head>
<title>FormulaDB - Build Applications Without Code</title>
<link href="/formuladb-env/static/formuladb_io/favicon.png" rel="icon" type="image/png">
</head>`);
    });

    it("Should save nav fragment", async () => {
        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/frmdb-apps/testApp/_nav.html', /*html*/`
            <nav class="navbar" data-frmdb-fragment="_nav.html">
                nav content
            </nav>
        `);
    });

    it("Should save scripts fragment", async () => {
        expectSavedPageToEqual('/tmp/frmdb-metadata-store-for-specs/frmdb-apps/testApp/_scripts.html', /*html*/`
            <div style="display: none; pointer-events: none;" data-frmdb-fragment="_scripts.html">
                <script src="/formuladb-env/plugins/vendor/js/jquery-3.4.1.min.js"></script>
            </div>
        `);
    });

    it("Should read page with fragments assembled", async () => {
        let readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                parsePageUrl('/en-basic-1a1a1a-ffffff-Clean-e/frmdb-apps/testApp/test.html')));

        let expectedHtmlWithCleanTheme = PageHtmlFromClientBrowser.replace(
            `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
            `class="jumbotron w-100 text-center bg-transparent" data-frmdb-theme-classes="w-100 text-center bg-transparent"`,
        );
        let expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithCleanTheme);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);

        readPageHtmlNormalize = htmlTools.normalizeHTMLDoc(
            await frmdbEngineStore.kvsFactory.metadataStore.getPageHtml(
                parsePageUrl('/en-basic-1a1a1a-ffffff-Frames-e/frmdb-apps/testApp/test.html')));

        let expectedHtmlWithFramesTheme = PageHtmlFromClientBrowser.replace(
            `class="jumbotron bg-transparent some-class" data-frmdb-theme-classes="bg-transparent some-class"`,
            `class="jumbotron min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around" data-frmdb-theme-classes="min-vh-50 text-light frmdb-bg-dark-40 m-3 p-3 border border-2 border-primary text-center d-flex flex-column justify-content-around"`,
        );
        expectedNormalizedPage = htmlTools.normalizeHTMLDoc(expectedHtmlWithFramesTheme);
        expect(expectedNormalizedPage).toEqual(readPageHtmlNormalize);

    });

});