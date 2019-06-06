require('source-map-support').install();
require('module-alias/register');

let isNode = require('detect-node');
console.error(isNode);
if (isNode) {
    require('jsdom-global')();
}

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().clearReporters();               // remove default reporter logs
jasmine.getEnv().addReporter(new SpecReporter({  // add jasmine-spec-reporter
  spec: {
    displayPending: true,
    displayStacktrace: true,
  }
}));
