import { request } from "../api/utils";

export default class Cleaner {
    constructor(obj) {
        const filtData = Cleaner.filterData(obj, this.props)
        Object.keys(filtData).forEach(item => {
            this[item] = filtData[item]
        })
    }
    /**
    * @description 生成子类
    * @param {object} options - 参数对象
    * @param {object} options.props - 过滤条件
    * @param {string} options.url - 请求使用的url
    * @param {string} options.urlRoot - 请求使用的urlroot
    * @param {string} options.mainIndex - 用来判断请求是否存在cache的属性
    * @return {object} NewCleaner - 扩展的子类
    */
    static extend(options) { // 静态方法 生成子类
        class NewCleaner extends Cleaner{
            constructor(obj) {
                super(obj)
            }
        }
        Object.assign(NewCleaner.prototype, Cleaner.deepCopy(options))
        Object.assign(NewCleaner, Cleaner.deepCopy(options))
        return NewCleaner
    }
    /**
    * @description 深拷贝
    * @param {object} obj - 拷贝的原对象
    * @param {array} cache - 拷贝时储存的已拷贝对象，使用时无需传值
    * @return {object} copy - 拷贝得到的对象
    */
    static deepCopy(obj, cache) { // 静态方法 深拷贝
        if (!cache) cache = []
        
        if (obj === null || typeof obj !== 'object') return obj
        
        const hit = cache.some(item => item.original === obj)
        if (hit) return hit.copy // 环状结构直接返回之前的copy
        
        const copy = Array.isArray(obj) ? [] : {}
        cache.push({
            original: obj,
            copy: copy,
        })
        
        Object.keys(obj).forEach(key => {
            copy[key] = Cleaner.deepCopy(obj[key], cache)
        })

        return copy
    }
    /**
    * @description 过滤数据
    * @param {object} obj - 过滤的原对象
    * @param {objcet} props - 过滤的条件
    * @return {object} copy - 过滤得到的对象
    */
    static filterData(obj, props) { // 过滤数据
        const res = {}
        if (props instanceof Array) {
            return obj.map(item => {
                if (item instanceof Object) {
                    return Cleaner.filterData(item, props[0])
                } else {
                    const propList = props[0].split(',')
                    if (propList.includes(typeof item)) {
                        return item
                    } else {
                        throw `TypeError: typeof ${obj[item]} is not ${props[item]}`
                    }
                }
            })
        } else {
            Object.keys(props).forEach(item => {
                if (obj.hasOwnProperty(item)) {
                    if (obj[item] instanceof Object) {
                        // res[item] = props[item].filterData(obj[item], props[item].props)
                        res[item] = Cleaner.filterData(obj[item], props[item].props || props[item])
                    } else {
                        const propList = props[item].split(',')
                        if (propList.includes(typeof obj[item])) {
                            res[item] = obj[item]
                        } else {
                            throw `TypeError: typeof ${obj[item]} is not ${props[item]}`
                        }
                    }
                }
            })
        }
        return res
    }
    /**
    * @description 比较对象间的差异
    * @param {object} target - 目标比较对象
    * @param {objcet} data - 被比较的对象
    * @return {boolean} 对象是否相同
    */
    static diff(target, data) { // 静态方法 比较对象间的差异
        const tKeyList = Object.keys(target),
            dKeyList = Object.keys(data)
        const keyList = Array.from(new Set([...tKeyList, ...dKeyList]))
        
        if (keyList.every(item => dKeyList.includes(item) && tKeyList.includes(item))) {
            return tKeyList.every(item => {
                console.log(target[item], data[item])
                if (target[item] === data[item]) {
                    return true
                } else if (typeof target[item] === 'object' || typeof data[item] === 'object') {
                    return Cleaner.diff(target[item], data[item])
                } else {
                    return false
                }
            })
        }
        return false
    }
    /**
    * @description 保存和提取请求的cache
    * @param {object} options - 目标比较对象
    * @param {objcet} data - 被比较的对象
    * @return {objcet|boolean} cache - 保存时返回保存的所有cache，提取成功时返回对应的cache，失败时返回false
    */
    cache(options, data) {
        if (data == void 0) {
            if (Cleaner.cache && Cleaner.cache.length > 0) {
                if (this.mainIndex && options.data[this.mainIndex]) {
                    const cacheData = Cleaner.cache.filter(item => item.options.url === options.url && item.options.method === options.method && item.options.data[this.mainIndex] === options.data[this.mainIndex])
                    return cacheData[0] && cacheData[0].data
                } else {
                    const cacheData = Cleaner.cache.filter(item => Cleaner.diff(item.options, options))
                    return cacheData[0] && cacheData[0].data
                }
            }
            return false
        } else {
            Cleaner.cache || (Cleaner.cache = [])
            Cleaner.cache.push({
                options,
                data
            })
            return Cleaner.cache
        }
    }
    /**
    * @description 保存新的请求参数
    * @param {objcet} data - 保存的参数，只需保存变化的参数
    */
    save(data) {
        const filtData = Cleaner.filterData(Object.assign(Cleaner.deepCopy(this), data), this.props)
        Object.keys(filtData).forEach(item => {
            this[item] = filtData[item]
        })
    }
    /**
    * @description 请求方法
    * @param {string} method - 请求的类型
    * @return {objcet} Promise - 返回一个Promise对象,resolve请求成功时的值，在请求为get类型时也会获取cache，有cache则返回cache，无则进行请求
    */
    fetch(method = 'get') {
        return new Promise((resolve, reject) => {
            const options = {
                data: Cleaner.deepCopy(this),
                method,
                url: this.getUrl()
            }
            const cacheData = this.cache(options)
            if (method === 'get' && cacheData) {
                resolve(cacheData)
            } else {
                // console.log(options)
                request(options).then(res => {
                    this.cache(options, res)
                    resolve(res)
                })
            }
        })
    }
    
    /**
    * @description 返回对应的urlroot
    * @return {string} urlRoot - 返回根地址
    */
    getUrlRoot() {
        if (typeof this.urlRoot === 'function') {
            return this.urlRoot.call(this)
        } else {
            return this.urlRoot
        }
    }
    /**
    * @description 返回对应的url
    * @return {string} url - 返回目标地址
    */
    getUrl() {
        if (typeof this.url === 'function') {
            return this.url.call(this)
        } else {
            return this.url
        }
    }
    get isCleaner() { // 用于判断这是不是一个Cleaner实例
        return true
    }
}
