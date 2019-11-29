const merge = require('webpack-merge');
const baseConf = require('./base.conf');
const path = require('path');
const fs = require('fs');

let pages = {}, components = {}, mpRoot, entryOption = {};
analyzeMPFile();
registerModuleEntry();

function analyzeMPFile() {
    const entry = path.resolve(baseConf.context, baseConf.entry['app.js']);
    mpRoot = path.dirname(entry);
    const appJsonPath = path.resolve(mpRoot, 'app.json');
    const appConfig = getJson(appJsonPath);
    // 热更新无法读取app.json 原因未找到
    if (!appConfig) {
        console.warn('app.json is not defind');
        return;
    }
    // 分析页面依赖
    appConfig.pages.forEach(e => {
        pages[e] = e;
    })
    if (appConfig.subpackages) {
        appConfig.subpackages.forEach(item => {
            item.pages.forEach(e => {
                const subPage = `${item.root}/${e}`;
                pages[subPage] = subPage;
            })
        });
    }
    // 分析组件依赖
    Object.keys(pages).forEach(e => {
        const pagePath = path.resolve(mpRoot, e);
        analyzeComponentRelation(pagePath);
    });
}

function analyzeComponentRelation(filePath) {
    const json = getJson(`${filePath}.json`);
    if (json.usingComponents) {
        Object.keys(json.usingComponents).forEach(comp => {
            const compPath = json.usingComponents[comp];
            const fullPath = path.resolve(filePath, '../', compPath);
            const relativePath = path.relative(mpRoot, fullPath);
            if (!components[relativePath]) {
                components[relativePath] = relativePath;
                analyzeComponentRelation(fullPath);
            }
        })
    }
}

function getJson(path) {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (ex) {
        return null;
    }
}

function registerModuleEntry() {
    Object.keys(pages).forEach(e => {
        const file = `${e}.js`
        entryOption[file] = `./${file}`;
    });

    Object.keys(components).forEach(e => {
        const file = `${e}.js`
        entryOption[file] = `./${file}`;
    })
}


module.exports = merge(baseConf, {
    mode: 'development',
    devtool: 'cheap-source-map',
    entry: entryOption
});