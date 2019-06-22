var sm = require('source-map');
var fs = require('fs');

if (process.argv.length !== 5) {
	  console.log('Usage: node ' + process.argv[1] + ' source.map.js lineNo colNo');
	  process.exit(1);
}

var sourceMapFile = process.argv[2];
var line = parseInt(process.argv[3]);
var col = parseInt(process.argv[4]);

var sourceMap = JSON.parse(fs.readFileSync(sourceMapFile));
sm.SourceMapConsumer.with(sourceMap, null, function(consumer) {
	  console.log(consumer.originalPositionFor({line: line, column: col}));
});

