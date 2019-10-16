/**
 * Storage
 */
export default class Storage {

    /**
     *
     * @param key
     * @param data
     * @return {Promise<any>}
     */
    static set(key, data) {
        return new Promise((resolve, reject) => {
            wx.setStorage({
                key,
                data,
                success: resolve,
                fail: reject
            });
        });
    }

    /**
     *
     * @param key
     * @return {Promise<any>}
     */
    static get(key) {
        return new Promise((resolve, reject) => {
            wx.getStorage({
                key,
                success: res => {
                    resolve(res.data);
                },
                fail: reject
            });
        });
    }

    /**
     *
     * @param key
     * @return {Promise<any>}
     */
    static remove(key) {
        return new Promise((resolve, reject) => {
            wx.removeStorage({
                key,
                success: resolve,
                fail: reject
            });
        });
    }

    /**
     *
     * @return {Promise<any>}
     */
    static clear() {
        return new Promise((resolve, reject) => {
            wx.clearStorage({
                success: resolve,
                fail: reject
            });
        });
    }

}