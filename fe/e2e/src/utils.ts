const shell = require('shelljs');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const mp3Duration = require('mp3-duration');
import { browser, element, ExpectedConditions, by, ElementFinder } from 'protractor';
import { strictEqual } from 'assert';
import { stringify } from '@angular/core/src/render3/util';
const robot = require("robotjs");

const client = new textToSpeech.TextToSpeechClient();

export async function create_audio_tracks(messages: string[], durations: number[]) {

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
  
export async function handle_element_click(button: ElementFinder, duration: number) {
    let startTime = new Date().getTime();
    let location = await button.getLocation();
    let extra_height = Number(await browser.executeScript('return window.outerHeight - window.innerHeight;'));
    console.log("Extra height from browser ", Number(extra_height));
    robot.moveMouseSmooth(location.x+10,location.y+10+Number(extra_height));
    button.click();
    let endTime = new Date().getTime();
    await browser.sleep(duration - (endTime-startTime));
    console.log("time spent in action", (endTime-startTime));
}

export function get_input_audio_string(number_of_audios: number): string {
    let inputs = 'concat:';
    for (var _i = 0; _i < number_of_audios; _i++) {
        inputs += 'e2e/reports/videos/output_' + String(_i) + '.mp3|';
    }

    return inputs;
}

export function cleanup(test_name: string): void {
    shell.mv('e2e/reports/videos/protractor-cropped.avi', 'e2e/reports/videos/'+test_name+'.avi');
    shell.mv('e2e/reports/videos/protractor-cropped.gif', 'e2e/reports/videos/'+test_name+'.gif');
    shell.rm('e2e/reports/videos/protractor.avi');
    shell.rm('e2e/reports/videos/protractor.mp3');
    shell.rm('e2e/reports/videos/output*.mp3');
    shell.rm('e2e/reports/videos/protractor-final.avi');
}