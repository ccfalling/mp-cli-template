import projectConfig from '../project.config';
import { getCommonParam } from '../sensor/sensors';
import { login } from '../api/user';
import {getUserKey} from '../utils/user-key';
import { parseQueryString } from '../utils/utils';

const md5 = require('blueimp-md5');

export const STATUS_CODE_SUCCESS = 1; //成功
export const STATUS_CODE_ERROR = 0; //错误
export const STATUS_CODE_UN_LOGIN = 2; //未登录
export const STATUS_CODE_FORBIDDEN = 3; //禁止
export const STATUS_CODE_PARAM_ERROR = 4; //参数错误
export const STATUS_CODE_REPEAT = 5; //重复
export const STATUS_CODE_ALREADY_EXISTS = 6; //已存在
export const STATUS_CODE_UNAUTHORIZED = 9; //未授权
export const STATUS_CODE_NOT_EXISTS = 8; //不存在
export const STATUS_CODE_BALANCE_INSUFFICIENT = 100; // 余额不足
let isLogin = false;

// 网络状态初始化
let netWorkStatus = {
    isConnected: true
};
// 监听网络变化
wx.onNetworkStatusChange((res) => {
    netWorkStatus = res;
});

export function request(options) {
    return new Promise((resolve, reject) => {
        if (netWorkStatus.isConnected) {
            _request(options, resolve, reject);
        } else {
            reject({ msg: '网络链接异常，请检查', ...netWorkStatus });
        }
    }).then(res => {
        if (res.data.status === STATUS_CODE_UN_LOGIN && !isLogin) {
            isLogin = true;
            return login().then(() => {
                isLogin = false;
                return res
            });
        } else if (res.data && res.data.status !== STATUS_CODE_ERROR) {
            return res;
        }  else {
            throw res;
        }
    })
}

export function _request(options, resolve, reject) {
    let { url, method = 'GET', data = {} } = options;
    let session = getApp() &&  getApp().globalData.session || '';
    let queryData = getCommonParam(); // 其他页面参数
    let userKey = getUserKey()
    if (/^\//.test(url)) {
        url = `${projectConfig.serverHost}${url}`
    }
    const params = {
        session,
        userKey,
        appId: projectConfig.appid,
        version: projectConfig.version,
        interfaceCode: projectConfig.interfaceCode || 100,
        timestamp: parseInt(Date.now() / 1000),
        ...queryData,
        ...data,
    }

    // 计算签名
    const splitUrlArray = url.split('?');
    const urlParams = splitUrlArray.length > 1 ? parseQueryString(splitUrlArray[1]) : {};
    const { a, c, ...signblank } = {
        ...urlParams,
        ...params
    };
    const sign = signature(signblank, projectConfig.appid);

    wx.request({
        url,
        method,
        data: {
            ...params,
            sign
        },
        success(res) {
            resolve(res)
        },
        fail(res) {
            reject(res);
        }
    });
}


export function signature(data, appId) {
    const keys = Object.keys(data);
    const sortKeys = keys.sort();
    const paramStr = sortKeys.map(e => `${e}=${data[e]}`).join('&');
    return encodeURIComponent(md5(`${paramStr}${appId}`));
}