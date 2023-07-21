import Vue from 'vue';
import Confirm from './confirm.vue';
import './style.less';

export default (options: H3.ReportConfirm.Options) => {
  const Instance: Vue = new Vue({
    router: options.router,
    store: options.store,
    destroyed: () => { document.body.removeChild(Instance.$el); },
    render: (h: any) => {
      const on: any = {};
      on.destroy = () => Instance.$destroy();
      return h(Confirm, {
        props: options,
        on
      });
    },
  } as any);
  const component = Instance.$mount();
  document.body.appendChild(component.$el);

  return {
    Instance,
    close: () => {
      Instance.$destroy();
    }
  }
};
