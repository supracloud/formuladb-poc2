const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

config = {
    entry: {
        'live-dom-app': ['./src/live-dom-app.ts'],
        'jasmine': ['./src/jasmine.ts'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist/')
    },
    devServer: {
        contentBase: path.join(__dirname, ''),
        compress: true,
        port: 8081
    },    
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            "@live-dom-template": path.resolve(__dirname, "../live-dom-template/src"),
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
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            publicPath: 'http://localhost:8081/dist/',
            fileContext: 'public',
            moduleFilenameTemplate: '[resource-path]'
        })
    ]
};

module.exports = config;
