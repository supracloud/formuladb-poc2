// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('karma-log-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      captureConsole: process.platform === "win32" ? true : false,
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    specReporter: {
      maxLogLines: 10,             // limit number of lines logged per test
      suppressErrorSummary: true, // do not print error summary
      suppressFailed: false,      // do not print information about failed tests
      suppressPassed: false,      // do not print information about passed tests
      suppressSkipped: false,      // do not print information about skipped tests
      showSpecTiming: false,      // print the time elapsed for each spec
      failFast: false              // test would finish with error when a first fail occurs. 
    },
    logReporter: {
      outputPath: "./",
      outputName: "karma.log"
    },    
    reporters: process.platform === "win32" ? ['log-reporter', 'spec', 'kjhtml'] : ['spec'],
    port: 9876,
    colors: true,
    logLevel: process.platform === "win32" ? config.LOG_INFO : config.LOG_WARN,
    autoWatch: true,
    browsers: [process.platform === "win32" ? "ChromeDebugging" : "ChromeHeadless"],
    singleRun: false,
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9369' ]
      }
    },    
  });
};