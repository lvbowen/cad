import Vue from 'vue';
import Guide from './guide.vue';
import './style/index.less';

export default (options: any) => {
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
      return h(Guide, {
        props: options,
        scopedSlots: options.scopedSlots,
        on: {
          change: (step) => {
            if (options.change) {
              options.change(step);
            }
          }
        }
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
