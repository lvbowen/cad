export const baseConfig = {
  industryCategoryOptions: [
        {
            label: '铁路工程',
            value: '铁路工程'
        },
        {
            label: '船闸工程',
            value: '船闸工程'
        },
        {
            label: '桥梁工程',
            value: '桥梁工程'
        },
        {
            label: '水运工程',
            value: '水运工程'
        },
        {
            label: '隧道工程',
            value: '隧道工程'
        }
    ],
  typeOptions: [
        {
            label: '字符',
            value: '字符'
        },
        {
            label: '数值',
            value: '数值'
        },
        {
          label: '附件',
          value: '附件'
        },
        {
          label: '日期',
          value: '日期'
        }
    ],
  deliveryLevelOptions: [
        {
            label: '必要信息',
            value: '必要信息'
        },
        {
            label: '可选信息',
            value: '可选信息'
        }
    ],
  stageOptions: [
    {
      label: '设计阶段',
      value: '设计阶段'
    },
    {
      label: '施工阶段',
      value: '施工阶段'
    },
    {
      label: '运维阶段',
      value: '运维阶段'
    }
  ],
  criterionState: [
    {
      type: 'check-circle',
      theme: 'twoTone',
      twoToneColor: '#52c41a',
      text: '已启用'
    },
    {
      type: 'file-exclamation',
      theme: 'twoTone',
      twoToneColor: '#1890ff',
      text: '待启用'
    },
    {
      type: 'file-excel',
      theme: 'twoTone',
      twoToneColor: '#909399',
      text: '未启用'
    }
  ]
}
