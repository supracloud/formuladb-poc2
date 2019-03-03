const nodeExternals = require('webpack-node-externals');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node",
  entry: {
    app: ["./src/server.ts"]
  },
  output: {
      filename: './dist/server.js',
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
        use: 'ts-loader',
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
  devtool: 'source-map'
};
