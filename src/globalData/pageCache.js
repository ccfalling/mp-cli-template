class StorageAccessorFactory {
    constructor(opt) {
        if(opt instanceof Object) {
            this.accessorCache = {};
            this.initScheme(opt);
        } else {
            throw Error('PageCache constructor arguments must be object!')
        }
    }

    initScheme(schemas) {
        const keys = Object.keys(schemas);
        keys.forEach(e => {
            this[e] = this.accessorCache[e] || this.createAccessor(e, schemas[e]);
        });
    }

    createAccessor(key, scheme) {
        let accessor;
        if (!scheme.hyphen) {
            accessor = data => {
                return this.operator(key, data, scheme);
            };
        } else {
            accessor = (keyComponent, data) => {
                if (keyComponent && !this.hyphenTypes.includes(typeof keyComponent)) {
                    throw Error('key must be typeof number or string')
                }
                const newkey = `${key}_${keyComponent}`;
                return this.operator(newkey, data, scheme);
            };
        }
        this.accessorCache[key] = accessor;
        return accessor;
    }

    operator() {
        const attr = arguments[1] !== undefined ? 'setValue' : 'getValue';
        return this[attr](...arguments);
    }

    getValue(key, data, scheme) {
        if (!scheme.hasOwnProperty('type')) {
            throw `type of ${key} must set!`
        }

        return new Promise((resolve) => {
            wx.getStorage({
                key,
                success: res => {
                    const data = res.data;
                    const type = typeof data;
                    if (data !== '' && (type === scheme.type || (scheme.type === 'array' && data instanceof Array))) {
                        resolve(data);
                    } else {
                        resolve(scheme.default);
                    }
                },
                fail: () => {
                    resolve(scheme.default);
                }
            })
        })
    }

    setValue(key, data) {
        return new Promise((resolve, reject) => {
            wx.setStorage({
                key,
                data,
                success: res => {
                    resolve(res)
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    }
}

StorageAccessorFactory.prototype.hyphenTypes = ['number', 'string'];

export default StorageAccessorFactory;

// export function typeValidate(schema, instance) {
//     let errorStack = [];
//     const keys = schema.keys(schema);
//     keys.forEach(e => {
//         if (schema[e].type && schema[e].type === 'object') {
//             const childErr = typeValidate(schema[e].prop, instance[e]);
//             errorStack.concat(childErr);
//         } else if (schema[e].type && schema[e].type === 'array') {
//             if (!(instance[e] instanceof Array)) {
//                 errorStack.push(`${schema[e]} must be type of ${schema[e].type}`);
//             }
//         } else {
//             if (typeof instance[e] !== schema[e].type) {
//                 errorStack.push(`${schema[e]} must be type of ${schema[e].type}`);
//             }
//         }
//     });
//     return errorStack;
// }
