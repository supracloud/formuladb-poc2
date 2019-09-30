/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register');
var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    let html = fs.readFileSync(filename, 'utf8');
    module.exports = { default: html };
}
require.extensions['.scss'] = function (module, filename) {
    module.exports = '';//we would need to run sass to make this work
}

//JSDOM for fe specs
// const { JSDOM } = require('@tbranyen/jsdom');
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html>', { url: "http://localhost" })
global.window = jsdom.window;
global.Window = jsdom.window;
global.document = jsdom.window.document;
global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;
global.HTMLElement = window.HTMLElement;
global.Document = window.Document;
global.DocumentFragment = window.DocumentFragment;
global.Element = window.Element;
global.Node = window.Node;
global.Attr = window.Attr;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.ShadowRoot = window.ShadowRoot;
global.HTMLInputElement = window.HTMLInputElement;
global.HTMLSelectElement = window.HTMLSelectElement;
global.HTMLTextAreaElement = window.HTMLTextAreaElement;
global.localStorage = window.localStorage;
global.MutationObserver = window.MutationObserver;
delete window.location;
window.location = { replace: function () { throw new Error("w.loc.replace not implemented!") } };

// global.self = global.window;//for polyfills
// require('@webcomponents/custom-elements');
const polyfillCustomElements = require('custom-elements-module');
polyfillCustomElements(window);
global.customElements = window.customElements;
global.ErrorEvent = window.ErrorEvent;
global.HTMLUnknownElement = window.HTMLUnknownElement;
global.HTMLElement = window.HTMLElement;

const fetch = require('node-fetch');
global.fetch = fetch;


const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');
jsdomDevtoolsFormatter.install();


if (!global.HTMLElement.prototype.insertAdjacentElement) {

    global.HTMLElement.prototype.insertAdjacentElement = function (position, elem) {
        "use strict";

        var
            ref = this
            , ref_parent = ref.parentNode
            , node, first_child, next_sibling
            ;

        switch (position.toLowerCase()) {
            case "beforebegin":
                ref_parent.insertBefore(elem, ref);
                break;
            case "afterbegin":
                ref.insertBefore(node, ref.firstChild);
                break;
            case "beforeend":
                ref.appendChild(elem);
                break;
            case "afterend":
                ref_parent.insertBefore(elem, ref.nextSibling);
                break;
        }
    };
}

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
        random: false,
        "spec_dir": ".",
        "spec_files": specificJsFile ? [specificJsFile] : [
            "tsc-out/fe/**/*.spec.js",
            "tsc-out/core/**/*.spec.js",
            "tsc-out/storage/**/*.spec.js",
            "!tsc-out/core/**/*.stress.spec.js",
            "!tsc-out/core/**/*.rem.spec.js",
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
            displayDuration: true,
            displayPending: true,
            displaySuccessful: true,
            displayFailed: true,
            displayErrorMessages: false,
        }
    }));


    j.execute();

} catch (e) {
    console.error(e, e.stack);
}
