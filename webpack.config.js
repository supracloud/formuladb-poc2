const path = require('path');
const nodeExternals = require('webpack-node-externals');
// const TerserPlugin = require('terser-webpack-plugin');
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
    // optimization: {
    //     minimizer: [
    //         new TerserPlugin({
    //             sourceMap: true,
    //             cache: true,
    //         }),
    //     ],
    // },
};

configBaseNode = {
    ...configBase,
    target: "node",
    externals: [nodeExternals()],
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
    ...configBaseNode,
    entry: './tsc-out/be/src/server.js',
    output: {
        path: path.resolve(__dirname, 'dist-be'),
        filename: 'frmdb-be.js'
    },
};

configBeTools = {
    ...configBaseNode,
    entry: './tsc-out/test/src/load_test_data.js',
    output: {
        path: path.resolve(__dirname, 'dist-be'),
        filename: 'frmdb-be-load-test-data.js'
    },
};

configDataGrid = {
    ...configBaseWeb,
    entry: './tsc-out/fe/src/data-grid/data-grid.component.js',
    output: {
        path: path.resolve(__dirname, 'formuladb'),
        filename: 'frmdb-data-grid.js'
    },
};

configFe = {
    ...configBaseWeb,
    entry: './tsc-out/fe/src/fe.js',
    output: {
        path: path.resolve(__dirname, 'formuladb'),
        filename: 'frmdb-fe.js'
    },
};

configFrmdbEditor = {
    ...configBaseWeb,
    entry: './tsc-out/fe/src/frmdb-editor/frmdb-editor.component.js',
    output: {
        path: path.resolve(__dirname, 'formuladb'),
        filename: 'frmdb-editor.js'
    },
};

module.exports = [
    configBe,
    configBeTools,
    configDataGrid, 
    configFe,
    configFrmdbEditor
];
