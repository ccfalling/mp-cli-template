import { sa } from './sensorsdata.min';

/**
 * 页面访问打点
 * @param {*} url 页面url
 */
export function tackPageView(url) {
    sa.track('pageview', {
        url
    });
}


/**
 * 事件打点
 * @param {*} ctr 事件名称
 * @param {*} o 事件属性
 */
export function track(ctr, o) {
    sa.track(ctr, o);
}

/**
 * 设置用户属性
 * setOnceProfile  一次生效属性
 * setProfile  可更行属性
 */

export default sa;