import Vue from "vue";
import VueX from "vuex";
import View from "./viewer";
import Design from "./designer";
import Analysis from "./main.vue";
let messageInstance;
Vue.use(VueX);
const plugins = options => {
  // 样式
  const wrapClass = options && options.wrapClassName ? options.wrapClassName : "";
  // 挂在容器
  const container =
    options && options.getPopupContainer ? options.getPopupContainer() : document.body;
  // 是否开启动效
  const animations =
    options && typeof options.animations !== "undefined" ? options.animations : true;
  const Instance = new Vue({
    store: new VueX.Store({}),
    destroyed: () => {
      messageInstance = null;
      container.removeChild(Instance.$el);
    },
    render: function(h) {
      const self = this;
      // todo
      return h(Analysis, {
        class: {
          [wrapClass]: true
        },
        props: {
          animations: animations,
          fullScreenClassName:
            options && options.fullScreenClassName ? options.fullScreenClassName : ""
        },
        on: {
          destroy: () => {
            messageInstance = null;
            Instance.$destroy();
          }
        }
      });
    }
  });
  const component = Instance.$mount();
  container.appendChild(component.$el);
  return component.$children[0];
};

function getMessageInstance(options) {
  messageInstance = messageInstance || plugins(options);
  return messageInstance;
}

window.rx_report = '3.2.27';
export default {
  toggle(obj, filter) {
    getMessageInstance().toggle(obj, filter);
    return messageInstance;
  },
  show(obj, filter) {
    getMessageInstance().show(obj, filter);
    return messageInstance;
  },
  filter(filter) {
    if (messageInstance) {
      messageInstance.filter(filter);
    }
  },
  close(animate) {
    if (messageInstance) {
      messageInstance.hide(animate);
      messageInstance = null;
    }
  },
  options(options) {
    getMessageInstance(options).options = options;
    return messageInstance;
  },
  update() {
    getMessageInstance().update();
    return messageInstance;
  }
};
export { View, Design, Analysis };
