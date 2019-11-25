export class PubSub {
    constructor() {
        this.subList = [];
    }

    listenOnce(key, fn) {
        if (!this.subList[key]) {
            this.subList[key] = [];
        }
        if (!this.subList[key]['once']) {
            this.subList[key]['once'] = [];
        }
        this.subList[key]['once'].push(fn);
        return () => this.remove(fn);
    }

    listen(key, fn) {

        if (!this.subList[key]) {
            this.subList[key] = [];
        }
        if (!this.subList[key]['listener']) {
            this.subList[key]['listener'] = [];
        }
        this.subList[key]['listener'].push(fn);
        return () => this.remove(fn);
    }

    trigger() {
        const key = Array.prototype.shift.call(arguments);
        if (this.subList[key] && this.subList[key]['listener'] && this.subList[key]['listener'].length) {
            this.subList[key]['listener'].forEach(fn => fn.apply(this, arguments));
        };
        if(this.subList[key] && this.subList[key]['once'] && this.subList[key]['once'].length) {
            this.subList[key]['once'].forEach(fn => fn.apply(this, arguments));
            this.subList[key]['once'] = [];
        };
        
    }

    remove(listen) {
        const index = this.subList.indexOf(listen);
        this.subList.splice(index, 1);
    }
}


export default new PubSub();