// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

const path = require('path');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/inventory-base.e2e-spec.ts'
    // './src/**/change-theme-and-color.e2e-spec.ts'
  ],
//https://peter.sh/experiments/chromium-command-line-switches/
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
        args: [
            '--window-size=1920,1080',
//            '--headless'
// --start-fullscreen doesn't work right, don't lose your time with it. We'll have to crop the video as a final step of the test.
        ]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4300/0/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });

    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
