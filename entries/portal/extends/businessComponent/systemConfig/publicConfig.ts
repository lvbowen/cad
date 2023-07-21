export default {
  sysTreeConfig:[
    {
      title: '平台级配置',
      id: '1',
      scopedSlots: { title: 'title'},
      children: [
        {
          title: '项目架构配置',
          id: '2',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '登录页配置',
          id: '3',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '业务平台配置',
          id: '15',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '数据中心配置',
          id: '4',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '监控中心配置',
          id: '5',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '组织架构权限组配置',
          id: '14',
          scopedSlots: { title: 'title'},
          children: []
        }
      ]
    },
    {
      title: '项目级配置',
      id: '6',
      scopedSlots: { title: 'title'},
      children: [
        {
          title: '业务平台配置',
          id: '7',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: 'BIM平台配置',
          id: '8',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '工程档案配置',
          id: '16',
          scopedSlots: { title: 'title'},
          children: []
        }
      ]
    },
    {
      title: '统一性配置',
      id: '9',
      scopedSlots: { title: 'title'},
      children: [
        {
          title: '业务平台配置',
          id: '10',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: 'BIM平台配置',
          id: '11',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '帮助文档配置',
          id: '12',
          scopedSlots: { title: 'title'},
          children: []
        },
        {
          title: '图标库配置',
          id: '13',
          scopedSlots: { title: 'title'},
          children: []
        }
      ]
    }
  ],
  levels:[
    {
      label: '单项工程',
      value: [],
      id: '',
      key: 'dxpd',
      jbsId: ''
    },
    {
      label: '单位工程',
      value: [],
      id: '',
      key: 'dwpd',
      jbsId: ''
    },
    {
      label: '分部工程',
      value: [],
      id: '',
      key: 'fbpd',
      jbsId: ''
    },
    {
      label: '分项工程',
      value: [],
      id: '',
      key: 'fxpd',
      jbsId: ''
    },
    {
      label: '具体部位',
      value: [],
      id: '',
      key: 'bwpd',
      jbsId: ''
    }
  ]
}
