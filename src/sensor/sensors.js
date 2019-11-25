import { sa } from './sensorsdata.min';
import { param } from '../utils/utils';
// import { formatTime } from '../utils/util';

/**
 * 将onLaunch(options)的参数转换成对象
 * 示例：
 * {
 *   path: "pages/bookShop/main"
 *   scene: 1037
 *   shareTicket: "da9ec1fa-9294-434d-bbe5-33c19fd82693"
 *   referrerAppId: "123" // 来源小程序id
 *   extraData: "{"test":1}"  // 来源小程序数据
 * }
 */
export function getCommonParam() {
    let data = {
        ...getBaseInfo(),
        ...getRefererInfo()
    };

    // 删除无用的字段
    for (let key in data) {
        if (data[key] === '') {
            delete data[key];
        }
    }

    return data;
}

/**
 * 获取基本参数
 * @return {{path: string, scene: number, shareTicket: string}}
 */
function getBaseInfo() {
    let { path = '', scene = 0, shareTicket = '' } = wx.getLaunchOptionsSync();

    return {
        path,
        scene,
        shareTicket
    };
}

/**
 * 保存渠道信息
 * @type {string}
 */
const KEY_CHANNEL = 'channel';

let channel;
try {
    channel = wx.getStorageSync(KEY_CHANNEL);
}
catch (e) {}

/**
 * 获取 Query 信息
 */
export function getQueryInfo() {
    let { scene = '', ch = '', sch = '', pos = '', ...other } = wx.getLaunchOptionsSync().query;

    if (channel) {
        ({ ch , sch } = channel);
    }
    else {
        if (ch || sch) {
            channel = {
                ch,
                sch
            };
            wx.setStorageSync(KEY_CHANNEL, channel);
        }
    }

    // const first_visit_time0 = formatTime();

    let info = {
        query: param(other),
        ch,
        sch,
        pos,
        // first_visit_time0
    };

    if (scene) {
        info = {
            ...info,
            ...parseQueryString(decodeURIComponent(scene))
        };
    }

    return info;
}

/**
 * 获取 Referrer 信息
 */
function getRefererInfo() {
    let info = {};

    let referrerInfo = wx.getLaunchOptionsSync().referrerInfo;

    if (referrerInfo && referrerInfo.appId) {
        info.referrerAppId = referrerInfo.appId;

        let { extraData } = referrerInfo;
        if (typeof(extraData) === 'object') {
            extraData = JSON.stringify(extraData);
        }

        info.extraData = extraData;
    }

    return info;
}

export default sa;