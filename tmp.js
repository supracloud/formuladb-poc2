// const assert = require('assert');
// const generate = require('csv-generate');
// const parse = require('csv-parse');
// const fs = require('fs');

// (async () => {
//     let csvRawStream = fs.createReadStream(`git/formuladb-env/db/t_dictionary.csv`);

//   // Initialise the parser by generating random records
//   const parser = csvRawStream.pipe(
//     parse({columns: true, escape: '\\'})
//   )
//   // Intialise count
//   let count = 0;
//   // Report start
//   process.stdout.write('start\n')
//   // Iterate through each records
//   for await (const record of parser) {
//     // Report current line
//     console.log(record);
//     // Fake asynchronous operation
//     await new Promise((resolve) => setTimeout(resolve, 100))
//   }
//   // Report end
//   process.stdout.write('...done\n')
// })()





const Base58 = require("base58");
const NODE_ID = 1;
let IndexPerMs = 0;
let CurrentMs = new Date().getTime();
function generateShortUID() {
    let newMs = new Date().getTime();
    if (CurrentMs === newMs) IndexPerMs = IndexPerMs + 1;
    else { IndexPerMs = 0; CurrentMs = newMs; }
    return Base58.int_to_base58(CurrentMs) + Base58.int_to_base58(NODE_ID * 1000 + IndexPerMs);
}
let a=[];
for (let i = 0; i < 100000; i++) {a.push(generateShortUID())} 
for (let i of a) { console.log(i) }