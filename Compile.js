/**
 * 编译器
 */

class Compile {
    constructor(vm) {

        this.$el = document.querySelector(vm.opts.ele);
        this.$vm = vm;

        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el);
            this.compile(this.$fragment);
            this.$el.appendChild(this.$fragment);
        }


    }

    node2Fragment(el) {
        const fragment = document.createDocumentFragment();

        // 将原生节点拷贝到fragment
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }


    compile(el) {
        const childNodes = el.childNodes;

        Array.from(childNodes).forEach(node => {
            if (compileUtils.isElement(node)) {
                // console.log('编译元素节点', node.nodeName);
                this.compileElement(node);

            } else if (compileUtils.isInterpolation(node)) {
                // 双大括号
                // console.log('编译插值文本', node.textContent);
                this.compileText(node);
            }

            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }

        });
    }



    // 编译元素节点
    compileElement(node) {
        let nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
            // 获取属性
            const attrName = attr.name;
            // 获取等号后面的值
            const exp = attr.value;

            // 首先判断是事件还是命令
            if (compileUtils.isEvent(attrName)) {
                // 获取事件类型
                const eventType = attrName.substring(1);
                // 绑定事件，事件处理函数名就是exp
                compileUtils.eventHandler(node, eventType, exp, this.$vm);
            }

            if (compileUtils.isDir(attrName)) {
                // 获取指令名
                const dir = attrName.substring(2);
                // 在这里，exp是指令值。
                compileUtils[dir] && compileUtils[dir](node, exp, this.$vm);
            }
        })
    }


    // 编译文本节点
    compileText(node) {
        const exp = RegExp.$1.trim();
        compileUtils.text(node, exp,this.$vm);
    }

}

// 编译器通用方法
const compileUtils = {

    // 分派update更新方法,在此处初始化Watcher
    bind(node, exp, dir, vm) {
        var updaterFn = this[dir + 'Updater'];

        if(vm.opts.computed[exp]){
            vm.opts.computed[exp] = vm.opts.computed[exp].bind(vm);
        }

        let _value = vm.opts.data[exp] ? vm.opts.data[exp] : vm.opts.computed[exp]();

        // 第一次初始化视图
        updaterFn && updaterFn(node, _value);

        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, (value, oldValue) => {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
        
    },


    // 判断是否普通节点
    isElement(node) {
        return node.nodeType == 1;
    },

    // 判断插值文本：是文本且符合双大括弧正则
    isInterpolation(node) {
        return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent);
    },

    // 判读是否事件:@开头
    isEvent(attrName) {
        return attrName.indexOf('@') == 0;
    },

    // 判读是否指令：v开头
    isDir(attrName) {
        return attrName.indexOf('v-') == 0;
    },

    // 事件处理函数
    eventHandler(node, eventType, exp, vm) {
        // console.log(node, `绑定了${eventType}事件,函数名为${exp}`);
        const fn = vm.opts.method[exp];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm));
        }
    },

    // text指令
    text(node, exp, vm) {
        // console.log(node, `绑定了插值text指令，取值是${exp}`);
        this.bind(node, exp, 'text', vm);
    },

    // text更新
    textUpdater(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },


    // model指令
    model(node, exp,vm) {
        // console.log(node, `绑定了model指令，取值是${exp}`);
        this.bind(node, exp, 'model', vm);
        // 双向绑定
        node.addEventListener('input',e=>{
            vm.opts.data[exp] = e.target.value;
        })
    },

    // model更新
    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }


}
