const merge = require('webpack-merge');
const baseConf = require('./base.conf');
const MpBuildPlugin = require('./mp-build-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = merge(baseConf, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(),
        new MpBuildPlugin(),
    ]
});
