/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import 'source-map-support/register';
import 'module-alias/register';

import Jasmine = require('jasmine');
import * as _ from 'lodash';

try {
    let j = new Jasmine({});

    j.loadConfig({
        "spec_dir": "dist",
        "spec_files": [
            "**/*.spec.js",
            // "fe/src/app/common/key_value_store_i.spec.js"
        ],
    });


    j.execute();

} catch (e) { 
    console.error(e); 
}
