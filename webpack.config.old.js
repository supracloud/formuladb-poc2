const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const glob = require("glob");
const _ = require("lodash");

config = {
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist/')
    },
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            "@domain": path.resolve(__dirname, "./domain/src"),
            "@functions": path.resolve(__dirname, "./functions/src"),
            "@live-dom-template": path.resolve(__dirname, "./live-dom-template/src"),
            "@core": path.resolve(__dirname, "./core/src"),
            "@storage": path.resolve(__dirname, "./storage/src"),
        }
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    },
                    'sass-loader?sourceMap'
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
            }),
        ],
    },
    plugins: [
        // new webpack.SourceMapDevToolPlugin({
        //     filename: '[name].js.map',
        //     publicPath: 'http://localhost:8081/dist/',
        //     fileContext: 'public',
        //     moduleFilenameTemplate: '[resource-path]'
        // })
    ]
};

configNode = {
    ...config,
    target: "node",
    externals: [nodeExternals()],
}

configBeOld = {
    ...configNode,
    entry: {
        'be': ["./be/src/server.ts"],
    },
};

configBe = {
   target: "node",
   entry: './tsc-out/be/src/server.js',
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'be.js'
    }
};

configBeSpecs = {
    ...configNode,
    entry: {
        'be-specs': _([
            './live-dom-template',
            './core',
            './storage',
            './be',
        ]).chain()
            .flatMap(x => glob.sync(x + "/**/*.spec.ts"))
            .difference(["./core/src/frmdb_engine.stress.spec.ts", "./be/src/tests/example.spec.ts"])
            .value(),
    },
};

configBeStressSpecs = {
    ...configNode,
    entry: {
        'be-stress-specs': ["frmdb_engine.stress.spec.ts"],
    },
};

configBrowser = {
    ...config,
    target: "web",
};

configFeOld = {
    ...configBrowser,
    entry: {
        'fe': ["./fe2/src/fe.ts"],
    },
};


configFe = {
    target: "web",
    entry: './tsc-out/fe2/src/fe.js',
     devtool: "source-map",
     output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'be.js'
     }
};
 
configFeSpecs = {
    ...configBrowser,
    entry: {
        'fe-specs': _.flatMap([
            './fe2',
        ], x => glob.sync(x + "/**/*.spec.ts")),
    },
};

//module.exports = [configFe, configFeSpecs, configBe, configBeSpecs, configBeStressSpecs];
console.log(configBeSpecs);
module.exports = [configBe, configFe];
