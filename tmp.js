const assert = require('assert');
const generate = require('csv-generate');
const parse = require('csv-parse');
const fs = require('fs');

(async () => {
    let csvRawStream = fs.createReadStream(`git/formuladb-env/db/troom.csv`);

  // Initialise the parser by generating random records
  const parser = csvRawStream.pipe(
    parse({columns: true})
  )
  // Intialise count
  let count = 0;
  // Report start
  process.stdout.write('start\n')
  // Iterate through each records
  for await (const record of parser) {
    // Report current line
    console.log(record);
    // Fake asynchronous operation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  // Report end
  process.stdout.write('...done\n')
})()