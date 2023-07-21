import Vue, { VNode } from "vue";
import VueRouter, { Route } from 'vue-router'
import { Store } from "vuex";
import { message, Modal } from '@h3/antd-vue';

declare module "vue/types/vue" {
  // 3. 声明为 Vue 补充的东西
  // eslint-disable-next-line no-shadow
  interface Vue {
    // $confirm: any,
    // $warning: any,
    // $message: any,
    // $error: any,
    isDingTalk: boolean;
    $h3: {
      toast: any;
      modal: any;
      datetime: any;
    };
    $route: Route;
    $router: VueRouter;
    $store: Store<any>;
    $message: typeof message;
    $confirm: typeof Modal.confirm;
  }
}

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {
    }

    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {
    }

    interface IntrinsicElements {
      [elem: string]: any;
    }

    /*interface ElementAttributesProperty{
      $props: {}
    }*/
  }

  interface Window {
    less: any;
    dd: any;
    Environment: any;
  }

  const AMap: any;
}
