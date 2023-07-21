export const source = {
  nodes: [
    {
      id: '%1', // 节点ID
      type: 'input', // 节点类型
      text: '客户信息', // 节点文本
      x: 1, // 节点X坐标
      y: 1, // 节点Y坐标     
      w: 1,// 节点宽度
      h: 1, // 节点高度 
    },
    {
      id: '%2', // 节点ID
      type: 'input', // 节点类型
      text: '客户信息', // 节点文本

    },
    {
      id: '%3', // 节点ID
      type: 'input', // 节点类型
      text: '物资入库' // 节点文本
    },
    {
      id: '%4', // 节点ID
      type: 'input', // 节点类型
      text: '物资清单' // 节点文本
    },
    {
      id: '%5', // 节点ID
      type: 'join', // 节点类型
      text: '横向链接1', // 节点文本
    },
    {
      id: '%6', // 节点ID
      type: 'union', // 节点类型
      text: '追加合并' // 节点文本

    },
    {
      id: '%7', // 节点ID
      type: 'join', // 节点类型
      text: '横向链接2' // 节点文本
    },
    {
      id: '%8', // 节点ID
      type: 'output', // 节点类型
      text: '输出' // 节点文本
    },
  ] ,// 流程节点集合
  edges: [
    {
      id: '$1', // 连接ID
      source: '%1', // 源节点ID
      target: '%5', // 目标节点ID
      anchors: [], // 锚点
      shape: null // 连接形态
    },
    {
      id: '$2', // 连接ID
      source: '%2', // 源节点ID
      target: '%5' // 目标节点ID
    },
    {
      id: '$3', // 连接ID
      source: '%3' ,// 源节点ID
      target: '%6' // 目标节点ID
    },
    {
      id: '$4', // 连接ID
      source: '%4' ,// 源节点ID
      target: '%6' // 目标节点ID
    },
    {
      id: '$5', // 连接ID
      source: '%5' ,// 源节点ID
      target: '%7' // 目标节点ID
    },
    {
      id: '$6', // 连接ID
      source: '%6' ,// 源节点ID
      target: '%7' // 目标节点ID
    },
    {
      id: '$7', // 连接ID
      source: '%7' ,// 源节点ID
      target: '%8' // 目标节点ID
    },
  ], // 流程关系
  models: [
    {
      id: "%1", // 源节点ID
      main:{
        displayName: '主表名称1',
        schemaCode: '主表1', // schemaCode
        fields:[
          {
            "id": "uid1",
            "text": "字段1",
            "type": "string"
          },
          {
            "id": "uid123",
            "text": "字段2",
            "type": "number"
          },
        ]
      },
      sub: null
  },
    {
      id: "%2", // 源节点ID
      main:{
        displayName: '主表名称2',
        schemaCode: '主表2', // schemaCode
        fields:[
          {
            "id": "uid2",
            "text": "客户名称",
            "type": "string"
          },
        ]
      },
      sub: null
  },
    {
      id: "%3", // 源节点ID
      main:{
        displayName: '主表名称3',
        schemaCode: '主表3', // schemaCode
        fields:[
          {
            "text": "操作人",
            "id": "uid3",
            "type": "string"
          },
        ]
      },
      sub: {
        displayName: '子表名称3-1',
        schemaCode: '子表1', // schemaCode
        fields:[
          {
            "text": "数量",
            "id": "uid4",
            "type": "number"
          },
        ]
      },
  },
    {
      id: "%4", // 源节点ID
      main:{
        displayName: '主表名称4',
        schemaCode: '主表4', // schemaCode
        fields:[
          {
            "text": "单位",
            "id": "uid5",
            "type": "string"
          },
          {
            "text": "提交人",
            "id": "uid6",
            "type": "string"
          },
        ]
      },
      sub: null
    },

  ],    // 模型
  merges: [
    {
      id: '%6', // 源节点ID
      title: '追加合并1', // 节点名称 ? 和 Node text的区别
      groups: [
        {
        id: "%3&%4-uid1", // 追加合并生成的字段UUID
        type: 'string', // 生成的字段类型
        text: '提交人', // 字段名称
        source: {
          '%3' : 'uid3#%3', // 字段UUID关联或者模型需要带上%模型ID
          '%4' : 'uid6#%4', // 字段UUID关联或者模型需要带上%模型ID
         }
      },
        {
          id: "%3&%4-uid2", // 追加合并生成的字段UUID
          type: 'string', // 生成的字段类型
          text: '单位', // 字段名称
          source: {
            '%4' : 'uid5#%4', // 字段UUID关联或者模型需要带上%模型ID
          }
        },
        {
          id: "%3&%4-uid3", // 追加合并生成的字段UUID
          type: 'number', // 生成的字段类型
          text: '数量', // 字段名称
          source: {
            '%3' : 'uid4#%3', // 字段UUID关联或者模型需要带上%模型ID
          }
        }
      ]
    },
    // 假设%7为 合并节点
    // {
    //   id: '%7', // 源节点ID
    //   title: '追加合并2', // 节点名称 ? 和 Node text的区别
    //   groups: [
    //     {
    //       id: "%5&%6-uid1", // 追加合并生成的字段UUID
    //       type: 'string', // 生成的字段类型
    //       text: '单位', // 字段名称
    //       source: {
    //         '%5' : 'uid1#%1', // 字段UUID关联或者模型需要带上#模型ID
    //         '%6' : '%3&%4-uid2', // 字段UUID关联或者模型需要带上#模型ID
    //       }
    //     },
    //     {
    //       id: "%5&%6-uid2", // 追加合并生成的字段UUID
    //       type: 'string', // 生成的字段类型
    //       text: '提交人', // 字段名称
    //       source: {
    //         '%6' : '%3&%4-uid1', // 字段UUID关联或者模型需要带上#模型ID
    //       }
    //     },
    //     {
    //       id: "%5&%6-uid3", // 追加合并生成的字段UUID
    //       type: 'number', // 生成的字段类型
    //       text: '数量', // 字段名称
    //       source: {
    //         '%6' : '%3&%4-uid3', // 字段UUID关联或者模型需要带上#模型ID
    //       }
    //     }
    //   ]
    // }
  ], // 追加合并
  relations: [
    {
      id: '%5', // 节点id
      title: '横向连接1',  // 字段名称 ? 和Node-text的区别
      join: 'left', // 关系
      groups: [
        {
          type: 'string',
          source: {
            '%1': 'uid1#%1',
            '%2': 'uid2#%2',
          }
        }
      ]
    },
    {
      id: '%7', // 追加合并生成的字段UUID
      title: '横向连接2', // 字段名称
      join: 'right', // 关系
      groups: [
        {
          type: 'string',
          source: {
            '%5': 'uid1#%1',
            '%6': '%3&%4-uid2',
          }
        }
      ]
    }
  ], // 关联
  output:[{id: '%8'}]
};

