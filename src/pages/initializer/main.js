import * as routes from '../../routes';
import { param } from '../../utils/utils';

Page({
    onLoad(opt) {
        if (getApp().globalData.initStatus !== 0) {
            this.inited(opt);
        } else {
            getApp().appEvent.listen('init', () => {
                this.inited(opt);
            })
        }
    },
    inited(params) {
        const { to, sampshare, ...other } = params;
        const url = (to && routes[to]) || routes.home;
        wx.reLaunch({
            url: `${url}?${param(other)}`
        });
    }
})

