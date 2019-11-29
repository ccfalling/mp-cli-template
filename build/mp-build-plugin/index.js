const path = require('path');
const fs = require('fs');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
// const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const AMDPlugin = require('webpack/lib/dependencies/AMDPlugin.js')
const HarmonyDetectionParserPlugin = require("webpack/lib/dependencies/HarmonyDetectionParserPlugin")

//取消AMD模式
AMDPlugin.prototype.apply = function () {

}
HarmonyDetectionParserPlugin.prototype.apply = function () {

}

class MpBuildPlugin {
    constructor() {
        this.mpRoot = '';
        this.pages = {};
        this.components = {};
        this.entrys =  {};
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('MpBuildPlugin', (compilation) => {
            this.mpRoot = '';
            this.pages = {};
            this.components = {};
            this.analyzeMPFile(compiler);
            this.registerModuleEntry(compiler);
        });

    }

    analyzeMPFile(compiler) {
        let appEntry = compiler.options.entry;
        for (let item in appEntry) {
            if (item.includes('app.js')) {
                appEntry = appEntry[item];
            }
        }
        
        // webpack-dev-server兼容
        if (Array.isArray(appEntry)) {
            appEntry.forEach(e => {
                if (e.includes('app.js')) {
                    appEntry = e;
                }
            })
        }
        if(!appEntry) {
            return;
        }
        const entry = path.resolve(compiler.options.context, appEntry);
        this.mpRoot = path.dirname(entry);
        const appJsonPath = path.resolve(this.mpRoot, 'app.json');
        const appConfig = this.getJson(appJsonPath);
        // 热更新无法读取app.json 原因未找到
        if (!appConfig) {
            console.warn('app.json is not defind');
            return;
        }
        // 分析页面依赖
        appConfig.pages.forEach(e => {
            this.pages[e] = e;
        })
        if (appConfig.subpackages) {
            appConfig.subpackages.forEach(item => {
                item.pages.forEach(e => {
                    const subPage = `${item.root}/${e}`;
                    this.pages[subPage] = subPage;
                })
            });
        }
        // 分析组件依赖
        Object.keys(this.pages).forEach(e => {
            const pagePath = path.resolve(this.mpRoot, e);
            this.analyzeComponentRelation(pagePath);
        });
    }

    analyzeComponentRelation(filePath) {
        const json = this.getJson(`${filePath}.json`);
        if (json.usingComponents) {
            Object.keys(json.usingComponents).forEach(comp => {
                const compPath = json.usingComponents[comp];
                const fullPath = path.resolve(filePath, '../', compPath);
                const relativePath = path.relative(this.mpRoot, fullPath);
                if (!this.components[relativePath]) {
                    this.components[relativePath] = relativePath;
                    this.analyzeComponentRelation(fullPath);
                }
            })
        }
    }

    getJson(path) {
        try {
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        } catch (ex) {
            return null;
        }
    }

    registerModuleEntry(compiler) {
        Object.keys(this.pages).forEach(e => {
            const entry = `${e}.js`;
            this.addSingleEntry(compiler, entry);
        });

        Object.keys(this.components).forEach(e => {
            const entry = `${e}.js`;
            this.addSingleEntry(compiler, entry);
        })
    }

    addSingleEntry(compiler, entry) {
        compiler.hooks.make.tap('MpBuildPlugin', (compilation) => {
            const base = this.mpRoot;
            const entryFilePath = path.resolve(base, entry);
            if (fs.existsSync(entryFilePath) && !this.entrys[entry]) {
                this.entrys[entry] = true;

                const dep = SingleEntryPlugin.createDependency(entryFilePath, entry);
                compilation.addEntry(base, dep, entry, () => {
                });
            }
        })
    }
}

module.exports = MpBuildPlugin;