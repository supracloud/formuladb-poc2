const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const fs = require('fs');

let html = fs.readFileSync('/dev/stdin').toString();
var doc = new DOMParser().parseFromString(html, 'text/html');
var result = new XMLSerializer().serializeToString(doc);
console.log(result);