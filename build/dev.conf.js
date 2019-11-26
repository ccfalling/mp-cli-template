const merge = require('webpack-merge');
const baseConf = require('./base.conf');


module.exports = merge(baseConf, {
    mode: 'development',
    devtool: 'cheap-source-map',
    devServer: {
        port: 3001,
        hot: true,
        writeToDisk: true
    },
});