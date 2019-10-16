
/**
 * 对象转query参数
 */
export function param(json = {}) {
  if (typeof(json) !== 'object') {
    console.error('param typeError');
    return null;
  }

  return Object.keys(json)
    .map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
    }).join("&");
}

/**
 * 判断空对象
 */
export function isEmptyObject(object) {
    for (var key in object) {
        return false;
    }
    return true;
}

/**
 * 广告是否展示计算函数
 * @param {*} b 首次展示位置
 * @param {*} a 广告位间隔数
 * @param {*} y 当前位置
 */
export function adShow(b, a, y) {
    if (a !== undefined && b !== undefined && y !== undefined) {
        let result = (y - b) / a;
        return Math.ceil(result) === Math.abs(result);
    } else {
        return false;
    }
}

/**
 * 广告显示位置计算函数
 * @param {*} b 首次展示位置
 * @param {*} a 广告位间隔数
 * @param {*} y 当前位置
 */
export function computeIndex(b, a, y) {
    if (a !== undefined && b !== undefined && y !== undefined) {
        return parseInt((y - b) / a);
    } else {
        return 0;
    }
}
