global.eval = () => {};

import { sa } from './sensorsdata.min';
import { getCommonParam, getQueryInfo } from './sensors';
import { report, sendReportRequest } from './report';
// import dataStorage from '../globalData/data_storage';
// import { formatTime } from '../utils/utils';
// import {getUserKey} from "../utils/user-key";
// import projectConfig from '../project.config';
// import {wxScene, qqScene} from '../utils/scene';

sa.init();

const _track = sa.track;

sa.track = function (e, d) {
    report(e, d); // 华阅打点
    _track.apply(this, arguments);
};
const _App = App;
let startTime = 0;

App = function (app) {
    let self = {
        ...app,

        onLaunch(options) {
            // getApp Fixed
            let _getApp = getApp;

            getApp = () => {
                return _getApp() || self;
            };

            // wx.getLaunchOptionsSync Fixed
            if (!wx.getLaunchOptionsSync) {
                wx.getLaunchOptionsSync = () => options;
            }

            // let userKey = getUserKey();
            // 注册打点通用属性
            sa.registerApp({
                // appId: projectConfig.appid,
                // version: projectConfig.version,
                // userKey,
                ...getCommonParam(),
            });

            // 采集appShow
            sa.para.autoTrack.appShow = function() {
                const query = options.query;
                startTime = Date.now();
                // let source = wxScene(options.scene);
                // if (typeof qq !== 'undefined') {
                //     source = qqScene(options.scene);
                // }
                report('AppStart', {
                    // from: source,
                    // appId: projectConfig.appid,
                    // version: projectConfig.version,
                    ...query
                });
                return { ...query }
            }

            // 采集appHide数据
            sa.para.autoTrack.appHide = function() {
                report('AppClose', {
                    length: Math.ceil((Date.now() - startTime) / 60000)
                });
            }

            // 采集pageShow数据
            sa.para.autoTrack.pageShow = function() {
                const pages = getCurrentPages();    //获取加载的页面
                const currentPage = pages[pages.length - 1];    //获取当前页面的对象
                const url = currentPage.route;    //当前页面url
                // const options = currentPage.options;
                const rpOpts = Object.assign({
                    name: url, 
                });
                report('pv', rpOpts);
            }

            // Run onLaunch
            if (app.onLaunch) {
                app.onLaunch.apply(this, arguments);
            }

            const { ch, sch, pos, ...otherQuery } = getQueryInfo();
            let onceData = Object.assign({}, otherQuery);
            if (ch) onceData.first_ch = ch;
            if (sch) onceData.first_sch = sch;
            if (pos) onceData.first_pos = pos;
            sa.setOnceProfile(onceData);
        },
        onShow() {
            if (app.onShow) {
                app.onShow.apply(this, arguments);
            }
            sa.setProfile({ is_login: this.globalData.session ? true : false });
        },

        onHide() {
            if (app.onHide) {
                app.onHide.apply(this, arguments);
            }

            // 小程序退出时，立刻上报
            sendReportRequest();
        }
    };

    return _App(self);
};

