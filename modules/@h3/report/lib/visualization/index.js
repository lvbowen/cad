import Vue from 'vue';
import store from '@h3/report/basics/store/visualization';
import Modal from './modal/mini.vue';

let messageInstance;

export const instance = () => {
  const Instance = new Vue({
    store,
    destroyed: () => {
      document.body.removeChild(Instance.$el);
    },
    render: function (h) {
      const self = this;
      return h(Modal, {
        on: {
          destroy: () => Instance.$destroy()
        }
      });
    }
  });
  const component = Instance.$mount();
  document.body.appendChild(component.$el);
  return component.$children[0];
};

function getMessageInstance() {
  messageInstance = messageInstance || instance();
  return messageInstance;
}

window.rx_report = '3.2.27';
export default {
  toggle(schemaCode, filter) {
    return getMessageInstance().toggle(schemaCode, filter);
  },
  show(schemaCode, filter) {
    //return (getMessageInstance() as any).show(schemaCode);
    return getMessageInstance().toggle(schemaCode, filter);
  },
  filter(filter) {
    if(messageInstance) {
      messageInstance.filter(filter);
    }
  },
  close(animate) {
    if(messageInstance) {
      messageInstance.hide(animate);
    }
  },
  options(options) {
    getMessageInstance().options = options;
  }
};
