require('./sensor/app');

//app.js
App({
  onLaunch: function () {
    // 登录
    qq.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {

  }
})