export const dataSourceList = [
  {
    corpId: 'test',
    displayName: '层级1',
    objectId: 'L1',
    parentObjectId: '',
    nodeType: 0,
    schemaCode:'#1'
  },
  {
    corpId: 'test',
    displayName: '层级1-1',
    objectId: 'L1-1',
    parentObjectId: 'L1',
    nodeType: 0,
    schemaCode:'#2'
  },
  {
    corpId: 'test',
    displayName: '层级1-1-1',
    objectId: 'L1-1-1',
    parentObjectId: 'L1-1',
    nodeType: 1,
    schemaCode:'#3'
  },
  {
    corpId: 'test',
    displayName: '层级2',
    objectId: 'L2',
    parentObjectId: '',
    nodeType: 0,
    schemaCode:'#4'
  }, 
  {
    corpId: 'test',
    displayName: '层级2-1',
    objectId: 'L2-1',
    parentObjectId: 'L2',
    nodeType: 1,
    schemaCode:'#5'
  }
];
export const dataFieldList = {
  "id": "%1",
  "subs": [
      {
        "fields": [
          {
            "text": "子表1-字段1",
            "id": "sub1-field1",
            "type": "string"
          },
          {
            "text": "子表1-字段2",
            "id": "sub1-field2",
            "type": "string"
          },
        ],
        displayName: '子表1',
        "schemaCode": "qwe"
      },
      {
        "fields": [
          {
            "text": "子表2-字段1",
            "id": "sub2-field1",
            "type": "string"
          },
          {
            "text": "子表2-字段2",
            "id": "sub2-field2",
            "type": "string"
          }
        ],
        "schemaCode": 'asd',
        displayName: '子表2',
      }
    ],
    "main": {
      "fields": [
        {
          "text": "主表1-字段1",
          "id": "main_field1",
          "type": "string"
        },
        {
          "text": "主表1-字段2",
          "id": "main_field2",
          "type": "string"
        },
      ],
      "schemaCode": "zxc",
      displayName: '主表名字1',
    },
  };


