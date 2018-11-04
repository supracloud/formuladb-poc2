'use strict';

const fs = require('fs');
const mp3Duration = require('mp3-duration');

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

// The text to synthesize
const text = 'Hello to the FormulaDB main page! Playing with protractor-video-reporter and Google\'s TTS';

// Construct the request
const request = {
  input: {text: text},
  // Select the language and SSML Voice Gender (optional)
  voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
  // Select the type of audio encoding
  audioConfig: {audioEncoding: 'MP3'},
};

// NOTE:  export GOOGLE_APPLICATION_CREDENTIALS=soica-d09d94fbea9e.json
// Quota: free quota is 300 rpm? https://console.developers.google.com/apis/api/texttospeech.googleapis.com/quotas?project=soica-190717&duration=P30D
// Performs the Text-to-Speech request
client.synthesizeSpeech(request, (err, response) => {
  if (err) {
    console.error('ERROR:', err);
    return;
  }

  // Write the binary audio content to a local file
  fs.writeFile('output.mp3', response.audioContent, 'binary', err => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }
    console.log('Audio content written to file: output.mp3');
    mp3Duration('output.mp3', function (err, duration) {
      if (err) return console.log(err.message);
      console.log('Your file is ' + duration + ' seconds long');
    });
  });
});