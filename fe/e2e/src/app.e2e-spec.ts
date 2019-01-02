/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 * 
 */

import { browser, element, ExpectedConditions, by } from 'protractor';
const path = require('path');
const mp3Duration = require('mp3-duration');
// export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();
const fs = require('fs');
var shell = require('shelljs');
var e2e_utils = require("./utils");

let test_name = 'app';
//https://cloud.google.com/text-to-speech/docs/ssml
var messages = [ '<speak>Chapter 1, Forms: One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.<break time="1s"/></speak>',
                 '<speak>Chapter 2, Financial: He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.<break time="1s"/></speak>',
                 '<speak>Chapter 3, General: The bedding was hardly able to cover it and seemed ready to slide off any moment.<break time="1s"/></speak>',
                 '<speak>Chapter 4, Inventory: His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.<break time="1s"/></speak>',
                 '<speak>Chapter 5, Music Booking: "What\'s happened to me?" he thought.<break time="1s"/></speak>'];

var durations = new Array(messages.length);
var stream;


describe('workspace-project App', () => {
  var until = ExpectedConditions;
  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
    await e2e_utils.create_audio_tracks(messages, durations);
  });

  var stream;

  it('Go to Forms page', async () => {
    browser.driver.get('http://localhost:4200/');
    var forms = element(by.css('html > body > frmdb-root > frmdb-layout > div > div > div > frmdb-navigation > ul > li > a'));
    await browser.wait(until.presenceOf(forms), 50000, 'Element taking too long to appear in the DOM');
    stream = e2e_utils.create_stream_and_run();
    await e2e_utils.handle_element_click(forms, durations[0]);
  });

  it('Go to Financial page', async () => {
    var financial = element(by.css('html > body > frmdb-root > frmdb-layout > div > div > div > frmdb-navigation > ul > li:nth-of-type(2) > a'));
    await e2e_utils.handle_element_click(financial, durations[1]);
  })

  it('Go to General page', async () => {
    var general = element(by.css('html > body > frmdb-root > frmdb-layout > div > div > div > frmdb-navigation > ul > li:nth-of-type(3) > a'));
    await e2e_utils.handle_element_click(general, durations[2]);
  })

  it('Go to Inventory page', async () => {
    var inventory = element(by.css('html > body > frmdb-root > frmdb-layout > div > div > div > frmdb-navigation > ul > li:nth-of-type(4) > a'));
    await e2e_utils.handle_element_click(inventory, durations[3]);
  })

  it('Go to Music Booking page', async () => {
    var music = element(by.css('html > body > frmdb-root > frmdb-layout > div > div > div > frmdb-navigation > ul > li:nth-of-type(5) > a'));
    await e2e_utils.handle_element_click(music, durations[4]);

    await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);

    await e2e_utils.concat_audio(messages);

    await e2e_utils.merge_video_and_audio();

    await e2e_utils.crop_video();

    await e2e_utils.create_gif_palette_and_video();

    e2e_utils.cleanup(test_name);
  })

});
