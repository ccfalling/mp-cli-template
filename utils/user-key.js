import projectConfig from '../project.config';

const md5 = require('blueimp-md5');

let  userKey
export function getUserKey() {
    if (userKey) {
        return userKey
    }
    try {
        userKey = wx.getStorageSync('userKey')
        if (!userKey) {
            userKey = makeUserKey()
        }
        return userKey
    }
    catch(e) {
        return makeUserKey()
    }
}
function makeUserKey() {
    let systemInfo = wx.getSystemInfoSync();
    userKey = md5(systemInfo.brand + systemInfo.model + systemInfo.pixelRatio + projectConfig.appid + Date.now() + 'mp').toUpperCase();
    wx.setStorageSync('userKey', userKey);
    return userKey;
}