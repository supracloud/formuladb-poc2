const path = require('path');
const nodeExternals = require('webpack-node-externals');
const npm_package = require('./package.json');
const _ = require("lodash");

configBase = {
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            }
        ]
    },
    resolve: {
        alias: _.mapValues(npm_package._moduleAliases || {},
            v => path.resolve(__dirname, v)),
    }
};

configBaseNode = {
    ...configBase,
    target: "node",
    externals: [nodeExternals()],
}

configBaseWeb = {
    ...configBase,
    target: "web",
    externals: [nodeExternals()],
    module: {
        ...configBase.module,
        rules: [
            ...configBase.module.rules,
            {
                test: /\.scss$/,
                use: [
                    "css-loader", 
                    "sass-loader",
                ],
            },
        ]        
    },    
}

configBe = {
    ...configBase,
    entry: './tsc-out/be/src/server.js',
    target: "node",
    externals: [nodeExternals()],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'be.js'
    },
};

configDataGrid = {
    ...configBase,
    entry: './tsc-out/data-grid/src/data-grid.component.js',
    target: "web",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'frmdb-data-grid.js'
    },
};

module.exports = [configBe, configDataGrid];
