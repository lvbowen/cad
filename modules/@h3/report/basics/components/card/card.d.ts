declare namespace H3 {
  namespace Chart {
    interface Card {
      data: Array<any> // 图表数据
      resizeState: boolean //跟新状态
      dataAlias: {[key: string]: string} // 数据别名
      dimension: H3.Report.FieldColumn | null
      metric: H3.Report.FieldColumn | null
      limit: number // 数据显示设置
      fontColor: string // 字体颜色
    }
  }
}
