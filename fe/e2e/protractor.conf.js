// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

var VideoReporter = require('protractor-video-reporter');
const path = require('path');

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
    // https://stackoverflow.com/questions/38860261/recording-videos-of-protractor-e2e-tests/45803583#45803583
    VideoReporter.prototype.jasmineStarted = function() {
      var self = this;
      if (self.options.singleVideo) {
        var videoPath = path.join(self.options.baseDirectory, 'protractor-specs.avi');

        self._startScreencast(videoPath);

        if (self.options.createSubtitles) {
          self._subtitles = [];
          self._jasmineStartTime = new Date();
        }
      }
    }; 

    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });

    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

    jasmine.getEnv().addReporter(new VideoReporter({
      baseDirectory: path.join(__dirname, 'reports/videos/'),
      singleVideo: true,
      ffmpegArgs: [
        '-f', 'gdigrab',
        '-framerate', '24',
        '-video_size', 'wsxga',
        '-i', 'desktop',
        '-q:v','10',
      ],
      ffmpegCmd: path.normalize('./node_modules/ffmpeg-binaries/bin/ffmpeg.exe'),
    }));
  }
};