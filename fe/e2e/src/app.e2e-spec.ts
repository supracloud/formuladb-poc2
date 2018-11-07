/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
var VideoReporter = require('protractor-video-reporter');
const path = require('path');
const mp3Duration = require('mp3-duration');
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();
const fs = require('fs');
var ChildProcess = require('child_process');

var messages = [ 'Welcome to the FormulaDB main page',
                 'Welcome to the financial page',
                 'Welcome to the forms page',
                 'Welcome to the general page',
                 'Welcome to the inventory page',
                 'Welcome to the reports page' ];

var durations = new Array(messages.length);

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
  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }
  
    // Write the binary audio content to a local file
    fs.writeFile('e2e/reports/videos/output_' + request.id + '.mp3', response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log('Audio content written to file: e2e/reports/videos/output_' + request.id + '.mp3');
      mp3Duration('e2e/reports/videos/output_' + request.id + '.mp3', function (err, duration) {
        if (err) return console.log(err.message);
        console.log('Your file is ' + duration + ' seconds long');
        durations[request.id] = duration;
      });
    });
  });
};
                

describe('workspace-project App', () => {
  var until = ExpectedConditions;
  beforeEach(() => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
  });

  it('should display main page', () => {
    browser.driver.get('http://localhost:4200/');
    expect(browser.getTitle()).toEqual('Fe');
  });

  it('Go to Financial page', () => {
    var financial = element(by.css('[href="/0/Financial"]'));
    browser.wait(until.presenceOf(financial), 50000, 'Element taking too long to appear in the DOM');
    financial.click();
    browser.sleep(2000);
  });

  it('Go to Forms page', () => {
    var forms = element(by.css('[href="/0/Forms"]'));
    browser.wait(until.presenceOf(forms), 50000, 'Element taking too long to appear in the DOM');
    forms.click();
    browser.sleep(2000);
  })

  it('Go to General page', () => {
    var general = element(by.css('[href="/0/General"]'));
    browser.wait(until.presenceOf(general), 50000, 'Element taking too long to appear in the DOM');
    general.click();
    browser.sleep(2000);
  })

  it('Go to Inventory page', () => {
    var inventory = element(by.css('[href="/0/Inventory"]'));
    browser.wait(until.presenceOf(inventory), 50000, 'Element taking too long to appear in the DOM');
    inventory.click();
    browser.sleep(2000);
  })

  it('Go to Reports page', () => {
    var reports = element(by.css('[href="/0/Reports"]'));
    browser.wait(until.presenceOf(reports), 50000, 'Element taking too long to appear in the DOM');
    reports.click();
    browser.sleep(2000);

    var _ffmpeg = ChildProcess.spawn(path.normalize('./node_modules/ffmpeg-binaries/bin/ffmpeg.exe'),
      [
        '-i', 'concat:e2e/reports/videos/output_1.mp3|e2e/reports/videos/output_2.mp3|e2e/reports/videos/output_3.mp3|e2e/reports/videos/output_4.mp3|e2e/reports/videos/output_5.mp3|e2e/reports/videos/output_6.mp3',
        '-c','copy',
        'e2e/reports/videos/protractor.mp3',
      ]);

    _ffmpeg.on('close', function (code) {
      var _ffmpeg = ChildProcess.spawn(path.normalize('./node_modules/ffmpeg-binaries/bin/ffmpeg.exe'),
        [ '-i', 'e2e/reports/videos/protractor-specs.avi',
          '-i', 'e2e/reports/videos/protractor.mp3',
          '-codec', 'copy',
          '-shortest', 'e2e/reports/videos/protractor-final.avi']);
    });
  })

});
