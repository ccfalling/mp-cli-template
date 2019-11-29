const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const src = path.resolve(__dirname, '../src');

module.exports = {
    // target: 'node',
    entry: {
        'app.js': './app.js',
    },
    context: src,
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: '[name]'
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: src,
            // exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-modules-commonjs', '@babel/plugin-proposal-class-properties']
                }
            }
        }, {
            test: /\.styl$/,
            include: src,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].wxss',
                },
            }, {
                loader: 'stylus-loader'
            },]
        }, {
            test: /\.wxml$/,
            include: src,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    useRelativePath: true,
                    context: src
                }
            }, {
                loader: 'wxml-loader',
                options: {
                    root: src,
                    enforceRelativePath: true
                }
            }]
        }, {
            test: /\.(wxss|sass)$/,
            include: src,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].wxss',
                },
            }, {
                loader: 'sass-loader',
            }],
        }, {
            test: /\.(png|jpg|jpeg|gif|webp|bmp|ico|jpeg)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }]
        }]
    },
    resolve: {
        extensions: [".js", ".json"],
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 6,
            maxInitialRequests: 4,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new CopyPlugin([
            {
                from: { glob: './**/*', dot: true },
                ignore: [
                    'node_modules/**',
                    'package-lock.json',
                    '.git/**',
                    '.DS_Store',
                    '.gitignore',
                    'dist/**',
                    '*.js'
                ]
            }
        ]),
    ],
}