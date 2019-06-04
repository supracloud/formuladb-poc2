const path = require('path');
const nodeExternals = require('webpack-node-externals');
const npm_package = require('./package.json');
const _ = require("lodash");

module.exports = {
    entry: './tsc-out/be/src/server.js',
    target: "node",
    externals: [nodeExternals()],
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'be.js'
    },
    resolve: {
        alias: _.mapValues(npm_package._moduleAliases || {},
            v => path.resolve(__dirname, v)),
    }
};
