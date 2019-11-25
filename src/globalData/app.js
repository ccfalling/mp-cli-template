import PageCache from "./pageCache";
import { reader } from '../routes';

const appStorage = new PageCache({
    // 主题
    theme: {
        type: 'string',
        default: 'white'
    },

    // 亮度
    brightness: {
        type: 'number'
    },

    //移动坐标
    addShelfAxis: {
        type: 'array',
        default: [wx.getSystemInfoSync().windowWidth, Math.floor(wx.getSystemInfoSync().windowHeight*0.65)]
    },

    // 阅读设置
    readerSetting: {
        type: 'object',
        // default: {
            // fontSize: 18,                    文章字体大小
            // lineHeight: 32,                  文章行高
            // letterSpace: 2,                  文字间隔
            // readerBg: '',                    阅读背景
            // readerColor: '',                 阅读字体颜色
            // isShowGuide: false,              展示引导提示
            // showedGuide: false,              是否已进行引导展示
            // turnType: 'up-down',             翻页模式
        // }
    },

    // 书籍浏览信息记录
    books: {
        // 是否拼接key， ture时 调用 reader.books()的第一个参数为拼接key名，第二个参数存在时为设置缓存，不存在时读取缓存，如reader.books('001'), 缓存的key=reader_books_001
        hyphen: true,
        // 缓存从未设置过时返回的默认值
        type: 'object',
        default: {
            nextChapterCount: 0,            // 下一章按钮点击次数,
        }
    },
    
    /**
     * 历史记录
     */
    footprint: {
        type: 'array',
        default: [
            // {
                // author       作者
                // novel_name
                // cover
                // desc
                // novel_id
                // id
                // time
            // }
        ]
    },
    // 阅读器计数器
    readerCounter: {
        type: 'object',
        default: {
            // 提示置顶小程序数
            notify: 0,
        }
    },
    // 进入小程序时间
    firstMount: {
        type: 'number'
    },
    
    storeUserKey: {
        type: 'string'
    },

    //搜索历史
    searchHistory: {
        type: 'array',
        default: [
            
        ]
    },

    //插屏弹窗展示
    dialogIfShow: {
        type: 'boolean',
        default: true
    }
});

export default appStorage;

/**
 * 删除items历史
 */
export function deleteHistory(items, history) {
    let temp = {};
    let newHistory = [];
    items.forEach(e => {
        temp[e.novel_id] = true;
    });
    history.forEach(e => {
        const bookId = e.novel_id;
        if(!temp[bookId]) {
            newHistory.push(e);
        }
    });
    return newHistory;
}

/**
 * 增加一行历史
 * @param {*} foot 
 * @param {*} history 
 */
export function addHistory(foot, history) {
    if (history instanceof Array) {
        const newHis = history.length ? deleteHistory([foot], history) : history;

        // 阅读记录最长100
        return [foot].concat(newHis).slice(0, 100);
    } else {
        throw ('addHistory arguments[1] must be array!')
    }
}

