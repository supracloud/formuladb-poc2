const { SpecReporter } = require('jasmine-spec-reporter');
const isWsl = require('is-wsl');

var target = process.env.TARGET;

var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

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
            '--window-size=1920,1080',
            '--no-sandbox'
          ].concat(extra_args)
        }
      }];

    return multiCapabilities;
  },
  directConnect: true,
  baseUrl: 'https://staging.formuladb.io',
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

    jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
      dest: 'e2e/reports',
      filename: 'e2e-report.html',
      captureOnlyFailedSpecs: true
    }));

    browser.manage().window().maximize();
    browser.manage().logs()
      .get('browser').then(function (browserLog) {
        console.log('log: ' +
          require('util').inspect(browserLog));
      });
    browser.waitForAngularEnabled(false);

    if (target && target.startsWith('recordings')) {
      browser.params.recordings = true;
    }
    if (target && target == 'recordings-with-audio') {
      browser.params.audio = true;
    }    

  }
};

// special handling when running within WSL
if (isWsl) {
  exports.config.directConnect = false;

  // Selenium standalone server should be started in Windows, expecting port 4445
  exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
}
