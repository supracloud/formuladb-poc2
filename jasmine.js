/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

let isNode = require('detect-node');
console.error(isNode);
if (isNode) {
    require('jsdom-global')();
}

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new Jasmine();

    j.loadConfig({
        "spec_dir": ".",
        "spec_files": [
            "tsc-out/fe/src/live-dom-template/**/*.spec.js",
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
    console.error(e); 
}
