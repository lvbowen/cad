declare namespace H3 {
  namespace Element {
    enum ToolsBarType {
      EXPORT = 'elementExport',
      LINKAGE = 'elementLinkage',
      REFRESH = 'elementRefresh',
      NARROW = 'elementNarrow',
      FULLSCREEN = 'elementFullScreen',
      SORT = 'elementSort',
      EDIT = 'elementEdit',
      REMOVE = 'elementRemove'
    }

    interface ToolsBar {
      label: string,
      key: ToolsBarType,
      icon: string,
      click?: Function
    }
  }
}
