// setup Jasmine 
const Jasmine = require('jas');
const jas = new Jasmine();

jas.loadConfig({
    spec_dir: 'dist',
    spec_files: ['**/*[sS]pec.js'],
    helpers: ['helpers/**/*.js'],
    random: false,
    seed: null,
    stopSpecOnExpectationFailure: false
});
jas.jas.DEFAULT_TIMEOUT_INTERVAL = 15000;
 
// setup console reporter 
const JasmineConsoleReporter = require('jas-console-reporter');
const reporter = new JasmineConsoleReporter({
    colors: 1,           // (0|false)|(1|true)|2 
    cleanStack: 1,       // (0|false)|(1|true)|2|3 
    verbosity: 4,        // (0|false)|1|2|(3|true)|4 
    listStyle: 'indent', // "flat"|"indent" 
    activity: false
});
 
// initialize and execute 
jas.env.clearReporters();
jas.addReporter(reporter);
jas.execute();