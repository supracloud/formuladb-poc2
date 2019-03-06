const nodeExternals = require('webpack-node-externals');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: "node",
  entry: {
    app: ["./src/server.ts"]
  },
  output: {
      filename: './dist/be/src/server.js',
      path: __dirname
  },
  resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@core": path.resolve(__dirname, "../core/src"),
        "@storage": path.resolve(__dirname, "../storage/src"),
        "@kv_selector_base": path.resolve(__dirname, "./src")
      }
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile : 'prod.tsconfig.json'
            }
          }
        ]
      },
    ],
  },
  mode: 'production',
  // Terser plugin used by default in production mode for minimization
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: 'dist/[file].map',
      publicPath: 'http://localhost:5050/',
      fileContext: 'public'
    })
  ]
};
