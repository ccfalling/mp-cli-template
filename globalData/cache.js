export default class Cache {

    /**
     *
     * @param key
     * @param value
     */
    static set(key, value) {
        let { globalData } = getApp();

        if (!('cache' in globalData)) {
            globalData.cache = {};
        }

        globalData.cache[key] = value;
    }

    /**
     *
     * @param key
     * @return {*}
     */
    static get(key) {
        let { globalData } = getApp();

        if (!('cache' in globalData)) {
            globalData.cache = {};
        }

        return globalData.cache[key];
    }

    /**
     *
     * @param key
     */
    static remove(key) {
        let { globalData } = getApp();

        if (!('cache' in globalData)) {
            globalData.cache = {};
        }

        delete globalData.cache[key];
    }

    /**
     *
     */
    static clear() {
        let { globalData } = getApp();

        globalData.cache = {};
    }
}