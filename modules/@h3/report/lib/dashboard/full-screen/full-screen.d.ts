
declare namespace H3 {
  namespace Dashboard {
    /**
     * 确认窗控件
     */
    export interface FullScreenOptions {
      /**
       * 挂载的元素
       */
      el?: HTMLElement
      /**
       * router
       */
      router?: any
      /**
       * store
       */
      store?: any
      /**
       * 是否有插槽
       */
      scopedSlots?: any
      /**
       * 元素
       */
      element?: H3.Report.BaseElement | null
      /**
       * 全局配置
       */
      global?: H3.Report.Global | null
      /**
       * 公司Id
       */
      corpId?: string
      /**
       * 是否自动刷新
       */
      refresh?: boolean

      /**
       * 报表状态
       */
      status?: H3.Report.State
      /**
       * 当前元素的位置
       */
      elementIndex?: number
      /**
       * 缩小事件回调
       */
      narrow?: Function
    }
  }

}


