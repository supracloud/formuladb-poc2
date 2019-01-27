/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

try {
    global['FRMDB_TRACE_COMPILE_FORMULA'] = true;

    let j = new Jasmine();

    j.loadConfig({
        "spec_dir": "dist",
        "spec_files": [
            "**/*.spec.js",
            // "fe/src/app/common/key_value_store_i.spec.js"
        ],
    });

    j.clearReporters();               // remove default reporter logs
    j.addReporter(new SpecReporter({  // add jasmine-spec-reporter
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
