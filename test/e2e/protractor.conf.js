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
    './specs/**/*.spec.ts'
  ],
  
  capabilities: {
    'browserName': 'chrome'
  },
  
  directConnect: true,
  baseUrl: 'http://localhost:8081',
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

// special handling when running within WSL
if (isWsl) {
  exports.config.directConnect = false;
  
  // Selenium standalone server should be started in Windows, expecting port 4445
  exports.config.seleniumAddress ='http://localhost:4445/wd/hub';
}
