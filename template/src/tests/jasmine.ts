/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import 'source-map-support/register';
import 'module-alias/register';
import { SpecReporter } from 'jasmine-spec-reporter';

import Jasmine = require('jasmine');
import * as _ from 'lodash';

try {
    let j = new Jasmine({});

    j.loadConfig({
        "spec_dir": "./dist/template",
        "spec_files": [
            "**/*.spec.js",
            // "fe/src/app/common/key_value_store_i.spec.js"
        ],
    });

    j.env.clearReporters();               // remove default reporter logs
    j.env.addReporter(new SpecReporter({  // add jasmine-spec-reporter
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
