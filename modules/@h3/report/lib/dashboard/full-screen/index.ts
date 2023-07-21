import Vue from 'vue';
import FullScreen from './full-screen.vue';
import './style.less';

export default (options: H3.Dashboard.FullScreenOptions) => {
  let Instance: Vue | null = new Vue({
    router: options.router,
    store: options.store,
    destroyed: () => {
      if (options.el) {
        options.el.removeChild(component.$el);
      } else {
        document.body.removeChild(component.$el);
      }
      Instance = null;
      },
    render: (h: any) => {
      const on: any = {};
      Object.keys(options).forEach((key: string) => {
        if(options[key] instanceof Function) {
          on[key] = options[key]
        }
      });
      on.destroy = () => Instance && Instance.$destroy();
      return h(FullScreen, {
        props: options,
        scopedSlots: options.scopedSlots,
        on
      });
    },
  } as any);
  const component = Instance.$mount();
  if (options.el) {
    options.el.appendChild(component.$el);
  } else {
    document.body.appendChild(component.$el);
  }
  
  return {
    Instance,
    close: () => {
      if(Instance) {
        Instance.$destroy();
      }
    }
  }
};
