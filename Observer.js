/**
 * 订阅器（依赖收集器）
 */
class Dep {
    constructor() {
        this.deps = [];
    }

    // 添加依赖
    add(watcher) {
        
        this.deps.push(watcher);
        
    }

    // 遍历通知驶入更新
    notify() {
        
        this.deps.forEach(watcher => {
            // console.log(222,watcher)
            watcher.update()
        });
    }
}


/**
 * 数据劫持
 */
class Observer {
    constructor(data,vm) {
        this.vm = vm;
        this.observe(data);
    }

    defineResponsive(data, key, val) {

        const dep = new Dep();

        const  _this = this;

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get() {
                // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
                Dep.target && dep.add(Dep.target);
                return val;
            },

            set(nick) {
                const old = data[key];
                val = nick;

                // 通知订阅者
                console.log(`${key}：${old}->${nick}`)
                dep.notify();
                _this.vm.computedDep.notify();
            }
        })

        // 递归调用
        this.observe(val);
    }

    // 观察属性
    observe(data) {
        if (!data || typeof data !== 'object') {
            return;
        }

        // 取出所有属性遍历
        Object.keys(data).forEach(key => {
            this.defineResponsive(data, key, data[key]);
        });
    }
}
