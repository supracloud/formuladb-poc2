/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register');
var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    let html = fs.readFileSync(filename, 'utf8');
    module.exports = {default: html};
}
require.extensions['.scss'] = function (module, filename) {
    module.exports = '';//we would need to run sass to make this work
}

//JSDOM for fe specs
const { JSDOM } = require('@tbranyen/jsdom');
const jsdom = new JSDOM('<!doctype html>')
global.window = jsdom.window;
global.Window = jsdom.window;
global.document = jsdom.window.document;
global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;
global.HTMLElement = window.HTMLElement;
global.Document = window.Document;
global.Element = window.Element;
global.Node = window.Node;
global.Attr = window.Attr;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.customElements = window.customElements;
global.ShadowRoot = window.ShadowRoot;


const fetch = require('node-fetch');
global.fetch = fetch;


const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');
jsdomDevtoolsFormatter.install();


const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

console.log(process.argv);
let specificJsFile = null;
let specificTsFile = process.argv[2];
if (specificTsFile && specificTsFile.match(/\.spec\.ts$/)) {
    specificJsFile = `tsc-out/${specificTsFile.replace(/\\/g, '/').replace(/\.ts$/, '.js')}`;
    console.log("Running just one spec file ", specificJsFile)
} 

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new Jasmine();

    j.loadConfig({
        "spec_dir": ".",
        "spec_files": specificJsFile ? [specificJsFile] : [
            "tsc-out/fe/src/autocomplete/autocomplete.component.spec.js",
            "tsc-out/fe/src/db-editor/db-editor.component.spec.js",
            "tsc-out/fe/src/live-dom-template/live-dom-template.spec.js",
            "tsc-out/fe/src/web-component-spec-example.spec.js",
            // "tsc-out/fe/**/*.spec.js",
            // "tsc-out/core/**/*.spec.js",
            // "dist/**/*.spec.js",
        ],
    });

    j.clearReporters();               // remove default reporter logs
    j.addReporter(new SpecReporter({  // add jasmine-spec-reporter
        spec: {
            displayPending: false,
            displayStacktrace: true,
            displayDuration: true,
        },
        summary: {
            displayDuration: false,
            displayPending: false,
        }
    }));


    j.execute();

} catch (e) { 
    console.error(e, e.stack); 
}
