declare namespace H3 {
  /**
   * 引导帮助
   */
  namespace IntroJsHelper {
    /**
     * 步骤模型
     */
    export interface Step {
      el: string | HTMLElement // 选择器字符串或者HTML元素
      describe: string // 步骤描述
      position: 'top' | 'right' | 'left' | 'bottom' // 定位
      rippleOffsetX?: number // ripple X 定位
      rippleOffsetY?: number // ripple Y 定位
      step: string // 步骤描述
      highTitle?: string // 高亮标题
      highContent?: string // 高亮文本
      showHighLightContent?: boolean // 是否显示高亮文本
      showButtons?: boolean // 是否显示按钮
      mainContent?: string// 正文
      tools?: Function // 是否存在额外的工具函数
    }
  }
}
