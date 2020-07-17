/**
 * 订阅者
 */
class Watcher {
    constructor(vm, key, callback) {
        this.vm = vm;
        this.key = key;
        this.callback = callback;


        // 实例化时，把自身缓存起来
        Dep.target = this;
        // 读取vm值，从而触发get
        this.vm.opts.data[key];

        if (!this.vm.opts.data[key] && this.vm.opts.computed[key]) {
            // 查找计算属性

            // 读取计算属性，触发get
            this.vm.opts.computed[key]();
        }


        // 读取完之后清空
        Dep.target = null;
    }

    update() {

        if (this.vm.opts.data[this.key]) {
            // 普通data属性
            this.callback.call(this.vm, this.vm.opts.data[this.key]);

        } else if (this.vm.opts.computed[this.key]) {
            // 计算属性
            this.callback.call(this.vm, this.vm.opts.computed[this.key]());
        }

    }

}
