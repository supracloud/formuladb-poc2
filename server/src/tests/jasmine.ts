require('source-map-support').install();

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const Jasmine = require("jasmine");

try {

    let j = new Jasmine();

    j.loadConfig({
        "spec_dir": "dist",
        "spec_files": [
            "**/**spec.js"
        ],
    });

    j.clearReporters();               // remove default reporter logs
    j.addReporter(new SpecReporter({  // add jasmine-spec-reporter
        spec: {
            displayPending: true,
            displayStacktrace: true,
        },
        summary: {
            displayDuration: false,
        }
    }));


    j.execute();

} catch (e) { console.error(e); }
