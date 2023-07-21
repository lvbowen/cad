import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    // interface IntrinsicElements {
    //   //@ts-ignore
    //   [elem: string]: any;
    // }
  }
  interface Window {
    less: any;
    Environment: any;
  }
}