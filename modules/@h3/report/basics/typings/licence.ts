declare namespace H3 {
  namespace Licence {
    /**
     * 角色控制
     */
    interface Role {
      // 角色键值
      key: string;
      // 角色名称
      name?: string;
      // 角色权重
      weight: number;
      // 角色模块权限
      authority: Authority;
    }
    /**
     * 新统计分析权限控制
     */
    interface Authority {
      view?: moduleAuthority;
      design?: moduleAuthority;
    }

    interface moduleAuthority {
      // 公共模块编辑权限
      Public?: H3.Analysis.PublicView;
      // 个人模块编辑权限
      Person?: H3.Analysis.PersionView;
      // 图表配置集合
      Chart?: H3.Analysis.ChartController;
      // 设计器
      Designer?: H3.Analysis.Design;
    }

    enum ModulesType {
      Public = "Public",

      Person = "Person",

      Chart = "Chart",

      Designer = "Designer"
    }
  }
}
