/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 1. Settings, Enable developer mode
 * 1. Change color for the 1st theme
 * 2. Change image for the 1st theme
 * 3. Switch between themes
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
var robot = require("robotjs");

const path = require('path');
const mp3Duration = require('mp3-duration');
// export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
var shell = require('shelljs');
var isWin = process.platform === "win32";

ffmpeg.setFfmpegPath(ffmpegPath);

var messages = [ 'Go to setting menu',
                 'Click on Enable Developer Mode',
                 'Go back to the setting menu',
                 'Change the theme color from the color scheme',
                 'Go back to the setting menu',
                 'Change the theme background image from the predefined list of images',
                 'Go back to the setting menu',
                 'Change the theme to material',
                 'Go back to the setting menu',
                 'Change the theme to NowUI theme',
                 'Go back to the setting menu',
                 'Click on Disable Developer Mode' ];

var durations = new Array(messages.length);

async function create_audio_tracks() {

  shell.mkdir('-p', 'e2e/reports/videos/');
  shell.rm('-rf', 'e2e/reports/videos/');
  if (!fs.existsSync('e2e/reports/videos/')) {
    fs.mkdirSync('e2e/reports/videos/');
  }

  for (var i = 0; i < messages.length; i++) {
    const request = {
      id: i,
      input: {text: messages[i]},
      // Select the language and SSML Voice Gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      // Select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    let response = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    fs.writeFileSync('e2e/reports/videos/output_' + request.id + '.mp3', response[0].audioContent);
    console.log('Audio content written to file: e2e/reports/videos/output_' + request.id + '.mp3');

    let duration = await mp3Duration('e2e/reports/videos/output_' + request.id + '.mp3');

    console.log('Your file is ' + duration + ' seconds long');
    durations[request.id] = duration * 1000;
  };
}

fdescribe('Switch themes colors and images', () => {
  var until = ExpectedConditions;
  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();

    await create_audio_tracks();
  });

  var stream;

  it('should display main page and go to settings', () => {
    browser.driver.get('http://localhost:4200/');
    var settings = element(by.css('a#TopNavSettings'));

    settings.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });

    browser.wait(until.presenceOf(settings), 50000, 'Element taking too long to appear in the DOM').then(() => {
      if (isWin) {
        stream = new ffmpeg().input('desktop').inputOptions([    '-f gdigrab' ]).fps(24).size('100%').videoBitrate('4096k').output('e2e/reports/videos/protractor.avi');
      } else {
        stream = new ffmpeg()
                 .input(process.env.DISPLAY)
                 .inputOptions([ '-f x11grab', '-s 1920x1080' ])
                 .fps(24)
                 .videoBitrate('4096k')
                 .output('e2e/reports/videos/protractor.avi');
      }

      stream.run();
      settings.click();
      browser.sleep(durations[0]);
      console.log("slept ", durations[0]);
    });
  });

  it('Step 2', () => {
    let devMode = element(by.css('div#navigation > ul:nth-of-type(2) > li > div > a:nth-of-type(3)'));
    devMode.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    devMode.click();
    browser.sleep(durations[1]);
  });

  it('Step 3', () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)>span:nth-of-type(2)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[2]);
  });

  it('Step 4', () => {
    let button = element(by.css('i:nth-of-type(5)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[3]);
  });

  it('Step 5', () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[4]);
  });

  it('Step 6', () => {
    let button = element(by.css('a:nth-of-type(5)>img:nth-of-type(2)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[5]);
  });

  it('Step 7', () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[6]);
  });

  it('Step 8', () => {
    let button = element(by.css('a:nth-of-type(7)>img'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[7]);
  });

  it('Step 9', () => {
    let button = element(by.css('frmdb-top-nav>nav>div:nth-of-type(1)>div:nth-of-type(1)>ul:nth-of-type(1)>li:nth-of-type(2)>a:nth-of-type(1)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[8]);
  });

  it('Step 10', () => {
    let button = element(by.css('a:nth-of-type(6)>img'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[9]);
  });

  it('Step 11', () => {
    let button = element(by.css('frmdb-top-nav>nav>div:nth-of-type(1)>div:nth-of-type(1)>ul:nth-of-type(1)>li:nth-of-type(2)>a:nth-of-type(1)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();
    browser.sleep(durations[10]);
  });

  it('Step 12', () => {
    let button = element(by.css('a:nth-of-type(7)'));
    button.getLocation().then(function (location) {

      browser.executeScript('return window.outerHeight - window.innerHeight;').then(extra_height => {
        console.log(Number(extra_height));
        robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
      });
    });
    button.click();

    browser.sleep(durations[11]).then(() =>{
      stream.kill();
    });
    stream.on('error', function() {
      console.log('Ffmpeg has been killed');
  
      var concat_audio = new ffmpeg()
        .input('concat:e2e/reports/videos/output_0.mp3|'+
                      'e2e/reports/videos/output_1.mp3|'+
                      'e2e/reports/videos/output_2.mp3|'+
                      'e2e/reports/videos/output_3.mp3|'+
                      'e2e/reports/videos/output_4.mp3|'+
                      'e2e/reports/videos/output_5.mp3|'+
                      'e2e/reports/videos/output_6.mp3|'+
                      'e2e/reports/videos/output_7.mp3|'+
                      'e2e/reports/videos/output_8.mp3|'+
                      'e2e/reports/videos/output_9.mp3|'+
                      'e2e/reports/videos/output_10.mp3|'+
                      'e2e/reports/videos/output_11.mp3|')
        .audioCodec('copy')
        .on('error', function(err) {
          console.log('An error occurred merging audio: ' + err.message);
        })
        .on('end', function() {
          console.log('Audio Merging finished !');
          var merge_video_and_audio = new ffmpeg()
            .input('e2e/reports/videos/protractor.avi')
            .input('e2e/reports/videos/protractor.mp3')
            .audioCodec('copy')
            .videoCodec('copy')
            .on('error', function(err) {
              console.log('An error occurred merging audio and video: ' + err.message);
            })
            .on('end', function() {
              console.log('Audio/Video Merging finished !');

              // crop
              var cropped_video = new ffmpeg()
              .input('e2e/reports/videos/protractor-final.avi')
              .audioCodec('copy')
              .on('error', function(err) {
                  console.log('An error occurred cropping: ' + err.message);
              })
              .on('end', function() {
                  console.log('Video cropping finished !');
              })
              .fps(24)
              .videoBitrate('4096k')
              .output('e2e/reports/videos/protractor-cropped.avi')
              .complexFilter([ "crop=1920:950:0:130" ])
              .run();

              // GIF
              var gif_video = new ffmpeg()
              .input('e2e/reports/videos/protractor-final.avi')
              .on('error', function(err) {
                  console.log('An error occurred during gif conversion: ' + err.message);
              })
              .on('end', function() {
                  console.log('GIF conversion finished !');
              })
              .output('e2e/reports/videos/protractor-cropped.gif')
              .complexFilter([ "crop=1920:950:0:130" ])
              .run();

            })
            .output('e2e/reports/videos/protractor-final.avi')
            .run();  
          })
        .output('e2e/reports/videos/protractor.mp3')
        .run();  
    });
    browser.sleep(10000); // what's going on here ? need to wait somehow for audio / video processing to finish ?
  })

});
