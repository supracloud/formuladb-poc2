/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

const SpecReporterStorage = require('jasmine-spec-reporter').SpecReporter;
const JasmineStorage = require("jasmine");

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new JasmineStorage();

    j.loadConfig({
        "spec_dir": "dist",
        "spec_files": [
            "**/*.spec.js"
        ],
    });

    j.clearReporters();               // remove default reporter logs
    j.addReporter(new SpecReporterStorage({  // add jasmine-spec-reporter
        spec: {
            displayPending: false,
            displayStacktrace: true,
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
