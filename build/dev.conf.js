const merge = require('webpack-merge');
const baseConf = require('./base.conf');
const path = require('path');


module.exports = merge(baseConf, {
    mode: 'development',
    devtool: 'cheap-source-map',
    devServer: {
        // contentBase: './',
        // port: 3001,
        // publicPath: 'dist',
        // hot: true,
        writeToDisk: true
    },
});