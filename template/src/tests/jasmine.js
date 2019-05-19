/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */
import 'source-map-support/register';
import 'module-alias/register';
try {
    let j = new Jasmine({});
    j.loadConfig({
        "spec_dir": "dist",
        "spec_files": [
            "**/*.spec.js",
        ],
    });
    j.execute();
}
catch (e) {
    console.error(e);
}
