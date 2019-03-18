const webpack = require('webpack');

module.exports = {
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: 'dist/[file].map',
      publicPath: 'http://localhost:5050/dist/fe/',
      fileContext: 'public',
    })
  ]
};
