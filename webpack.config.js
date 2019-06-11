const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
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
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                cache: true,
            }),
        ],
    },
};

configBaseNode = {
    ...configBase,
    target: "node",
    // externals: [nodeExternals()],
}

configBaseWeb = {
    ...configBase,
    target: "web",
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
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'frmdb-be.js'
    },
};

configDataGrid = {
    ...configBase,
    entry: './tsc-out/fe/src/data-grid/data-grid.component.js',
    target: "web",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'frmdb-data-grid.js'
    },
};

configFe = {
    ...configBase,
    entry: './tsc-out/fe/src/fe.js',
    target: "web",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'frmdb-fe.js'
    },
};

module.exports = [configBe, configDataGrid, configFe];
