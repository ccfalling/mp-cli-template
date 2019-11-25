const merge = require('webpack-merge');
const baseConf = require('./base.conf');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = merge(baseConf, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(),
    ]
});
