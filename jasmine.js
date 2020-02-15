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

process.env.FRMDB_SPECS = "true";
process.env.GOOGLE_APPLICATION_CREDENTIALS = `${process.cwd()}/ci/FormulaDB-storage-full.json`;

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

//JSDOM for fe specs
// const { JSDOM } = require('@tbranyen/jsdom');
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html>', { url: "http://localhost" })

function setJsdomGlobals() {
    console.log("Setting JSDOM globals");
    let nodeGlobal = global;

    nodeGlobal.window = jsdom.window;
    nodeGlobal.Window = jsdom.window;
    nodeGlobal.document = jsdom.window.document;
    nodeGlobal.DOMParser = window.DOMParser;
    nodeGlobal.XMLSerializer = window.XMLSerializer;
    nodeGlobal.HTMLElement = window.HTMLElement;
    nodeGlobal.Document = window.Document;
    nodeGlobal.DocumentFragment = window.DocumentFragment;
    nodeGlobal.Element = window.Element;
    nodeGlobal.Node = window.Node;
    nodeGlobal.Attr = window.Attr;
    nodeGlobal.Event = window.Event;
    nodeGlobal.CustomEvent = window.CustomEvent;
    nodeGlobal.ShadowRoot = window.ShadowRoot;
    nodeGlobal.HTMLInputElement = window.HTMLInputElement;
    nodeGlobal.HTMLSelectElement = window.HTMLSelectElement;
    nodeGlobal.HTMLTextAreaElement = window.HTMLTextAreaElement;
    nodeGlobal.localStorage = window.localStorage;
    nodeGlobal.MutationObserver = window.MutationObserver;
    delete window.location;
    nodeGlobal.window.location = { replace: function () { throw new Error("w.loc.replace not implemented!") } };

    // nodeGlobal.self = nodeGlobal.window;//for polyfills
    // require('@webcomponents/custom-elements');
    const polyfillCustomElements = require('custom-elements-module');
    polyfillCustomElements(window);
    nodeGlobal.customElements = window.customElements;
    nodeGlobal.ErrorEvent = window.ErrorEvent;
    nodeGlobal.HTMLUnknownElement = window.HTMLUnknownElement;
    nodeGlobal.HTMLElement = window.HTMLElement;

    const fetch = require('node-fetch');
    nodeGlobal.fetch = fetch;


    const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');
    jsdomDevtoolsFormatter.install();

    if (!nodeGlobal.HTMLElement.prototype.insertAdjacentElement) {

        nodeGlobal.HTMLElement.prototype.insertAdjacentElement = function (position, elem) {
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
}

function unsetJsdomGlobals() {
    let nodeGlobal = global;

    delete nodeGlobal.window;
    delete nodeGlobal.Window;
    delete nodeGlobal.document;
    delete nodeGlobal.DOMParser;
    delete nodeGlobal.XMLSerializer;
    delete nodeGlobal.HTMLElement;
    delete nodeGlobal.Document;
    delete nodeGlobal.DocumentFragment;
    delete nodeGlobal.Element;
    delete nodeGlobal.Node;
    delete nodeGlobal.Attr;
    delete nodeGlobal.Event;
    delete nodeGlobal.CustomEvent;
    delete nodeGlobal.ShadowRoot;
    delete nodeGlobal.HTMLInputElement;
    delete nodeGlobal.HTMLSelectElement;
    delete nodeGlobal.HTMLTextAreaElement;
    delete nodeGlobal.localStorage;
    delete nodeGlobal.MutationObserver;
    delete nodeGlobal.customElements;
    delete nodeGlobal.ErrorEvent;
    delete nodeGlobal.HTMLUnknownElement;
    delete nodeGlobal.HTMLElement;
    delete nodeGlobal.fetch;
}

console.log(process.argv);
const ignoredSpecFiles = [
    "!tsc-out/storage/**/*.rem.spec.js",
    "!tsc-out/core/**/*.stress.spec.js",
    "!tsc-out/core/**/*.rem.spec.js",
];
let specFiles = [];
let specificTsFile = process.argv[2];
if (specificTsFile && specificTsFile.match(/\.spec\.ts$/)) {
    specFiles = [`tsc-out/${specificTsFile.replace(/\\/g, '/').replace(/\.ts$/, '.js')}`];
    console.log("Running just one spec file ", specFiles);
    if (specificTsFile.indexOf('fe/src') == 0) {
        setJsdomGlobals();
    }
} else if (specificTsFile === "browser") {
    setJsdomGlobals();
    specFiles = [
        "tsc-out/fe/**/*.spec.js",
    ].concat(ignoredSpecFiles);
} else {
    specFiles = [
        "tsc-out/core/**/*.spec.js",
        "tsc-out/storage/**/*.spec.js",
    ].concat(ignoredSpecFiles);
}

console.warn("Running spec files", specFiles);

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new Jasmine();

    j.loadConfig({
        random: false,
        "spec_dir": ".",
        "spec_files": specFiles,
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
