import projectConfig from '../project.config';
import {getUserKey} from '../utils/user-key';
import Cache from '../globalData/cache';
import { request } from '../api/utils';
import md5 from 'blueimp-md5';
import { PubSub } from '../utils/eventHub';

export const adRef = {
    recommend: 29,
    shelf: 2,
    detail: 3,
    readerBetween: 4,
    readerBottom: 24,
    shop: 6,
    readerBetweenPage: 31,
    video: 18,
    draw: 33,
    drawVideo: 34,
    shelfBottom: 35,
    readerVideoUnlock: 37,
    readerPageBottom: 38
};

/**
 * 请求广告配置缓存
 * @param {*} pid 
 */

const PubSubEvent = new PubSub();

let adConfigRequestStack = [];
export function getAdConfig(pid, opt = { force: false }) {
    const key = `adConfig-${pid}`;
    const config = Cache.get(key);

    if (config && !opt.force) {
        return Promise.resolve(config)
    }
    if (adConfigRequestStack.includes(pid)) {
        return new Promise((resolve) => {
            PubSubEvent.listenOnce(pid, (e) => {
                resolve(e)
            })
        })
    }

    adConfigRequestStack.push(pid);
    return getConfig(pid).then(res => {
        const index = adConfigRequestStack.indexOf(pid);
        adConfigRequestStack.splice(index, 1);
        PubSubEvent.trigger(pid, res);
        Cache.set(key, res);
        return res;
    });
}

/**
 * 请求广告配置
 * @param {*} pid 
 */
export function getConfig(pid) {
    return adrequest({
        url: `/getByRealTime`,
        data: {
            a: {
                a: '',
                b: '',
                c: '',
                d: getApp().globalData.userInfo && getApp().globalData.userInfo.first_login || '1',// 新用户传1，否则0
                e: ''
            },
            b: getUserKey(),// userkey
            c: projectConfig.hyChannel,// 渠道号
            d: getApp().globalData.iPhone ? '2' : '1', // 安卓1,ios2
            e: projectConfig.adMpId, // 免费小说11，小甜文12
            f: projectConfig.version,// 小程序版本号
            g: '1.5.9',// 写死
            h: pid, //广告位置。书架2，阅读器4，推荐页29
            i: '0',// 写死
            j: {
                a: '',
                b: '',
                c: '',
                d: ''
            },
            k: ['18'],// 写死
            l: ''
        }
    }).then((res) => {
        return res.data.data && JSON.parse(res.data.data)[0]
    }).catch((err) => {
        console.log('getConfig err: ', err)
    })
}

/**
 * 查询免广告剩余时间
 */
export function getAdVideoExpire() {
    return request({
        url: '/index.php',
        data: {
            c: 'WxmpUser',
            a: 'getAdVideoExpire',
            channel: projectConfig.hyChannel,
            userKey: getUserKey(),
            version: projectConfig.version
        },
    })
}

/**
 * 事件上报
 * @param {*} event 
 * @param {*} adConfig 
 * @param {*} num 
 */
export function eventReport(event, adConfig, num = 1) {
    let array = []
    for(let i = 0; i < num; i++) {
        array.push(getReportParams(event, adConfig))
    }
    return sendReportRequest(array)
}

/**
 * 延时上报时间
 */
let array = []
let timer
export function eventReportPerSecond(event, adConfig) { // 广告显示1秒报一次，避免同时展示多个广告时，同时上报太多个请求后台说扛不住。
    array.push(getReportParams(event, adConfig))
    if (!timer && array.length > 0) {
        timer = setSendReportRequestTimer()
    }
}

/**
 * 视频解锁
 * @param {*} adSign 当前章节数
 * @param {*} type  解锁类型 1：视频解锁、2：分享解锁
 */
export function unlockChapter(adSign, type = 1) {
    return request({
        url: '/index.php',
        data: {
            c: 'WxmpAd',
            a: 'unlockChapter',
            adSign,
            type
        },
    });
}

/**
 * 生成上报事件参数
 * @param {*} event 
 * @param {*} adConfig 
 */
function getReportParams(event, adConfig) {
    return {
        a: getRandomNum(), // 随机值 1-999
        b: adConfig.adId,  // 这个是getByRealTime 下发的adId的值，获取不到写0
        c: '18', // 广告源, 写死18
        d: getRandomNum(), // 随机值 1-999
        e: getRandomNum(), // 随机值 1-999
        f: getReportId(), // 上报的id，随便生成一个数，建议mp前缀+时间戳+加随机值
        g: event, // 事件,展示1，点击2,
        h: parseInt(new Date().getTime() / 1000).toString(), // 当前时间戳, (精确到秒)
        i: "", // 这个是getByRealTime 下发的extraData的值，获取不到写""
        j: adConfig.pid, // 广告位, 2书架，4阅读器，29 推荐页
        k: adConfig.errorCode || '', // 错误码，如果能获取到广告出错的错误码系则填写，否则填""
        l: '', // 错误信息，如果能获取到广告出错的信息则填写，否则填""
        m: '', // 填""
        n: adConfig.id // 第三方广告id，非必须，如果能获取到第三方的广告id则填写，否则填""
    }
}

/**
 * 延时上报计时器
 */
function setSendReportRequestTimer() {
    return setTimeout(() => {
        sendReportRequest(array)
        array = []
        timer = undefined
    }, 1000)
}

/**
 * 上报请求
 * @param {*} array 
 */
function sendReportRequest(array) {
    return adrequest({
        url: `/report`,
        data: {
            a: {
                a: {
                    a: '',
                    b: '',
                    c: '',
                    d: getApp().globalData.userInfo && getApp().globalData.userInfo.first_login || 1, // 新用户传1，否则0
                    e: getApp().globalData.session // 用户session
                },
                b: getUserKey(),// userkey
                c: projectConfig.hyChannel,// 渠道号
                d: getApp().globalData.iPhone ? '2' : '1', // 安卓1,ios2
                e: projectConfig.adMpId, // 免费小说11，小甜文12
                f: projectConfig.version,// 小程序版本号
                g: '1.5.9',// 写死
                h: "0", // 写死0
                j: getApp().globalData.openid /*openid */,
            },
            b: array
        }
    })
}

/**
 * 广告平台请求工具类
 * @param {*} options 
 * @param {*} resolve 
 * @param {*} reject 
 */
function adrequest(options) {
    return new Promise((resolve, reject) => {
        let { url, data } = options;
        url = `https://adapi.yipinread.com${url}`
        let md5str = md5(JSON.stringify(data) + 'c73d26b7a3f939473382d6e5c3ffd980')
        wx.request({
            url,
            method: 'POST',
            header: {
                'content-type': 'application/json',
                'SIGN': md5str
            },
            data: data,
            success(res) {
                resolve(res)
            },
            fail(res) {
                reject(res);
            }
        });
    })
}

function getRandomNum() {   // 获取随机值 1-999
    let num = Math.floor(Math.random() * 1000)
    return num === 0 ? 1 : num
}
function getReportId() { // 上报的id，随便生成一个数，建议mp前缀+时间戳+加随机值
    return 'mp' + new Date().getTime() + getRandomNum()
}