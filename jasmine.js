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
global.document = jsdom.window.document;
global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;
global.HTMLElement = window.HTMLElement;
global.Document = window.Document;
global.Element = window.Element;
global.Node = window.Node;
global.Event = window.Event;
global.Attr = window.Attr;
global.customElements = window.customElements;

const fetch = require('node-fetch');
global.fetch = fetch;

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new Jasmine();

    j.loadConfig({
        "spec_dir": ".",
        "spec_files": [
            "tsc-out/fe/**/*.spec.js",
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
