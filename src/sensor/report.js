import { promisify } from '../utils/utils';
// import projectConfig from '../project.config';
// import { getUserKey } from '../utils/user-key';

const CryptoJS = require('crypto-js');

const OS_TYPE_ANDROID = 0;
const OS_TYPE_IOS = 1;
const KEY = CryptoJS.enc.Utf8.parse('HAO360CN');
const IV = CryptoJS.enc.Utf8.parse('HAO360CN');


class reportBody {
    data = {
        osType: '',
        qid: '',
        openId: '',
        // userKey: getUserKey(),
        // versionName: projectConfig.version,
        // versionCode: +projectConfig.version.replace('.', ''),
        // channel: projectConfig.hyChannel
    }

    setParam(key, value) {
        this.data[key] = value;
    }

    getData() {
        return this.data;
    }
}

export const reportParams = new reportBody();
wx.getSystemInfo({ success(res) {
    let osType = /iPhone/.test(res.model) ? OS_TYPE_IOS : OS_TYPE_ANDROID;
    reportParams.setParam('osType', osType);
} });

// 事件映射
const eventRef = {
    read_chapter: 'readNovels'
}


// 上报队列
let reportTimer = null,
reportQueue = [],
reportQueueMaxLength = 9;

/**
 * 上报
 *
 * @param event
 * @param data
 */
export function report(event, data) {
    // 过滤以 $ 开头的神策事件
    if (/^\$/.test(event)) {
        return;
    }
    let dataJson = {
        eventId: eventRef[event] || event,
        time: Date.now(),
        index: '',
        sex: 0,
        data
    };
    reportQueue.push(dataJson);
    if (reportQueue.length > reportQueueMaxLength) {
        sendReportRequest();
    }
    
    if (!reportTimer) {
        setTimeout(() => {
            sendReportRequest();
        }, 2000);
    }
}

/**
 * 发起上报请求
 * @return {Promise<any | never>}
 */
export function sendReportRequest() {
    let queue = reportQueue;
    reportQueue = []; // 清空上报队列
    clearTimeout(reportTimer);
    reportTimer = null;

    if (queue.length === 0) {
        return Promise.resolve();
    }

    let json = {
        ...reportParams.getData(),
        dataJson: queue
    };
    // if (projectConfig.debug) {
    //     console.log('Debug report', json);
    // }
    let jsonString = JSON.stringify(json);

    let encrypted = CryptoJS.DES.encrypt(jsonString, KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    let dataString = encrypted.toString();
    dataString = encodeURIComponent(dataString);
    return promisify(wx.request)({
            url: `https://collect.52miniapps.com/data/c/?data=${dataString}`
        })
        .catch(err => {
            // 上报失败
            queue = [...json.dataJson, ...queue];

            console.error(err)
        });
}
