import Vue, { CreateElement } from 'vue';
import { getNewReportState } from '@h3/report/basics/store/dashboard';
import Preview from './preview.vue';
import { reportState } from '@h3/report/basics/store/dashboard';

let messageInstance: Vue | null;
let store :any;
export const instance = (el: HTMLDivElement) => {
  const Instance: Vue = new Vue({
    store,
    destroyed: () => {
      if(el) {
        el.style.position = '';
        el.removeChild(component.$el);
      }else {
        document.body.removeChild(component.$el);

      }
      messageInstance = null;
    },
    render: function (h: CreateElement) {
      return h(Preview, {
        on: {
          destroy: () => {
            store.unregisterModule('report');
            store.registerModule('report', reportState);
            Instance.$destroy()
          }
        }
      });
    }
  });
  const component = Instance.$mount();
  if(el) {
    el.style.position = 'relative';
    el.appendChild(component.$el);
  }else {
    document.body.appendChild(component.$el);

  }
  return component.$children[0];
};

function getPreviewInstance(el: HTMLDivElement) {
  messageInstance = messageInstance || instance(el);
  return messageInstance;
}

export default {
  /**
   *  预览报表
   * @param charts 图表集合
   * @param charts 图表集合
   * @param global 图表的全局配置
   * @param top 预览的弹窗高度
   * @param objectId 图表标识
   * @param title 图表标题
   */
  show(preStore, {el, charts, global, top, objectId,title}) {
    preStore.unregisterModule('report');
    preStore.registerModule('report', getNewReportState(false));
    store = preStore;
    (getPreviewInstance(el) as any).show({ charts, global, top,objectId,title });
  },
  close() {
    if(messageInstance) {
      (messageInstance as any).close();
    }
  },
  destroy() {
    if(messageInstance) {
      messageInstance.$destroy();
      messageInstance = null;
    }
  }
};
