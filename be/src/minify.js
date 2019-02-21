const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

minify({
  compressor: terser,
  input: './dist/server-ts.js',
  output: './dist/server.js',
  options: {
    warnings: true, // pass true to display compressor warnings.
    mangle: true,
    sourceMap: {
      filename: "server.js",
      content: "inline",
      url: "./dist/server.js.map"
    }
  }
}).then((min) => {
  console.log("minified!");
}).catch((err) => {
  console.log(err);
})
