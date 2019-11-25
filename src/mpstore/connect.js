import store from './store';

function diff(data, newData) {
    const updateData = {};

    for(let e in newData) {
        if (typeof newData[e] !== 'object' || newData[e] === null) {
            if (data[e] !== newData[e]) {
                updateData[e] = newData[e];
            } else {
                updateData[e] = newData[e];
            }
        }
    }
    return updateData;
}

function getData(mapStateToData) {
    if (mapStateToData) {
        return mapStateToData(store.getState());
    }
    return {};
}

function getDispatchs(dispatchs) {
    if (dispatchs) {
        return dispatchs(store.dispatch)
    }
    return {};
}

function connect(
    selector,
    mapStateToData,
    mapDispatchToMethod
) {
    const { data } = selector;
    // 挂载data
    const storeData = getData(mapStateToData);
    selector.data = Object.assign(data, storeData);

    const newOnload = selector.onLoad;
    selector.onLoad = function() {
        const storeData = getData(mapStateToData);
        this.setData(storeData);
        this._storeData = storeData;
        
        if (newOnload) {
            newOnload.apply(this, arguments);
        }
        selector._unsubscribe = store.subscribe(() => {
            const data = diff(this._storeData , getData(mapStateToData));
            if (Object.keys(data).length) {
                this.setData(data);
                this._storeData = data;
            }
        });
    }
    
    // 卸载监听
    const unloadFn = selector.onUnload;
    selector.onUnload = function() {
        if (unloadFn) {
            unloadFn.apply(this, arguments);
        }
        if (this._unsubscribe) this._unsubscribe();
    }

    // 挂载dispatch
    const storeDispatchs = getDispatchs(mapDispatchToMethod);
    return Page({ 
        ...selector,
        ...storeDispatchs,
        mapStateToData,
    });
}

connect.component = function(
    selector,
    mapStateToData,
    mapDispatchToMethod
) {
    const { data, methods } = selector;
    // 挂载data
    const storeData = getData(mapStateToData);
    selector.data = Object.assign(data, storeData);

    // 挂载dispatch
    const storeDispatchs = getDispatchs(mapDispatchToMethod);
    selector.methods = { ...methods, ...storeDispatchs };

    // 更新数据
    if (!selector.lifetimes) {
        selector.lifetimes = {}
    }
    const attached = selector.lifetimes.attached || selector.attached;

    selector.lifetimes.attached = function() {
        const storeData = getData(mapStateToData);
        this.setData(storeData);
        this._storeData = storeData;
        
        if (attached) {
            attached.apply(this, arguments);
        }
        selector._unsubscribe = store.subscribe(() => {
            const data = diff(this._storeData , getData(mapStateToData));
            if (Object.keys(data).length) {
                this.setData(data);
                this._storeData = data;
            }
        });
    }
    
    // 卸载监听
    const detached = selector.lifetimes.detached || selector.detached;
    selector.lifetimes.detached = function() {
        if (detached) {
            detached.apply(this, arguments);
        }
        if (this._unsubscribe) this._unsubscribe();
    }

    return Component({ 
        ...selector,
        mapStateToData
    });
}

export default connect;