const path = require('path');
const fs = require('fs');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const ConcatSource = require('webpack-sources').ConcatSource;
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
        this.pages = [];
        this.components = [];
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('MpBuildPlugin', (compilation) => {
            this.analyzeMPFile(compiler);
            this.registerModuleEntry(compiler);
            this.registerAssets(compiler);
            // this.registerModuleTemplate(compilation);
            // this.registerNormalModuleLoader(compilation);
        })
    }

    analyzeMPFile(compiler) {
        const appEntry = typeof compiler.options.entry === 'string' ? compiler.options.entry : compiler.options.entry.pop();
        // 热更新时无入口不进行下一步
        if(!appEntry) {
            return;
        }
        const entry = path.resolve(compiler.options.context, appEntry);
        this.mpRoot = path.dirname(entry);
        const appJsonPath = path.resolve(this.mpRoot, 'app.json');
        const appConfig = this.getJson(appJsonPath);
        // 热更新无法读取app.json 原因未找到
        if (!appConfig) {
            console.warn('app.json is not defind')
            return;
        }
        // 分析页面依赖
        this.pages = this.pages.concat(appConfig.pages);
        if (appConfig.subpackages) {
            appConfig.subpackages.forEach(item => {
                item.pages.forEach(e => {
                    this.pages.push(`${item.root}/${e}`);
                })
            });
        }
        // 分析组件依赖
        this.pages.forEach(e => {
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
                if (this.components.indexOf(relativePath) < 0) {
                    this.components.push(relativePath);
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
        this.pages.forEach(e => {
            this.addSingleEntry(compiler, 'app.js');
        });
        this.pages.forEach(e => {
            this.addSingleEntry(compiler, `${e}.js`);
        });

        this.components.forEach(e => {
            this.addSingleEntry(compiler, `${e}.js`);
        })
    }

    addSingleEntry(compiler, entry) {
        compiler.hooks.make.tap('MpBuildPlugin', (compilation) => {
            const base = this.mpRoot;
            const dep = SingleEntryPlugin.createDependency(path.resolve(base, entry), entry);
            compilation.addEntry(base, dep, entry, () => {});
        });
    }

    registerAssets(compiler) {
        compiler.hooks.emit.tap('emit', function (compilation) {
            delete compilation.assets.main;
        })
    }

    /**
     * 自定义webpack ModuleTemplate.render 
     * 改成打包目标文件保留原生nodejs风格
     */
    registerModuleTemplate(compilation) {
        compilation.mainTemplate.hooks.render.tap('MpBuildPlugin', (bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
            const source = new ConcatSource()
            chunk.modulesIterable.forEach((module) => {
                let moduleSource = null
                moduleSource = module.source(dependencyTemplates, moduleTemplate.outputOptions, moduleTemplate.requestShortener)
                this.replacement(moduleSource);
                source.add(moduleSource)
            })
            return source
        })
    }
  
  
    /**
     * 替换 __webpack_require
     */
    replacement(moduleSource) {
        const replacements = moduleSource.replacements || [];
        replacements.forEach(function (rep) {
            let v = rep[2] || "";
            const isVar = v.indexOf("WEBPACK VAR INJECTION") > -1;
            v = isVar ? "" : v.replace(/__webpack_require__/g, 'require');
            if (v.indexOf("AMD") > -1) {
                v = "";
            }
            rep[2] = v;
        })
    }

    /**
     * 注册normal module loader
     */
    registerNormalModuleLoader(compilation) {
        compilation.hooks.normalModuleLoader.tap("MpBuildPlugin", function (loaderContext, module) {
            const exec = loaderContext.exec.bind(loaderContext)
            loaderContext.exec = function (code, filename) {
                return exec(code, filename.split('!').pop());
            }
        });
    }
}

module.exports = MpBuildPlugin;