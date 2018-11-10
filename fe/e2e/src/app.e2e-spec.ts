/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 * TODOs:
 * 1. Take into account the time spent in loading page elements and remove it from the browser sleep duration. Could impact timing. 
 * 2. FInd out why do I need that sleep before merging the audio/video files
 * 3. Test and adapt it to run inside a container
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
const path = require('path');
const mp3Duration = require('mp3-duration');
// export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

var messages = [ 'Chapter 1, main page: One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.',
                 'Chapter 2, Financial: He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.',
                 'Chapter 3, Forms: The bedding was hardly able to cover it and seemed ready to slide off any moment.',
                 'Chapter 4, General: His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. ',
                 'Chapter 5, Inventory: "What\'s happened to me?" he thought.',
                 'Chapter 6, Reports: It wasn\'t a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.' ];

var durations = new Array(messages.length);

async function create_audio_tracks() {

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

describe('workspace-project App', () => {
  var until = ExpectedConditions;
  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    await create_audio_tracks();
  });

  var stream;

  it('should display main page', () => {
    browser.driver.get('http://localhost:4200/');
    var financial = element(by.css('[href="/0/Financial"]'));
    browser.wait(until.presenceOf(financial), 50000, 'Element taking too long to appear in the DOM').then(() => {
      stream = new ffmpeg().input('desktop').inputOptions([	'-f gdigrab' ]).fps(24).size('100%').videoBitrate('4096k').output('e2e/reports/videos/protractor.avi');
      stream.run();
      browser.sleep(durations[0]);  
    });
  });

  it('Go to Financial page', () => {
    var financial = element(by.css('[href="/0/Financial"]'));
    financial.click();
    browser.sleep(durations[1]);
  });

  it('Go to Forms page', () => {
    var forms = element(by.css('[href="/0/Forms"]'));
    forms.click();
    browser.sleep(durations[2]);
  })

  it('Go to General page', () => {
    var general = element(by.css('[href="/0/General"]'));
    general.click();
    browser.sleep(durations[3]);
  })

  it('Go to Inventory page', () => {
    var inventory = element(by.css('[href="/0/Inventory"]'));
    inventory.click();
    browser.sleep(durations[4]);
  })

  it('Go to Reports page', () => {
    var reports = element(by.css('[href="/0/Reports"]'));
    reports.click();
    browser.sleep(durations[5]).then(() =>{
      stream.kill();
    });
    browser.sleep(2000); // what's going on here ? need to wait somehow for audio / video processing to finish ?
    stream.on('error', function() {
      console.log('Ffmpeg has been killed');
  
      var concat_audio = new ffmpeg()
        .input('concat:e2e/reports/videos/output_0.mp3|e2e/reports/videos/output_1.mp3|e2e/reports/videos/output_2.mp3|e2e/reports/videos/output_3.mp3|e2e/reports/videos/output_4.mp3|e2e/reports/videos/output_5.mp3')
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
            })
            .output('e2e/reports/videos/protractor-final.avi')
            .run();  
        })
        .output('e2e/reports/videos/protractor.mp3')
        .run();  
    });
  })

});
