import Storage from './storage';

export default class DataStorage {
    /**
     *
     * @param key
     * @return {*}
     */
    static get(key) {
        let { globalData } = getApp();

        if (key in globalData) {
            let value = globalData[key];
            return value === undefined ? Promise.reject() : Promise.resolve(value);
        }
        else {
            return Storage
                .get(key)
                .then(value => {
                    globalData[key] = value;
                    return value;
                })
                .catch(() => {
                    globalData[key] = undefined;
                    return Promise.reject();
                });
        }
    }

    /**
     *
     * @param key
     * @param value
     * @return {Promise<any | never>}
     */
    static set(key, value) {
        let { globalData } = getApp();

        if (value === undefined) {
            value = null;
        }
        globalData[key] = value;

        return Storage
            .set(key, value)

    }
}