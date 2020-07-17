/**
 * 总体入口
 */

class Vm {
    constructor(opts) {
        this.opts = opts;

        const { data, computed, created } = this.opts;

        Object.keys(data).forEach(key => {
            this.proxyData(key);
        });

        // 计算属性
        this.initComputed();

        new Observer(data,this);

        new Compile(this);

        created && created.call(this);
    }

    // 代理
    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.opts.data[key];
            },
            set(newVal) {
                this.opts.data[key] = newVal;
            }
        })
    }

    // 计算属性
    initComputed() {
        const computed = this.opts.computed;

        if (!computed) {
            return
        }

        if (typeof computed === 'object') {
            Object.keys(computed).forEach(key => {
                const getter = computed[key];
                this.computedDep = new Dep();
                Object.defineProperty(this, key, {
                    enumerable: true,
                    configurable: true,
                    get:() => {
                        const value = getter.call(this);
                        Dep.target && this.computedDep.add(Dep.target);
                        // console.log('变了',value)
                        return value;
                    },

                    set: function () { }
                });
            });
        }
    }
}

