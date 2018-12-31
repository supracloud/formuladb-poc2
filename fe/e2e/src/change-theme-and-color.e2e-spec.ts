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
var e2e_utils = require("./utils");

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

let test_name = 'change-theme-and-color';

var messages = [ 'Go to setting menu on the top right corner of the screen',
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


fdescribe('Switch themes colors and images', () => {
  var until = ExpectedConditions;
  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();

    await e2e_utils.create_audio_tracks(messages, durations);
  });

  var stream;

  it('should display main page and go to settings', async () => {
    browser.driver.get('http://localhost:4200/');
    var button = element(by.css('a#TopNavSettings'));

    await browser.wait(until.presenceOf(button), 50000, 'Element taking too long to appear in the DOM');

    if (isWin) {
      stream = new ffmpeg().input('desktop').inputOptions(['-f gdigrab' ]).fps(24).size('100%').videoBitrate('4096k').output('e2e/reports/videos/protractor.avi');
    } else {
      stream = new ffmpeg()
                .input(process.env.DISPLAY)
                .inputOptions([ '-f x11grab', '-s 1920x1080' ])
                .fps(24)
                .videoBitrate('4096k')
                .output('e2e/reports/videos/protractor.avi');
    }

    stream.run();

    await e2e_utils.handle_element_click(button, durations[0]);
  });

  it('Step 2', async () => {
    let button = element(by.css('div#navigation > ul:nth-of-type(2) > li > div > a:nth-of-type(3)'));
    await e2e_utils.handle_element_click(button, durations[1]);
  });

  it('Step 3', async () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)>span:nth-of-type(2)'));
    await e2e_utils.handle_element_click(button, durations[2]);
  });

  it('Step 4', async () => {
    let button = element(by.css('i:nth-of-type(5)'));
    await e2e_utils.handle_element_click(button, durations[3]);
  });

  it('Step 5', async () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)'));
    await e2e_utils.handle_element_click(button, durations[4]);
  });

  it('Step 6', async () => {
    let button = element(by.css('a:nth-of-type(5)>img:nth-of-type(2)'));
    await e2e_utils.handle_element_click(button, durations[5]);
  });

  it('Step 7', async () => {
    let button = element(by.css('ul:nth-of-type(2)>li>a:nth-of-type(1)'));
    await e2e_utils.handle_element_click(button, durations[6]);
  });

  it('Step 8', async () => {
    let button = element(by.css('a:nth-of-type(7)>img'));
    await e2e_utils.handle_element_click(button, durations[7]);
  });

  it('Step 9', async () => {
    let button = element(by.css('frmdb-top-nav>nav>div:nth-of-type(1)>div:nth-of-type(1)>ul:nth-of-type(1)>li:nth-of-type(2)>a:nth-of-type(1)'));
    await e2e_utils.handle_element_click(button, durations[8]);
  });

  it('Step 10', async () => {
    let button = element(by.css('a:nth-of-type(6)>img'));
    await e2e_utils.handle_element_click(button, durations[9]);
  });

  it('Step 11', async () => {
    let button = element(by.css('frmdb-top-nav>nav>div:nth-of-type(1)>div:nth-of-type(1)>ul:nth-of-type(1)>li:nth-of-type(2)>a:nth-of-type(1)'));
    await e2e_utils.handle_element_click(button, durations[10]);
  });

  it('Step 12', async () => {
    let button = element(by.css('a:nth-of-type(7)'));
    await e2e_utils.handle_element_click(button, durations[11]);
    stream.kill();

    stream.on('error', function() {
      console.log('Ffmpeg has been killed');
  
      var concat_audio = new ffmpeg()
        .input(e2e_utils.get_input_audio_string(messages.length))
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

              // GIF palette
              var gif_video = new ffmpeg()
              .input('e2e/reports/videos/protractor-final.avi')
              .filterGraph('palettegen')
              .on('error', function(err) {
                console.log('An error occurred during gif palette: ' + err.message);
            })
            .on('end', function() {
              console.log('GIF palette setup finished !');
              // GIF
              var gif_video = new ffmpeg()
              .input('e2e/reports/videos/protractor-final.avi')
              .input('e2e/reports/videos/palette.png')
              .on('error', function(err) {
                  console.log('An error occurred during gif conversion: ' + err.message);
              })
              .on('end', function() {
                  console.log('GIF conversion finished !');
              })
              .output('e2e/reports/videos/protractor-cropped.gif')
              .complexFilter([ "crop=1920:950:0:130,fps=10,scale=1280:-1:flags=lanczos[x];[x][1:v]paletteuse" ])
              .run();
            })
            .output('e2e/reports/videos/palette.png')
            .run();

            })
            .output('e2e/reports/videos/protractor-final.avi')
            .run();  
          })
        .output('e2e/reports/videos/protractor.mp3')
        .run();  
    });
    browser.sleep(20000).then(() =>{// what's going on here ? need to wait somehow for audio / video processing to finish ?
      e2e_utils.cleanup(test_name);
    }); 
  })

});
