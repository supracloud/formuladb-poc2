// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

var VideoReporter = require('protractor-video-reporter');
const Path = require('path');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
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

    jasmine.getEnv().addReporter(new VideoReporter({
      baseDirectory: Path.join(__dirname, 'reports/videos/'),
      ffmpegArgs: [
        '-f', 'gdigrab',
        '-framerate', '24',
        '-video_size', 'wsxga',
        '-i', 'desktop',
        '-q:v','10',
      ],
      ffmpegCmd: Path.normalize('./node_modules/ffmpeg-binaries/bin/ffmpeg.exe'),
    }));
  }
};