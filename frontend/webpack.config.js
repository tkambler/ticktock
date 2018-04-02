'use strict';

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
    'entry': {
        'app': 'app',
        'boot': 'boot',
        'config': 'config',
        'components': 'components',
        'directives': 'directives',
        'services': 'services',
        'states': 'states',
    },
    'devtool': 'inline-source-map',
    'watchOptions': {
        'ignored': /node_modules/
    },
    'output': {
        'path': path.resolve(__dirname, 'public/js'),
        'filename': '[name].bundle.js'
    },
    'resolve': {
        'modules': [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'scss'),
            path.resolve(__dirname, 'vendor'),
            path.resolve(__dirname, 'node_modules')
        ]
    },
    'externals': [
        {
            'angular': 'angular',
            'bluebird': 'Promise'
        }
    ],
    'plugins': [
        new webpack.optimize.CommonsChunkPlugin({
            'name': 'common'
        })
    ],
    'module': {
        'rules': [
            
            {
                'test': /\.js$/,
                'exclude': /node_modules/,
                'use': [
                    {
                        'loader': 'babel-loader',
                        'options': {
                            'presets': ['env'],
                            'plugins': ['transform-class-properties']
                        }
                    }
                ]
            },
            {
                'test': /\.json5$/,
                'use': 'json5-loader'
            },
            {
                'test': /\.html$/,
                'use': {
                    'loader': 'html-loader',
                    'options': {
                        'attrs': false
                    }
                }
            },
            {
                'test': /\.txt$/,
                'use': 'raw-loader'
            },
            {
                'test': /\.css/,
                'use': [
                    {
                        'loader': 'css-loader'
                    }
                ]
            },
            {
                'test': /\.scss$/,
                'use': [
                    {
                        'loader': 'style-loader'
                    },
                    {
                        'loader': 'css-loader'
                    },
                    {
                        'loader': 'sass-loader'
                    }
                ]
            }
        ]
    }
};

module.exports = config;

// if (process.env.NODE_ENV === 'production') {
//     config.plugins.push(
//         new UglifyJsPlugin({
//             'uglifyOptions': {
//                 'mangle': false
//             }
//         })
//     );
// }