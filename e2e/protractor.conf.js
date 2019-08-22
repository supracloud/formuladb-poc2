const { SpecReporter } = require('jasmine-spec-reporter');
const isWsl = require('is-wsl');

var target = process.env.TARGET;

exports.config = {
  allScriptsTimeout: 11000,
  params: {
    recordings: false,
    audio: false
  },
  specs: [
    './src/**/*.spec.ts'
  ],
  getMultiCapabilities: function () {

    var extra_args = [];

    if (target == 'headless') {
      extra_args.push("--headless")
    }

    var multiCapabilities =
      [{
          name: 'Chrome headless',
          browserName: 'chrome',
          chromeOptions: {
            args: [
              '--window-size=1920,1080'
            ].concat(extra_args)
          }
      }];

    return multiCapabilities;
  },
  directConnect: true,
  baseUrl: 'https://formuladb.online',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },

  // Use native async/await browser support
  SELENIUM_PROMISE_MANAGER: false,

  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, '../tsconfig.json')
    });

    jasmine.getEnv().addReporter(new SpecReporter({  // add jasmine-spec-reporter
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
    browser.manage().window().maximize();
    browser.waitForAngularEnabled(false);
  }
};

// special handling when running within WSL
if (isWsl) {
  exports.config.directConnect = false;

  // Selenium standalone server should be started in Windows, expecting port 4445
  exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
}
