import Mock from "mockjs";
import {getWorkOutlineModels} from "../../service/api";
import {getChiefOpinion} from "../../service/CoordinateDesign/WorkingOutline/ProjectPlanning";
export const exampleData = {
  url: "/example",
  method: "get",
  response: {
    code: 200,
    message: "example",
    data: Mock.mock({
      
      "filesMenu|1-1": [
        {
          "id|1-10000": 1,
          "name|1": "项目信息1",
          "childs|1-5": [
            {
              "id|1-10000": 1,
              "name|1": "childs项目信息",
              "childs|0-3": [
                {
                  "id|1-10000": 1,
                  "name|1": "childs项目信息12",
                },
              ],
            },
          ],
        },
        {
          "id|1-10000": 1,
          "name|1": "项目信息2",
          "childs|1-5": [
            {
              "id|1-10000": 1,
              "name|1": "bobo",
              "childs|0-3": [
                {
                  "id|1-10000": 1,
                  "name|1": "波",
                },
              ],
            },
          ],
        },
      ],
      "partCode|10-20": [
        {
          "id|1-10000": 1,
          "title|1": "部位码",
          "childs|1-5": [
            {
              "id|1-10000": 1,
              "title|1": "部位码",
              "childs|0-3": [
                {
                  "id|1-10000": 1,
                  "title|1": "部位码",
                },
              ],
            },
          ],
        },
      ],
      "DocList|10-20": [
        {
          "id|1-100": 1,
          "title": "<span style=\"color: #FF6F30;\">admin</span>",
          "creator": "<span style=\"color: #FF6F30;\">admin</span>",
          "modifier": "<span style=\"color: #FF6F30;\">admin</span>",
          // "modifyTime": "<span style=\"color: #FF6F30;\">admin</span>",
          "modifyTime": "213123123",
          "attachments|1-2": [
            {
              "name":"<span style=\"color: #FF6F30;\">admin</span>",
              "previewUrl": ""
            },
            //fix:工程档案-增加创建人/修改人/修改时间/附件检索
          ],
        },
      ],
      // globalSearchRes: {
      //   "searchRes|10-50": [
      //     {
      //       "id|1-10000": 1,
      //       appCode: "ZSPT",
      //       schemaCode: function () {
      //         // @ts-ignore
      //         // setTimeout(()=> {// @ts-ignore
      //         //   return this.menuType===0?"ZSPT_QualityModule":this.menuType===2?'ZSPT_zlxj':this.menuType===1?'jd_data':'';
      //         // },200)
      //         // return 'jd_data'
      //         return this.menuType === 0
      //           ? "ZSPT_QualityModule"
      //           : this.menuType === 2
      //           ? "ZSPT_zlxj"
      //           : this.menuType === 1
      //           ? "jd_data"
      //           : "";
      //       },
      //       objectId: "d5be6eae30b5433caafa5b22c5fe0535",
      //       "name|1-3": function () {
      //         // @ts-ignore
      //         return this.menuType === 0
      //           ? "Page"
      //           : this.menuType === 1
      //           ? "Report"
      //           : this.menuType === 2
      //           ? "BizModel"
      //           : "";
      //       },
      //       creator: "张三",
      //       createTime: "2022-01-10 13:46:50",
      //       type: function () {
      //         // @ts-ignore
      //         return this.id > 5000 ? 0 : 1;
      //       },
      //       menuType: function () {
      //         //@ts-ignore
      //         // return this.id<3000?2:this.id<6000?1:0
      //         return this.id < 5000 ? 2 : 0;
      //       }, //0,1,2
      //       menuName: "质量报验",
      //       parentId: function () {
      //         // @ts-ignore
      //         return this.menuType === 0
      //           ? "ff8080817ae26292017ae2942db7072d"
      //           : this.menuType === 2
      //           ? "ff8080817ae26292017ae2942db7072d"
      //           : this.menuType === 1
      //           ? "ff8080817bba6ef3017bc89746aa74b7"
      //           : "";
      //       },
      //       status: 0, //0-进行中；1-已完成
      //       path: function () {
      //         // @ts-ignore
      //         return this.menuType === 0
      //           ? "自定义路由"
      //           : this.menuType === 1
      //           ? "报表"
      //           : this.menuType === 2
      //           ? "表单"
      //           : "";
      //       },
      //       pcAble: true,
      //       mobileAble: true,
      //       openMode: 1, //打开方式：0-iframe;1-vue;2-blank
      //       pcUrl: function () {
      //         // @ts-ignore
      //         return this.menuType !== 0
      //           ? null
      //           : this.openMode === 1
      //           ? "/application/ZSPT/QualityModule"
      //           : "https://www.baidu.com/";
      //       },
      //       mobileUrl: "",
      //     },
      //   ],
      // },
      'device': {
        'nodes|20-30': [
          {
            'id|1-10000':1,
            'appCode': 'ZHGD',
            'marked': function (){
              const n = Math.floor(Math.random()*10000);
              //@ts-ignore
              return n>4000
            },
            'w':function () {
              return Math.floor(Math.random()*1000)
            },
            'h':function() {
              return Math.floor(Math.random()*1000)
            },
            'devicePosition': '',
            'deviceCode': '',
            'desc': '',
            'deviceName': function (){
              //@ts-ignore
              return this.id>8750?'AI识别':this.id>7500?'车辆抓拍':this.id>6000?'卸料平台':this.id>4500?'临边防护':this.id>3000?'用电安全':this.id>2000?'智能电表':this.id>1000?'预警螺母':'智能水表'
            },
            'type': function (){
              //@ts-ignore
              // console.log(this.id,'id')
              //@ts-ignore
              return this.id>8750?'AI':this.id>7500?'CAR':this.id>6000?'DISCHARGE':this.id>4500?'EDGEPROTECT':this.id>3000?'ELECSAFTY':this.id>2000?'ELECMETER':this.id>1000?'NUTRISK':'WATERMETER'
            },
          }
        ],
        'types':[
          {
            type:'AI',
            desc: ''
          },
          {
            type:'CAR',
            desc: ''
          },
          {
            type:'DISCHARGE',
            desc: ''
          },
          {
            type:'EDGEPROTECT',
            desc: ''
          },
          {
            type:'ELECSAFTY',
            desc: ''
          },
          {
            type:'ELECMETER',
            desc: ''
          },
          {
            type:'NUTRISK',
            desc: ''
          },
          {
            type:'WATERMETER',
            desc: ''
          }
        ]
        // 'types|1-8':[
        //   {
        //     type:function () {
        //       const n = Math.floor(Math.random()*10000);
        //       //@ts-ignore
        //       return n>8750?'AI':n>7500?'CAR':n>6000?'DISCHARGE':n>4500?'EDGEPROTECT':n>3000?'ELECSAFTY':n>2000?'ELECMETER':n>1000?'NUTRISK':'WATERMETER'
        //     },
        //     desc: ''
        //   }
        // ]
      },
      'ai': {
        "alarmNum": 0,
        "alarmTypes|3-10": [
          {
            "num": 4,
            "ratio": 0,
            type:function () {
              const n = Math.floor(Math.random()*10000);
              //@ts-ignore
              return n>7000?'安全帽报警':n>5000?'抽烟报警':n>3000?'大电话报警':'其他'
            }
          }
        ],
        "dates": [],
        "details": {
          '全部|20-50': [
            {
              deviceName: '',
              type: '全部',
              num: 1,
              time: '2022.03.23',
              imgUrl: 'data:image/png;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/ora8OeFdW8VXclvpduHMQDSSO21EB6ZPv6e1eleFvg1fWOt2l9rV3ZvBA4k8iEsxcjkAkgDGcZ61y18ZRo3Upa9jSFKc9kYH/CnNe/4R7+0vOg+1eX5v2LB34xnbnpu9v1rzqvsmvG/FPwZvb7Wru+0a8tI4J3MnkTbl2E8kAgHjOcdPSvNwWa80mq7t2/yOirhrJOB41RW14k8Kat4Uu47fVIFTzQWjkRtyOB1wfb096K9qE4zjzRd0cjTTszp/hX40tfC+p3FnqA22d8UzP8A88mGcE/7Jzz6V9DI6yIrowZGGVZTkEeor44r6v8ACFq1l4N0a3cnclnFuz2JUEj9a8DOKEItVVuztws21y9japrusaM7sFRRlmY4AHqadWN4utWvfB+sW6Ehns5duPXaSBXjQSlJJnW3ZXPEPin41tfFGp29np43WdiXxP8A89WOMkf7PHHrRXn1Ffa0aMaNNU47I8icnOXMwr0ew+Mut2GgQ6ctpayTwxiJLl852gYGV7nHf9KKKKtCnWSVRXsEZyj8LOWPjXxKdW/tP+2rv7Vn72/5cemz7uPbGK6i++Meu32gS6c9rapPNGYnukBB2kYOF6A47/pRRUzwtGbTcVoNVJrZnnNFFFbkH//Z'
            }
          ],
          '安全帽报警': [
            {
              deviceName: '',
              type: '安全帽报警1',
              num: 1,
              time: '2022.03.23',
              imgUrl: "data:image/jpg;base64,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"
            },
            {
              deviceName: '',
              type: '安全帽报警2',
              num: 2,
              time: '2022.03.23',
              imgUrl: "data:image/png;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5/oorV07TrbULORVlK3gOQD0xQBlUU+WJ4JWjkUq6nBBplABRRRQAU+KV4JVkjYq6nIIplFAHRfuPEFr/AAx30Y/Bv/rfyqtY2CfYdR+0w/voVOM9VO00WFja+VDc/wBppBN127lyp/Otm7u7Q6fcgXVu0jQsvyuMscH3oA42iiigAooooAKKKKACiiigD//Z"
            }
          ],
          '抽烟报警|1-10': [
            {
              deviceName: '',
              type: '抽烟报警',
              num: 1,
              time: '2022.03.23',
              imgUrl: ''
            }
          ],
          '打电话报警|1-10': [
            {
              deviceName: '',
              type: '打电话报警',
              num: 1,
              time: '2022.03.23',
              imgUrl: ''
            }
          ]
        },
        "nums": [],
        "personNum": 0
      },
      'modelList|20-50': [
        {
          'id|1-10000': 1,
          'code': 'code1',
          'name': '模型名称1',
        }
      ],
      'modelTree':[
        {
          bindQbsFlag: false,
          childCount: 0,
          // _X_EXPAND: true,
          checked: false,
          'children|5': [
            {
              bindQbsFlag: false,
              childCount: 0,
              children: null,
              codeValue: "00001.00001.00001.00001.00001.00001.00001",
              createdtime: "2021-03-31 10:58:24",
              'id|1-10000': 1,
              // _X_EXPAND: true,
              leaf: true,
              mark: false,
              checked: false,
              parentId: "2021033110582311479",
              simplifiedCodeValue: "1.1.1.1.1.1.1",
              taskName: "1.1轴钢管桩.00001",
              'children|1-5': [
                {
                  bindQbsFlag: false,
                  childCount: 0,
                  children: null,
                  codeValue: "00001.00001.00001.00001.00001.00001.00001",
                  createdtime: "2021-03-31 10:58:24",
                  'id|1-10000': 1,
                  // _X_EXPAND: true,
                  checked: false,
                  leaf: true,
                  mark: false,
                  parentId: "2021033110582311479",
                  simplifiedCodeValue: "1.1.1.1.1.1.1",
                  taskName: "1.1.1轴钢管桩.00001",
                }
              ]
            }
          ],
          codeValue: "00001.00001.00001.00001.00001.00001.00001",
          createdtime: "2021-03-31 10:58:24",
          'id|1-10000': 1,
          leaf: true,
          mark: false,
          parentId: "2021033110582311479",
          simplifiedCodeValue: "1.1.1.1.1.1.1",
          taskName: "1轴钢管桩.00001",

          // 'id|1-10000': 1,
          // 'code': 'code1',
          // 'name': '模型名称1',
          // 'checked': false,
          // 'children|1-5': [
          //   {
          //     'id|1-10000': 3,
          //     'code': 'code1.1',
          //     'name': '模型名称1.1',
          //     'checked': false,
          //     children: []
          //   }
          // ]
        }
      ],
      'modelProperty': {
        dataDisplay: '',
        tableDatas: {
          '模型属性': [
            {
              "name": "供应商",
              "msg": "供应商"
            },
            {
              "name": "制造商",
              "msg": "制造商"
            },
            {
              "name": "型号",
              "msg": "型号"
            },
            {
              "name": "对象分类",
              "msg": "对象分类"
            },
            {
              "name": "对象名称",
              "msg": "对象名称"
            },
            {
              "name": "对象编号",
              "msg": "对象编号"
            },
            {
              "name": "描述",
              "msg": "描述"
            },
            {
              "name": "数量",
              "msg": ""
            },
            {
              "name": "用途",
              "msg": ""
            },
            {
              "name": "描述",
              "msg": ""
            },
            {
              "name": "数量",
              "msg": ""
            },
            {
              "name": "用途",
              "msg": ""
            },
            {
              "name": "描述",
              "msg": ""
            },
            {
              "name": "数量",
              "msg": ""
            },
            {
              "name": "用途",
              "msg": ""
            },
            {
              "name": "描述",
              "msg": ""
            },
            {
              "name": "数量",
              "msg": ""
            },
            {
              "name": "用途",
              "msg": ""
            }
          ]
        }
      },
      'deviceStandingBook|10-20': [
        {
          "id|1-100000000": 1,
          "parentId|1-10000000": 2,
          "code": "1.4",
          "name": "挡潮门",
          "childs|1-10": [
            {
              "id|1-100000000": 3,
              "parentId|1-10000000": 4,
              "code": "1.4.1",
              "name": "门体",
              "childs": []
            }
          ]
        }
      ],
      'deviceList|10-50':[
        {
          'id|1-600': 1,
          'name': '设备名称',
          'bh': '设备编号',
          'sblx': '设备类型',
          'ggxh': '规格型号',
          'sbzrr': '设备责任人',
          'sbzt': function() {
            //@ts-ignore
            return this.id<100?'未入场':this.id<200?'已入场':this.id<300?'使用中':this.id<400?'维修中':this.id<500?'已报废':'已离场'
          },
          'zxxjrq': '最新巡检日期',
          'zxbyrq': '最新保养日期'
        }
      ],
      'deviceInfoSummary|1-10':[
        {
          year: '2022',
          'list|2-10': [
            {
              "id|1-10000": 1,
              "userName": "柯希峰",
              "name": "test",
              "deviceState": "进场",
              'month|1-12': 1,
              // "url": "workflowInstanceId=dee93e2aed9841b2aafb20a5a309d5ba&isWorkFlow=true&return=/apps/apps-form-list/ZSPT_device_present",
              url: 'sheetCode=ZSPT_device_present&objectId=164c7b10870b46a7b69c0b53fcb55cb3&schemaCode=ZSPT_device_present&isWorkFlow=false&return=/apps/apps-form-list/ZSPT_device_present',
              "dateTime": "2022-07-21T00:00:00",
              "schemaModelName": "入/离场记录"
            }
          ]
        }
      ],
      'workOutlineModels|10-15':[
        {
          bussiness: '行业类型2行业类型2行业类型2',
          downloadUrl: '',
          fileName: '文件名称文件名称',
          'id|1-1000': 1,
          previewUrl: '',
          projectType: '工程类型工程类型工程类型',
        }
      ],
      'sourceList|1-10':[
        {
          'id|1-1000': 1,
          title: '主要依据文件主要依据文件',
          'bussiness|1-10': 1,
          fileType: '111',
          professionType: '12312',
          'projectState|1-10': 2,
          status: '已完成',
          participantName: [],
          paragraph: '《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公《全国内河航道与港口布局规划(2006~ 2020年)》江西省港口集团有限公',
          'children|1-5': [
            {
              'id|1-5656565': 1,
              title: '子文件子文件',
              'bussiness|1-1666': 1,
              fileType: '22222',
              professionType: '5555555',
              'projectState|1-10': 2,
              status: '未完成',
              participantName: [],
              paragraph: ''
            }
          ]
        }
      ],
      'approvalData':{
        "errcode": 0,
        "errmsg": "成功调用load接口",
        "data": {
          "workflowCode": null,
          "workflowName": null,
          "workflowVersion": null,
          "activityCode": null,
          "activityName": null,
          "workflowInstanceId": null,
          "instanceName": "批复资料清单表",
          "workItemId": null,
          "bizSchema": {
            "id": "ff80808184746120018478af9734015a",
            "remarks": null,
            "createdTime": "2022-11-17 10:37:21",
            "modifiedTime": null,
            "deleted": false,
            "createdBy": null,
            "modifiedBy": null,
            "name": "批复资料清单表",
            "name_i18n": null,
            "code": "XTSJ_pfzlqdb",
            "icon": "h-icon-all-catalogue-o",
            "published": true,
            "businessRuleEnable": true,
            "summary": "[{\"isDataItem\":1,\"code\":\"name\"}]",
            "properties": [
              {
                "id": "ff80808184746120018478af9739015c",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "业务对象ID",
                "name_i18n": null,
                "code": "id",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 32,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": true,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478af973c015e",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "数据标题",
                "name_i18n": null,
                "code": "name",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 200,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478af97400160",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "创建人",
                "name_i18n": null,
                "code": "creater",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 5,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "选人控件"
              },
              {
                "id": "ff80808184746120018478af97420162",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "创建人部门",
                "name_i18n": null,
                "code": "createdDeptId",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 5,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "选人控件"
              },
              {
                "id": "ff80808184746120018478af97450164",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "拥有者",
                "name_i18n": null,
                "code": "owner",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 5,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "选人控件"
              },
              {
                "id": "ff80808184746120018478af974c0166",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "拥有者部门",
                "name_i18n": null,
                "code": "ownerDeptId",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 5,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "选人控件"
              },
              {
                "id": "ff80808184746120018478af974f0168",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "创建时间",
                "name_i18n": null,
                "code": "createdTime",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 3,
                "propertyLength": 4,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "日期"
              },
              {
                "id": "ff80808184746120018478af9752016a",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "修改人",
                "name_i18n": null,
                "code": "modifier",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 5,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "选人控件"
              },
              {
                "id": "ff80808184746120018478af9754016c",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "修改时间",
                "name_i18n": null,
                "code": "modifiedTime",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 3,
                "propertyLength": 4,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "日期"
              },
              {
                "id": "ff80808184746120018478af9757016e",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "流程实例ID",
                "name_i18n": null,
                "code": "workflowInstanceId",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478af97590170",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "单据号",
                "name_i18n": null,
                "code": "sequenceNo",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478af975c0172",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "单据状态",
                "name_i18n": null,
                "code": "sequenceStatus",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 64,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478af975e0174",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "部门查询编码",
                "name_i18n": null,
                "code": "ownerDeptQueryCode",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": 255,
                "defaultValue": "",
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": null,
                "defaultProperty": true,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478afc79301b7",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "生产任务单",
                "name_i18n": "",
                "code": "projectName",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478afc79701b9",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "行业类型",
                "name_i18n": "",
                "code": "business",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478afc79901bb",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "工程类型",
                "name_i18n": "",
                "code": "projectType",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478afc79c01bd",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "工程阶段",
                "name_i18n": "",
                "code": "projectState",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              },
              {
                "id": "ff80808184746120018478afc7fa01c1",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "子表",
                "name_i18n": "",
                "code": "XTSJ_approval_instance",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 8,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": {
                  "id": "ff80808184746120018478afc7fd01c3",
                  "remarks": null,
                  "createdTime": "2022-11-17 10:37:21",
                  "modifiedTime": null,
                  "deleted": false,
                  "createdBy": null,
                  "modifiedBy": null,
                  "name": "子表",
                  "name_i18n": null,
                  "code": "XTSJ_approval_instance",
                  "icon": null,
                  "published": true,
                  "businessRuleEnable": false,
                  "summary": "[{\"isDataItem\":1,\"code\":\"name\"}]",
                  "properties": [
                    {
                      "id": "ff80808184746120018478afc80001c5",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "必需批复资料名称",
                      "name_i18n": "",
                      "code": "essential",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": "",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    },
                    {
                      "id": "ff80808184746120018478afc80401c9",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "附件",
                      "name_i18n": "",
                      "code": "attachment",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 6,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": "",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "附件"
                    },
                    {
                      "id": "ff80808184746120018478aff7bf01e0",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "子表业务对象ID",
                      "name_i18n": null,
                      "code": "id",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": 32,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": true,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": null,
                      "defaultProperty": true,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    },
                    {
                      "id": "ff80808184746120018478aff7c301e2",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "子表业务对象父类ID",
                      "name_i18n": null,
                      "code": "parentId",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": 32,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": null,
                      "defaultProperty": true,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    },
                    {
                      "id": "ff80808184746120018478aff7c601e4",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "子表排序号",
                      "name_i18n": null,
                      "code": "sortKey",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 2,
                      "propertyLength": 10,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": null,
                      "defaultProperty": true,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "数值"
                    },
                    {
                      "id": "ff8080818474612001847986f1ad040b",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "辅助查询",
                      "name_i18n": "",
                      "code": "fzcx",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 9,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": "XTSJ_pfzlfzcx",
                      "relativePropertyCode": "name",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "关联表单"
                    },
                    {
                      "id": "ff8080818474612001847a80dbad04dd",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "是否必选",
                      "name_i18n": "",
                      "code": "selected",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": "",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    },
                    {
                      "id": "ff808081847ab64901847bdb1e6800f2",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "描述",
                      "name_i18n": "",
                      "code": "description",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": "",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    },
                    {
                      "id": "ff808081847ab64901847e15f787014c",
                      "remarks": null,
                      "createdTime": "2022-11-17 10:37:21",
                      "modifiedTime": null,
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "name": "单行文本",
                      "name_i18n": "",
                      "code": "ShortText1668562677785",
                      "schemaCode": "XTSJ_approval_instance",
                      "published": true,
                      "propertyType": 0,
                      "propertyLength": null,
                      "defaultValue": null,
                      "propertyIndex": false,
                      "propertyEmpty": false,
                      "subSchema": null,
                      "relativeCode": null,
                      "relativePropertyCode": "",
                      "defaultProperty": false,
                      "sortKey": null,
                      "relativeQuoteCode": null,
                      "repeated": false,
                      "quoteCodes": [],
                      "selectionJson": null,
                      "propertyTypeName": "短文本"
                    }
                  ],
                  "permGroupModels": null
                },
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "子表"
              },
              {
                "id": "ff80808184746120018478d7fccd025c",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "生产任务单",
                "name_i18n": "",
                "code": "typeId",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 9,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": "XTSJ_xmlb",
                "relativePropertyCode": "engineering_name",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "关联表单"
              },
              {
                "id": "ff808081847461200184798907fb040e",
                "remarks": null,
                "createdTime": "2022-11-17 10:37:21",
                "modifiedTime": null,
                "deleted": false,
                "createdBy": null,
                "modifiedBy": null,
                "name": "生产任务单",
                "name_i18n": "",
                "code": "projectId",
                "schemaCode": "XTSJ_pfzlqdb",
                "published": true,
                "propertyType": 0,
                "propertyLength": null,
                "defaultValue": null,
                "propertyIndex": false,
                "propertyEmpty": false,
                "subSchema": null,
                "relativeCode": null,
                "relativePropertyCode": "",
                "defaultProperty": false,
                "sortKey": null,
                "relativeQuoteCode": null,
                "repeated": false,
                "quoteCodes": [],
                "selectionJson": null,
                "propertyTypeName": "短文本"
              }
            ],
            "permGroupModels": null
          },
          "bizSheet": {
            "id": "ff80808184746120018478af977d0178",
            "remarks": null,
            "createdTime": "2022-11-15 08:28:04",
            "modifiedTime": "2022-11-16 09:59:49",
            "deleted": false,
            "createdBy": null,
            "modifiedBy": "ff80808182c9b8940182cd4a2b683985",
            "name": "批复资料清单表",
            "name_i18n": "{\"en\":\"批复资料清单表\"}",
            "code": "XTSJ_pfzlqdb",
            "icon": null,
            "schemaCode": "XTSJ_pfzlqdb",
            "published": true,
            "sortKey": 1,
            "pcUrl": null,
            "mobileUrl": null,
            "mobileIsPc": true,
            "printUrl": null,
            "printIsPc": true,
            "publishedViewJson": "[[\"title1668420931979\"],[\"creater\",\"createdTime\",\"sequenceNo\"],[\"group1668420931979\"],[\"typeId\"],[\"projectId\"],[\"business\"],[\"projectType\"],[\"projectState\"],[\"XTSJ_approval_instance\"]]",
            "draftViewJson": "[[\"title1668420931979\"],[\"creater\",\"createdTime\",\"sequenceNo\"],[\"group1668420931979\"],[\"typeId\"],[\"projectId\"],[\"business\"],[\"projectType\"],[\"projectState\"],[\"XTSJ_approval_instance\"]]",
            "publishedAttributesJson": "{\"title1668420931979\":{\"type\":203,\"key\":\"title1668420931979\",\"options\":{\"name\":\"批复资料清单表\",\"name_i18n\":{\"en\":\"批复资料清单表\"},\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\"}},\"creater\":{\"type\":101,\"key\":\"creater\",\"options\":{\"name\":\"创建人\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"mappings\":\"\"}},\"createdTime\":{\"type\":104,\"key\":\"createdTime\",\"options\":{\"name\":\"创建时间\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"format\":\"YYYY-MM-DD HH:mm:ss\"}},\"sequenceNo\":{\"type\":100,\"key\":\"sequenceNo\",\"options\":{\"name\":\"单据号\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"prefix\":\"\",\"maxLength\":\"6\",\"resetDate\":\"YEAR\",\"delimiter\":\"mark1\"}},\"group1668420931979\":{\"type\":200,\"key\":\"group1668420931979\",\"options\":{\"name\":\"业务标题\",\"style\":\"\",\"tips\":\"\",\"expand\":true,\"align\":\"\"}},\"business\":{\"type\":1,\"key\":\"business\",\"options\":{\"name\":\"行业类型\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"business\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"projectType\":{\"type\":1,\"key\":\"projectType\",\"options\":{\"name\":\"工程类型\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"projectType\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"projectState\":{\"type\":1,\"key\":\"projectState\",\"options\":{\"name\":\"工程阶段\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"projectState\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"XTSJ_approval_instance\":{\"type\":201,\"columns\":[{\"key\":\"fzcx\",\"type\":80,\"options\":{\"name\":\"辅助查询\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"fzcx\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"schemaCode\":\"XTSJ_pfzlfzcx\",\"queryCode\":\"XTSJ_pfzlfzcx\",\"displayField\":\"name\",\"mappings\":\"essential:{XTSJ_approval_instance.essential};selected:{XTSJ_approval_instance.selected};description:{XTSJ_approval_instance.description}\",\"conditions\":\"business:{business};projectState:{projectState};projectType:{projectType}\",\"mobileConditions\":\"\",\"linkMode\":true,\"selectMode\":\"popup\",\"showField\":[],\"isAuthorize\":true,\"defaultVal\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"isScan\":false,\"dataLinkage\":\"\",\"width\":150,\"relativePropertyCode\":\"name\"},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":1,\"key\":\"essential\",\"width\":\"150\",\"options\":{\"name\":\"必需批复资料名称\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"essential\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"key\":\"selected\",\"type\":7,\"options\":{\"name\":\"是否必选\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"selected\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"非必选\",\"options\":\"非必选;必选\",\"widgetType\":\"\",\"displayEmpty\":true,\"emptyValue\":\"请选择\",\"multi\":false,\"dataLinkage\":\"\",\"width\":150,\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"shortTextStitch\":\"\",\"isScan\":false},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":1,\"key\":\"description\",\"width\":\"150\",\"options\":{\"name\":\"描述\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"description\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":9,\"key\":\"attachment\",\"width\":600,\"options\":{\"name\":\"附件\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"attachment\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"limit\":\"200M\",\"batch\":true,\"onUpload\":\"\",\"onDelete\":\"\",\"widgetType\":\"\",\"fileTypes\":\"\",\"dataLinkage\":\"\",\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"key\":\"ShortText1668562677785\",\"type\":1,\"options\":{\"name\":\"单行文本\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"}],\"key\":\"XTSJ_approval_instance\",\"options\":{\"name\":\"子表\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"XTSJ_approval_instance\",\"width\":150,\"widgetType\":\"子表\",\"rows\":\"2\",\"editable\":true,\"isEmptyRow\":false,\"importable\":true,\"exportable\":true,\"importFormRelevanceForm\":\"\",\"showTotal\":false,\"showAllEdit\":false,\"sheetFiters\":\"[]\",\"displayFormula\":\"\",\"onAddRow\":\"\",\"onDeleteRow\":\"\",\"mobileDisplayMode\":\"page\"},\"actions\":[]},\"typeId\":{\"key\":\"typeId\",\"type\":80,\"options\":{\"name\":\"生产任务单\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"typeId\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"schemaCode\":\"XTSJ_xmlb\",\"queryCode\":\"XTSJ_xmlb\",\"displayField\":\"engineering_name\",\"mappings\":\"engineering_name:{projectName};industryType:{business};projectType:{projectType};engineering_stage:{projectState}\",\"conditions\":\"\",\"mobileConditions\":\"\",\"linkMode\":true,\"selectMode\":\"popup\",\"showField\":[],\"isAuthorize\":true,\"defaultVal\":\"id == {projectId}\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"isScan\":false,\"dataLinkage\":\"\",\"width\":150,\"relativePropertyCode\":\"engineering_name\"}},\"projectId\":{\"type\":1,\"key\":\"projectId\",\"options\":{\"name\":\"生产任务单\",\"name_i18n\":\"\",\"visible\":false,\"dataItemName\":\"projectId\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}}}",
            "draftAttributesJson": "{\"title1668420931979\":{\"type\":203,\"key\":\"title1668420931979\",\"options\":{\"name\":\"批复资料清单表\",\"name_i18n\":{\"en\":\"批复资料清单表\"},\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\"}},\"creater\":{\"type\":101,\"key\":\"creater\",\"options\":{\"name\":\"创建人\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"mappings\":\"\"}},\"createdTime\":{\"type\":104,\"key\":\"createdTime\",\"options\":{\"name\":\"创建时间\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"format\":\"YYYY-MM-DD HH:mm:ss\"}},\"sequenceNo\":{\"type\":100,\"key\":\"sequenceNo\",\"options\":{\"name\":\"单据号\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"\",\"widgetType\":\"\",\"prefix\":\"\",\"maxLength\":\"6\",\"resetDate\":\"YEAR\",\"delimiter\":\"mark1\"}},\"group1668420931979\":{\"type\":200,\"key\":\"group1668420931979\",\"options\":{\"name\":\"业务标题\",\"style\":\"\",\"tips\":\"\",\"expand\":true,\"align\":\"\"}},\"business\":{\"type\":1,\"key\":\"business\",\"options\":{\"name\":\"行业类型\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"business\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"projectType\":{\"type\":1,\"key\":\"projectType\",\"options\":{\"name\":\"工程类型\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"projectType\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"projectState\":{\"type\":1,\"key\":\"projectState\",\"options\":{\"name\":\"工程阶段\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"projectState\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}},\"XTSJ_approval_instance\":{\"type\":201,\"columns\":[{\"key\":\"fzcx\",\"type\":80,\"options\":{\"name\":\"辅助查询\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"fzcx\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"schemaCode\":\"XTSJ_pfzlfzcx\",\"queryCode\":\"XTSJ_pfzlfzcx\",\"displayField\":\"name\",\"mappings\":\"essential:{XTSJ_approval_instance.essential};selected:{XTSJ_approval_instance.selected};description:{XTSJ_approval_instance.description}\",\"conditions\":\"business:{business};projectState:{projectState};projectType:{projectType}\",\"mobileConditions\":\"\",\"linkMode\":true,\"selectMode\":\"popup\",\"showField\":[],\"isAuthorize\":true,\"defaultVal\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"isScan\":false,\"dataLinkage\":\"\",\"width\":150,\"relativePropertyCode\":\"name\"},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":1,\"key\":\"essential\",\"width\":\"150\",\"options\":{\"name\":\"必需批复资料名称\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"essential\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"key\":\"selected\",\"type\":7,\"options\":{\"name\":\"是否必选\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"selected\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"非必选\",\"options\":\"非必选;必选\",\"widgetType\":\"\",\"displayEmpty\":true,\"emptyValue\":\"请选择\",\"multi\":false,\"dataLinkage\":\"\",\"width\":150,\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"shortTextStitch\":\"\",\"isScan\":false},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":1,\"key\":\"description\",\"width\":\"150\",\"options\":{\"name\":\"描述\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"description\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"type\":9,\"key\":\"attachment\",\"width\":600,\"options\":{\"name\":\"附件\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"attachment\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"limit\":\"200M\",\"batch\":true,\"onUpload\":\"\",\"onDelete\":\"\",\"widgetType\":\"\",\"fileTypes\":\"\",\"dataLinkage\":\"\",\"width\":150},\"parentKey\":\"XTSJ_approval_instance\"},{\"key\":\"ShortText1668562677785\",\"type\":1,\"options\":{\"name\":\"单行文本\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150},\"width\":150,\"parentKey\":\"XTSJ_approval_instance\"}],\"key\":\"XTSJ_approval_instance\",\"options\":{\"name\":\"子表\",\"name_i18n\":\"\",\"visible\":true,\"style\":\"\",\"tips\":\"\",\"dataItemName\":\"XTSJ_approval_instance\",\"width\":150,\"widgetType\":\"子表\",\"rows\":\"2\",\"editable\":true,\"isEmptyRow\":false,\"importable\":true,\"exportable\":true,\"importFormRelevanceForm\":\"\",\"showTotal\":false,\"showAllEdit\":false,\"sheetFiters\":\"[]\",\"displayFormula\":\"\",\"onAddRow\":\"\",\"onDeleteRow\":\"\",\"mobileDisplayMode\":\"page\"},\"actions\":[]},\"typeId\":{\"key\":\"typeId\",\"type\":80,\"options\":{\"name\":\"生产任务单\",\"name_i18n\":\"\",\"visible\":true,\"dataItemName\":\"typeId\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"schemaCode\":\"XTSJ_xmlb\",\"queryCode\":\"XTSJ_xmlb\",\"displayField\":\"engineering_name\",\"mappings\":\"engineering_name:{projectName};industryType:{business};projectType:{projectType};engineering_stage:{projectState}\",\"conditions\":\"\",\"mobileConditions\":\"\",\"linkMode\":true,\"selectMode\":\"popup\",\"showField\":[],\"isAuthorize\":true,\"defaultVal\":\"id == {projectId}\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"isScan\":false,\"dataLinkage\":\"\",\"width\":150,\"relativePropertyCode\":\"engineering_name\"}},\"projectId\":{\"type\":1,\"key\":\"projectId\",\"options\":{\"name\":\"生产任务单\",\"name_i18n\":\"\",\"visible\":false,\"dataItemName\":\"projectId\",\"widgetType\":\"\",\"style\":\"\",\"tips\":\"\",\"displayFormula\":\"\",\"onChange\":\"\",\"requiredFormula\":\"\",\"readonlyFormula\":false,\"defaultValue\":\"\",\"regexp\":\"\",\"regexpText\":\"\",\"placeholder\":\"请输入\",\"maxLength\":200,\"noRepeat\":false,\"dataLinkage\":\"\",\"shortTextStitch\":\"\",\"isScan\":false,\"width\":150}}}",
            "draftHtmlJson": "[{\"tagName\":\"style\",\"innerHTML\":\"\\n\",\"id\":null,\"attrs\":[]},{\"tagName\":\"section\",\"innerHTML\":null,\"id\":\"toolbar\",\"attrs\":[{\"name\":\"id\",\"value\":\"toolbar\"}]},{\"tagName\":\"section\",\"innerHTML\":null,\"id\":\"template\",\"attrs\":[{\"name\":\"type\",\"value\":\"template\"},{\"name\":\"id\",\"value\":\"template\"}]},{\"tagName\":\"script\",\"innerHTML\":\"\\n    (function(form){\\n        /**\\n         * 用户自定义JS区域\\n         */\\n        /**\\n         * 事件绑定，form.on\\n         * @param eventType 事件类型\\n         * @params function 事件\\n         * @param  cover    true, false 是否覆盖root的生命周期 默认不覆盖 \\n         */\\n        //数据加载后，渲染之前，this为window\\n        form.on('onLoad',function(data, dataPermission){},'cover');\\n        //渲染完成后\\n        form.on('onRendered',function(data){});\\n        //内置校验完成后，返回false阻止提交\\n        form.on('onValidate',function(action,data){});\\n        //操作前（包含自定义按钮）执行，返回false阻止按钮操作\\n        form.on('onPreAction',function(action,data){});\\n        //自定义按钮执行\\n        form.on('onCustomAction',function(action,data){});\\n        //操作完成后执行\\n        form.on('onActionDone',function(action,data,httpRes){});\\n    })\\n\",\"id\":\"customScript\",\"attrs\":[{\"name\":\"id\",\"value\":\"customScript\"}]}]",
            "publishedHtmlJson": "[{\"tagName\":\"style\",\"innerHTML\":\"\\n\",\"id\":null,\"attrs\":[]},{\"tagName\":\"section\",\"innerHTML\":null,\"id\":\"toolbar\",\"attrs\":[{\"name\":\"id\",\"value\":\"toolbar\"}]},{\"tagName\":\"section\",\"innerHTML\":null,\"id\":\"template\",\"attrs\":[{\"name\":\"type\",\"value\":\"template\"},{\"name\":\"id\",\"value\":\"template\"}]},{\"tagName\":\"script\",\"innerHTML\":\"\\n    (function(form){\\n        /**\\n         * 用户自定义JS区域\\n         */\\n        /**\\n         * 事件绑定，form.on\\n         * @param eventType 事件类型\\n         * @params function 事件\\n         * @param  cover    true, false 是否覆盖root的生命周期 默认不覆盖 \\n         */\\n        //数据加载后，渲染之前，this为window\\n        form.on('onLoad',function(data, dataPermission){},'cover');\\n        //渲染完成后\\n        form.on('onRendered',function(data){});\\n        //内置校验完成后，返回false阻止提交\\n        form.on('onValidate',function(action,data){});\\n        //操作前（包含自定义按钮）执行，返回false阻止按钮操作\\n        form.on('onPreAction',function(action,data){});\\n        //自定义按钮执行\\n        form.on('onCustomAction',function(action,data){});\\n        //操作完成后执行\\n        form.on('onActionDone',function(action,data,httpRes){});\\n    })\\n\",\"id\":\"customScript\",\"attrs\":[{\"name\":\"id\",\"value\":\"customScript\"}]}]",
            "draftActionsJson": "[]",
            "publishedActionsJson": "[]",
            "externalLinkAble": false,
            "shortCode": null,
            "printTemplateJson": "[{\"sheetCode\":\"XTSJ_pfzlqdb_print\",\"name_i18n\":\"{\\\"en\\\":\\\"批复资料清单表\\\"}\",\"name\":\"批复资料清单表\"}]",
            "qrCodeAble": null,
            "pdfAble": null,
            "tempAuthSchemaCodes": "XTSJ_pfzlfzcx_XTSJ_pfzlfzcx,XTSJ_xmlb_XTSJ_xmlb",
            "borderMode": null,
            "layoutType": null,
            "formComment": false,
            "subTip": null,
            "publishBy": null,
            "version": null,
            "tempAuthSchemaCodeSet": [
              "XTSJ_pfzlfzcx_XTSJ_pfzlfzcx",
              "XTSJ_xmlb_XTSJ_xmlb"
            ],
            "sheetType": 0,
            "sheetTypeName": "默认表单"
          },
          "bizObject": {
            "loadedFromDb": true,
            "schemaCode": "XTSJ_pfzlqdb",
            "status": null,
            "data": {
              "owner": [
                {
                  "excelType": null,
                  "id": "ff80808182c9b8940182cd4a2b683985",
                  "type": 3,
                  "name": "黄诗阳",
                  "imgUrl": null,
                  "departmentId": "ff80808183e022a10183e4f3aaba18fc",
                  "departments": [
                    {
                      "id": "ff80808183e022a10183e4f3aaba18fc",
                      "remarks": null,
                      "createdTime": "2022-10-17 15:58:38",
                      "modifiedTime": "2022-10-17 15:58:38",
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "extend1": null,
                      "extend2": null,
                      "extend3": null,
                      "extend4": null,
                      "extend5": null,
                      "name": "软件研发",
                      "managerId": null,
                      "parentId": "ff80808183e022a10183e480cc7b16df",
                      "calendarId": null,
                      "sortKey": 3,
                      "leaf": true,
                      "sourceId": "CP221017035837348",
                      "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                      "dingDeptManagerId": null,
                      "parent": null,
                      "children": [],
                      "employees": null,
                      "unitType": 1,
                      "isShow": true,
                      "deptType": 2,
                      "corpId": "main",
                      "enabled": true,
                      "relatedOrgType": null,
                      "relatedSyncType": null,
                      "isCorpRootNode": false,
                      "displayOption": true,
                      "hasPermission": false
                    }
                  ],
                  "parentId": null
                }
              ],
              "modifiedTime": "2022-11-16 16:28:55",
              "createdDeptId": [
                {
                  "excelType": null,
                  "id": "ff80808183e022a10183e4f3aaba18fc",
                  "type": 1,
                  "name": "软件研发",
                  "imgUrl": null,
                  "departmentId": null,
                  "departments": null,
                  "parentId": "ff80808183e022a10183e480cc7b16df"
                }
              ],
              "XTSJ_approval_instance": [
                {
                  "sortKey": 0.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "01cedbcc6f9044d4b71b069e52bd9531"
                  },
                  "description": null,
                  "id": "0e329701007f404caa41b40a36993c26",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "洪水影响评价、涉河建设方案（仅河湖）"
                },
                {
                  "sortKey": 10.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "7aabdfc042f84f43ad57041b98270879"
                  },
                  "description": null,
                  "id": "2e4f410503aa4c0c9c8e8ad9101628c5",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "岸线使用合理性评估（国务院或国家发改委审批、核准的港口建设项目、交通运输部投资的港口项目除外）"
                },
                {
                  "sortKey": 20.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "57258ac0339c45fd9aafaf49a84da98c"
                  },
                  "description": null,
                  "id": "4e17e4876bef44208891a83f8630dfae",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "海域使用论证（仅海港）"
                },
                {
                  "sortKey": 30.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "13c3336023f143fbb64d091510c71dbc"
                  },
                  "description": null,
                  "id": "619f6ea0025849cebcdfd217a34aab9f",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "地质灾害危险性评估报告（项目位于地质灾害易发区）"
                },
                {
                  "sortKey": 40.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "2f7d70603c694e5ba26aa53735fc190e"
                  },
                  "description": null,
                  "id": "677a65c45f234f6f8436454f7ad38d82",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "节能评估（根据能耗情况决定是否有该项）"
                },
                {
                  "sortKey": 50.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "2704d39cc13a40b6854d4ab6aa987de4"
                  },
                  "description": null,
                  "id": "6a189b9f12ca4256a67f624cbf72b1d5",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "水土保持方案、表（根据挖填方规模情况决定是否有该项）"
                },
                {
                  "sortKey": 60.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "c34c88b24f954e4c9407d9d4221049e8"
                  },
                  "description": null,
                  "id": "76d2f6ae90874bab94d3fc3f8b600e70",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "必选",
                  "essential": "环境影响评价"
                },
                {
                  "sortKey": 70.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "11a25a710e5e43a2a550770a3cac29b6"
                  },
                  "description": null,
                  "id": "8f2dab8451f5419c84ca11dbd75e8937",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "必选",
                  "essential": "用地预审意见"
                },
                {
                  "sortKey": 80.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "47417511e8654755ba0ab89c31f16192"
                  },
                  "description": null,
                  "id": "ae3f140f5aea454cbd60b35f252d46bc",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "必选",
                  "essential": "航道通航条件影响评价"
                },
                {
                  "sortKey": 90.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "2495fb725f44466380c1bfe9a05adb0d"
                  },
                  "description": "社会稳定风险评估",
                  "id": "cb552544b811429790b5e844f718d907",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "必选",
                  "essential": "社会稳定风险评估"
                },
                {
                  "sortKey": 100.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "f322cd14a4aa4daeb719ef2c7b1a8721"
                  },
                  "description": null,
                  "id": "ce6af919995e42b9adb61605fe6b4211",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "必选",
                  "essential": "主管部门选址意见书"
                },
                {
                  "sortKey": 110.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "fce00967d59940cc88f43178f5399978"
                  },
                  "description": null,
                  "id": "e3eebbfd04164eb7ba3c65dd93c20598",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "压覆矿产资源调查评价报告（项目压覆区内是否有重要矿产资源）"
                },
                {
                  "sortKey": 120.0,
                  "ShortText1668562677785": null,
                  "fzcx": {
                    "schemaCode": "XTSJ_pfzlfzcx",
                    "propertyType": 0,
                    "displayCode": "name",
                    "name": "批复资料库清单项",
                    "id": "e4a5e1703d774f22b1187868988883b5"
                  },
                  "description": null,
                  "id": "f7a34268cfcb410ab4ab5daf2658068e",
                  "parentId": "d90888cbbc0a4a38a77788ac5f217db6",
                  "selected": "非必选",
                  "essential": "安全预评价、安全条件论证 （危险品码头）"
                }
              ],
              "business": "水运行业",
              "modifier": [
                {
                  "excelType": null,
                  "id": "ff80808182c9b8940182cd4a2b683985",
                  "type": 3,
                  "name": "黄诗阳",
                  "imgUrl": null,
                  "departmentId": "ff80808183e022a10183e4f3aaba18fc",
                  "departments": [
                    {
                      "id": "ff80808183e022a10183e4f3aaba18fc",
                      "remarks": null,
                      "createdTime": "2022-10-17 15:58:38",
                      "modifiedTime": "2022-10-17 15:58:38",
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "extend1": null,
                      "extend2": null,
                      "extend3": null,
                      "extend4": null,
                      "extend5": null,
                      "name": "软件研发",
                      "managerId": null,
                      "parentId": "ff80808183e022a10183e480cc7b16df",
                      "calendarId": null,
                      "sortKey": 3,
                      "leaf": true,
                      "sourceId": "CP221017035837348",
                      "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                      "dingDeptManagerId": null,
                      "parent": null,
                      "children": [],
                      "employees": null,
                      "unitType": 1,
                      "isShow": true,
                      "deptType": 2,
                      "corpId": "main",
                      "enabled": true,
                      "relatedOrgType": null,
                      "relatedSyncType": null,
                      "isCorpRootNode": false,
                      "displayOption": true,
                      "hasPermission": false
                    }
                  ],
                  "parentId": null
                }
              ],
              "projectType": "液体化工",
              "ownerDeptId": [
                {
                  "excelType": null,
                  "id": "ff80808183e022a10183e4f3aaba18fc",
                  "type": 1,
                  "name": "软件研发",
                  "imgUrl": null,
                  "departmentId": null,
                  "departments": null,
                  "parentId": "ff80808183e022a10183e480cc7b16df"
                }
              ],
              "projectState": "施工图设计",
              "sequenceNo": "2022-080209",
              "sequenceStatus": "COMPLETED",
              "ownerDeptQueryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
              "name": "批复资料清单表",
              "creater": [
                {
                  "excelType": null,
                  "id": "ff80808182c9b8940182cd4a2b683985",
                  "type": 3,
                  "name": "黄诗阳",
                  "imgUrl": null,
                  "departmentId": "ff80808183e022a10183e4f3aaba18fc",
                  "departments": [
                    {
                      "id": "ff80808183e022a10183e4f3aaba18fc",
                      "remarks": null,
                      "createdTime": "2022-10-17 15:58:38",
                      "modifiedTime": "2022-10-17 15:58:38",
                      "deleted": false,
                      "createdBy": null,
                      "modifiedBy": null,
                      "extend1": null,
                      "extend2": null,
                      "extend3": null,
                      "extend4": null,
                      "extend5": null,
                      "name": "软件研发",
                      "managerId": null,
                      "parentId": "ff80808183e022a10183e480cc7b16df",
                      "calendarId": null,
                      "sortKey": 3,
                      "leaf": true,
                      "sourceId": "CP221017035837348",
                      "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                      "dingDeptManagerId": null,
                      "parent": null,
                      "children": [],
                      "employees": null,
                      "unitType": 1,
                      "isShow": true,
                      "deptType": 2,
                      "corpId": "main",
                      "enabled": true,
                      "relatedOrgType": null,
                      "relatedSyncType": null,
                      "isCorpRootNode": false,
                      "displayOption": true,
                      "hasPermission": false
                    }
                  ],
                  "parentId": null
                }
              ],
              "createdTime": "2022-11-16 12:19:14",
              "typeId": {
                "schemaCode": "XTSJ_xmlb",
                "propertyType": 0,
                "displayCode": "engineering_name",
                "id": "071c4956b06341b281f1f7a69b9d9898",
                "engineering_name": "测试批复资料触发功能"
              },
              "id": "d90888cbbc0a4a38a77788ac5f217db6",
              "projectName": "测试批复资料触发功能",
              "workflowInstanceId": "",
              "projectId": "071c4956b06341b281f1f7a69b9d9898"
            },
            "owner": {
              "excelType": null,
              "id": "ff80808182c9b8940182cd4a2b683985",
              "type": 3,
              "name": "黄诗阳",
              "imgUrl": null,
              "departmentId": "ff80808183e022a10183e4f3aaba18fc",
              "departments": [
                {
                  "id": "ff80808183e022a10183e4f3aaba18fc",
                  "remarks": null,
                  "createdTime": "2022-10-17 15:58:38",
                  "modifiedTime": "2022-10-17 15:58:38",
                  "deleted": false,
                  "createdBy": null,
                  "modifiedBy": null,
                  "extend1": null,
                  "extend2": null,
                  "extend3": null,
                  "extend4": null,
                  "extend5": null,
                  "name": "软件研发",
                  "managerId": null,
                  "parentId": "ff80808183e022a10183e480cc7b16df",
                  "calendarId": null,
                  "sortKey": 3,
                  "leaf": true,
                  "sourceId": "CP221017035837348",
                  "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                  "dingDeptManagerId": null,
                  "parent": null,
                  "children": [],
                  "employees": null,
                  "unitType": 1,
                  "isShow": true,
                  "deptType": 2,
                  "corpId": "main",
                  "enabled": true,
                  "relatedOrgType": null,
                  "relatedSyncType": null,
                  "isCorpRootNode": false,
                  "displayOption": true,
                  "hasPermission": false
                }
              ],
              "parentId": null
            },
            "creater": {
              "excelType": null,
              "id": "ff80808182c9b8940182cd4a2b683985",
              "type": 3,
              "name": "黄诗阳",
              "imgUrl": null,
              "departmentId": "ff80808183e022a10183e4f3aaba18fc",
              "departments": [
                {
                  "id": "ff80808183e022a10183e4f3aaba18fc",
                  "remarks": null,
                  "createdTime": "2022-10-17 15:58:38",
                  "modifiedTime": "2022-10-17 15:58:38",
                  "deleted": false,
                  "createdBy": null,
                  "modifiedBy": null,
                  "extend1": null,
                  "extend2": null,
                  "extend3": null,
                  "extend4": null,
                  "extend5": null,
                  "name": "软件研发",
                  "managerId": null,
                  "parentId": "ff80808183e022a10183e480cc7b16df",
                  "calendarId": null,
                  "sortKey": 3,
                  "leaf": true,
                  "sourceId": "CP221017035837348",
                  "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                  "dingDeptManagerId": null,
                  "parent": null,
                  "children": [],
                  "employees": null,
                  "unitType": 1,
                  "isShow": true,
                  "deptType": 2,
                  "corpId": "main",
                  "enabled": true,
                  "relatedOrgType": null,
                  "relatedSyncType": null,
                  "isCorpRootNode": false,
                  "displayOption": true,
                  "hasPermission": false
                }
              ],
              "parentId": null
            },
            "createdDeptId": {
              "excelType": null,
              "id": "ff80808183e022a10183e4f3aaba18fc",
              "type": 1,
              "name": "软件研发",
              "imgUrl": null,
              "departmentId": null,
              "departments": null,
              "parentId": "ff80808183e022a10183e480cc7b16df"
            },
            "ownerDeptId": {
              "excelType": null,
              "id": "ff80808183e022a10183e4f3aaba18fc",
              "type": 1,
              "name": "软件研发",
              "imgUrl": null,
              "departmentId": null,
              "departments": null,
              "parentId": "ff80808183e022a10183e480cc7b16df"
            },
            "modifier": {
              "excelType": null,
              "id": "ff80808182c9b8940182cd4a2b683985",
              "type": 3,
              "name": "黄诗阳",
              "imgUrl": null,
              "departmentId": "ff80808183e022a10183e4f3aaba18fc",
              "departments": [
                {
                  "id": "ff80808183e022a10183e4f3aaba18fc",
                  "remarks": null,
                  "createdTime": "2022-10-17 15:58:38",
                  "modifiedTime": "2022-10-17 15:58:38",
                  "deleted": false,
                  "createdBy": null,
                  "modifiedBy": null,
                  "extend1": null,
                  "extend2": null,
                  "extend3": null,
                  "extend4": null,
                  "extend5": null,
                  "name": "软件研发",
                  "managerId": null,
                  "parentId": "ff80808183e022a10183e480cc7b16df",
                  "calendarId": null,
                  "sortKey": 3,
                  "leaf": true,
                  "sourceId": "CP221017035837348",
                  "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
                  "dingDeptManagerId": null,
                  "parent": null,
                  "children": [],
                  "employees": null,
                  "unitType": 1,
                  "isShow": true,
                  "deptType": 2,
                  "corpId": "main",
                  "enabled": true,
                  "relatedOrgType": null,
                  "relatedSyncType": null,
                  "isCorpRootNode": false,
                  "displayOption": true,
                  "hasPermission": false
                }
              ],
              "parentId": null
            },
            "name": "批复资料清单表",
            "id": "d90888cbbc0a4a38a77788ac5f217db6",
            "ownerDeptQueryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
            "workflowInstanceId": "",
            "sequenceStatus": "COMPLETED",
            "createdTime": "2022-11-16 12:19:14",
            "modifiedTime": "2022-11-16 16:28:55",
            "sequenceNo": "2022-080209",
            "sheetCode": null
          },
          "formPermission": {
            "actionPermission": {
              "submit": false,
              "cancel": false,
              "edit": true,
              "editOwner": true,
              "save": false,
              "print": true,
              "delete": false,
              "agree": false,
              "disAgree": false,
              "showReject": false,
              "urge": false,
              "adjustParticipant": false,
              "finishInstance": false,
              "rejectToActivityCode": "",
              "rejectToFixded": false,
              "assist": false,
              "forward": false,
              "circulate": false,
              "retrieve": false,
              "reject": false,
              "rejectToStart": false
            },
            "dataPermissions": {
              "owner": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "owner",
                "subDataPermission": null
              },
              "modifiedTime": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "modifiedTime",
                "subDataPermission": null
              },
              "createdDeptId": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "createdDeptId",
                "subDataPermission": null
              },
              "XTSJ_approval_instance": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "XTSJ_approval_instance",
                "subDataPermission": [
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "essential",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "attachment",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "id",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "parentId",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "sortKey",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "fzcx",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "selected",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "description",
                    "subDataPermission": null
                  },
                  {
                    "v": true,
                    "e": false,
                    "r": false,
                    "propertyCode": "ShortText1668562677785",
                    "subDataPermission": null
                  }
                ]
              },
              "business": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "business",
                "subDataPermission": null
              },
              "modifier": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "modifier",
                "subDataPermission": null
              },
              "projectType": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "projectType",
                "subDataPermission": null
              },
              "ownerDeptId": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "ownerDeptId",
                "subDataPermission": null
              },
              "projectState": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "projectState",
                "subDataPermission": null
              },
              "sequenceNo": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "sequenceNo",
                "subDataPermission": null
              },
              "sequenceStatus": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "sequenceStatus",
                "subDataPermission": null
              },
              "ownerDeptQueryCode": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "ownerDeptQueryCode",
                "subDataPermission": null
              },
              "name": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "name",
                "subDataPermission": null
              },
              "creater": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "creater",
                "subDataPermission": null
              },
              "createdTime": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "createdTime",
                "subDataPermission": null
              },
              "typeId": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "typeId",
                "subDataPermission": null
              },
              "id": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "id",
                "subDataPermission": null
              },
              "projectName": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "projectName",
                "subDataPermission": null
              },
              "workflowInstanceId": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "workflowInstanceId",
                "subDataPermission": null
              },
              "projectId": {
                "v": true,
                "e": false,
                "r": false,
                "propertyCode": "projectId",
                "subDataPermission": null
              }
            }
          },
          "properties": null,
          "departments": [
            {
              "id": "ff80808183e022a10183e4f3aaba18fc",
              "remarks": null,
              "createdTime": "2022-10-17 15:58:38",
              "modifiedTime": "2022-10-17 15:58:38",
              "deleted": false,
              "createdBy": null,
              "modifiedBy": null,
              "extend1": null,
              "extend2": null,
              "extend3": null,
              "extend4": null,
              "extend5": null,
              "name": "软件研发",
              "managerId": null,
              "parentId": "ff80808183e022a10183e480cc7b16df",
              "calendarId": null,
              "sortKey": 3,
              "leaf": true,
              "sourceId": "CP221017035837348",
              "queryCode": "1_1#CP221017111535000#CP221017111558998#CP221017015309078#CP221017035837348",
              "dingDeptManagerId": null,
              "parent": null,
              "children": [],
              "employees": null,
              "unitType": 1,
              "isShow": true,
              "deptType": 2,
              "corpId": "main",
              "enabled": true,
              "relatedOrgType": null,
              "relatedSyncType": null,
              "isCorpRootNode": false,
              "displayOption": true,
              "hasPermission": false
            }
          ],
          "workflowTokenId": null,
          "workflowInstanceIsSubmit": false,
          "commentInfo": null,
          "logInfoList": null
        },
        "traceId": "8A659702D8A64BD18E60649B16B5A190"
      },
      'years': ['2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022'],
      'projectInfo': {
        totalHits: 10,
        totalPage: 10,
        nextPage: 1,
        pageNum: 1,
        'hits|10-20':[
          {
            'id|1-10000':1,
            "engineeringName": "芜湖LNG项目",
            "engineeringLocation": "安徽省芜湖市",
            "engineeringNumber": "WHLNG-2022",
            "industryType": "水运行业",
            "projectType": "液体化工",
            "mainManufacturer": null,
            "year": "2021",
            "favorite": false,
            "picUrl": "https://upload-images.jianshu.io/upload_images/5809200-a99419bb94924e6d.jpg",
            "produceTasks|1-5": [
              {
                "id": "90c3b400cb654e658213050c53794da6",
                "glid": "52867b6b002f46ebb788b390c36b858a",
                "engineeringStage": "施工图设计",
                "projectManager": null,
                "manufactureStatus": "项目运行",
                "currentHandler": "周玥",
                "planStartTime": "2022-01-10",
                "planEndTime": "2022-02-26",
                "planDuration": "48",
                "notesURL": "notes://nt2@jey/__482580AD00053F0E.nsf/0/B184D864D376BEE5482588310005BC0E?OpenDocument"
              }
            ]
          }
        ]
      },
      'opinions|1-10': [
        {
          'id|1-12000': 1,
          workoutlineId: '',
          createdTime: '',
          userId: '',
          userName: '',
          opinion: '',
          signFlag: true,
          signers: ['张三','李四'],
          unsigners: ['张三','李四'],
          type: '',
        }
      ],
      'projectList|1-10': [
        {
          "id|1-1000": 1,
          "professions|1-5": [
            {
              "designTasks|1-5": [
                {
                  "id|1-100000": 2,
                  "state": "",
                  "taskName": "XXXXXXXXXX专业-YY任务"
                }
              ],
              "outlineDownloadUrl": "",
              "outlineExist": false,
              "outlinePreviewUrl": "",
              "profession": "XXXXXXXXXX专业-专业提纲"
            }
          ],
          "taskName": "生产任务任务单生产任务单生产"
        }
      ],
      'task': {
        "achievements|10-20": [
          {
            "comments|1-5": [
              {
                "auditTime": "2023-04-13T18:36:21",
                "auditor": "周玥",
                "bimUrl": "http://localhost:9100/XTSJ/ModelAnnotation?appCode=XTSJ&personId=ff80808183ca4a7d0183d114437a0695&workflowInstanceId=9a9f7ca46aaa44a1870c97e4db91179b&designFileId=c44c070917254dc3a0f2af4eaaef1582&name=%E9%99%86%E5%9F%9F%E5%B9%B3%E9%9D%A2%E5%B8%83%E7%BD%AE%E5%9B%BE%EF%BC%88%E7%AC%AC%E4%BA%8C%E6%96%B9%E6%A1%88%EF%BC%893.dwg&VaultID=407051301094429db849f5df296236ec&ModelID=54ec9151-dde3-4f28-8fd6-f93ba282b523&annotationId=9e23d638-334d-6365-70a9-d7254b84018d&iframeURL=http%3A%2F%2F10.20.105.75%3A8088%2FBIMe%2Findex.html&FileName=0",
                capturePicUrl:'http://10.20.90.217/api/api/aliyun/download?refId=217415586939423ea0c42f08964847bc',
                "comment": "图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误图纸有错误",
                "id|1-1000": 2,
                "title": "批注批注批注批注批注批注批批注批注批注批注批注批注批注批批注注批注批注批注批注批注批注批批注注注"
              }
            ],
            "fileName": "4#设计成果设计成果.dwg",
            "id|1-1000": 2,
            "path": "",
            "refId": "",
            "type": "",
            lightStates: function (){
              //@ts-ignore
              return this.id<300?'完成':this.id<600?'进行中':this.id<850?'未处理':''
            }
          }
        ],
        "id|1-1000": 2,
        "state": "",
        "taskName": "4#设计成果设计成果.dwg"
      },
      'achievements': [
        {
          downloadUrl: '',
          featureExtension: '',
          fileName: '',
          fileType: '',
          id: '',
          lightweightUrl: '',
          parentId: '',
          path: '',
          previewUrl: '',
          refId: '',
          status: '',
          uploadTime: '',
          workload: '',
          sequenceStatus: 'DRAFT',
          sjrwdId: '',
          schemaCode: '',
          fileSize: '',
          mergeAttachment: ''
        }
      ],
      'toDoList|15-50':[{
        'id|1-6': 1,
        engineeringName: '项目名称',
        workflowName: function (){
          //@ts-ignore
          return this.id===1?"生产任务单":this.id===2?'工作大纲':this.id===3?"专业任务":this.id===4?'专业提纲':this.id===5?'设计任务':'外来资料'
        },
        projectManager: '项目经理',
        activityName: '流程节点',
        startTime: '2023-06-20 10:04:23',
        "pendingType": function (){
          //@ts-ignore
          return this.id===1?"xmlb":this.id===2?'xmsqb':this.id===3?"zyrwd":this.id===4?'zysjtg':this.id===5?'sjrwd':'wlzl'
        },
        workflowCode: function () {
          //@ts-ignore
          return this.id===1?"XTSJ_xmlb":this.id===2?'XTSJ_xmsqb':this.id===3?"XTSJ_zyrwd_workflow":this.id===4?'XTSJ_zysjtg_workflow':this.id===5?'XTSJ_sjrwd_workflow':'XTSJ_wlzl'
        },
        projectId: function () {
          //@ts-ignore
          return this.id===1?"0c8500f4c8e74f25b7289608be73fad3":this.id===2?'6b2c799e7f34442db56cb034f0397b1b':this.id===3?"fec5474a3a25476a93276e4d9c180586":this.id===4?'fec5474a3a25476a93276e4d9c180586':this.id===5?'fec5474a3a25476a93276e4d9c180586':'fec5474a3a25476a93276e4d9c180586'
        },
        extendId: function () {
          //@ts-ignore
          return this.id===1?"0c8500f4c8e74f25b7289608be73fad3":this.id===2?'d971150235a14637bf5a762c615b9b98':this.id===3?"7000c5a7f1bc4625a44d9d8ba7957456":this.id===4?'601c9afa89c742c2b722e34c95d5132e':this.id===5?'3dd26105944f462fb209ad2ac45447a2':'f3c47918f40745259ff00ead33923ede'
        },
      }],
      'myWorkItemsNumber': {
        'projectNumber|1-120': 0,
        'outlinesNumber|1-120': 0,
        'professionTaskNumber|1-120': 0,
        'professionOutlineNumber|1-120': 0,
        'designTaskNumber|1-120': 0,
        'externalMaterialNumber|1-120': 0,
        'designReviewName|1-120': 0,
        'technicalSchemeName|1-120': 0,
        'allTaskName|1-120200': 0,
      },
      'myCompletedWorkNumber':{
        'projectNumber|1-120': 0,
        'outlinesNumber|1-120': 0,
        'professionTaskNumber|1-120': 0,
        'professionOutlineNumber|1-120': 0,
        'designTaskNumber|1-120': 0,
        'externalMaterialNumber|1-120': 0,
        'designReviewName|1-120': 0,
        'technicalSchemeName|1-120': 0,
        'allTaskName|1-120200': 0,
      },
      'projectData': {
        "errcode": 0,
        "errmsg": "OK",
        'data|1-20':[
          {
            'count|1-200':1,
            "dynamicColumnType": null,
            "dynamicColumn": "2023年",
            "isLeafNode": true,
            "dynamicColumnList|1-10": [
              {
                'count|1-200':1,
                "dynamicColumnType": null,
                "dynamicColumn": "江苏省",
                "isLeafNode": true,
                "dynamicColumnList|1-10": [
                  {
                    'count|1-200':1,
                    "dynamicColumnType": null,
                    "dynamicColumn": "长江中游新洲至九江河段航道整治二期工程建设期维护工程设计技术咨询服务项",
                    "isLeafNode": true,
                    "dynamicColumnList|10-50": [
                      {
                        "dynamicColumnType": null,
                        "dynamicColumn": "江苏省",
                        "isLeafNode": true,
                        "dynamicColumnList":null,
                        "id|1-100000000000": 1,
                        "glid": "000A3B828E7A7C144825792F0009D9AD",
                        "engineeringStage": "施工监理",
                        "projectManager": null,
                        "manufactureStatus": "项目完成",
                        "manufacturer": "中交二航院工程咨询监理有限公司",
                        "currentHandler": "/",
                        "planStartTime": "2011-09-01",
                        "planEndTime": "2013-03-01",
                        "planDuration": "548",
                        "notesURL": "notes://nt2@jey/__482575B2003D00E2.nsf/0/000A3B828E7A7C144825792F0009D9AD?OpenDocument",
                        "industryType": "其他",
                        "workflowInstanceId": null
                      },
                      {
                        "dynamicColumnType": null,
                        "dynamicColumn": "江苏省",
                        "isLeafNode": true,
                        "dynamicColumnList":null,
                        "id|1-100000000000": 1,
                        "glid": "000A3B828E7A7C144825792F0009D9AD",
                        "engineeringStage": "施工监理",
                        "projectManager": null,
                        "manufactureStatus": "项目运行",
                        "manufacturer": "中交二航院工程咨询监理有限公司",
                        "currentHandler": "/",
                        "planStartTime": "2011-09-01",
                        "planEndTime": "2013-03-01",
                        "planDuration": "548",
                        "notesURL": "notes://nt2@jey/__482575B2003D00E2.nsf/0/000A3B828E7A7C144825792F0009D9AD?OpenDocument",
                        "industryType": "其他",
                        "workflowInstanceId": null
                      },
                      {
                        "dynamicColumnType": null,
                        "dynamicColumn": "江苏省",
                        "isLeafNode": true,
                        "dynamicColumnList":null,
                        "id|1-100000000000": 1,
                        "glid": "000A3B828E7A7C144825792F0009D9AD",
                        "engineeringStage": "施工监理",
                        "projectManager": null,
                        "manufactureStatus": "项目终止",
                        "manufacturer": "中交二航院工程咨询监理有限公司",
                        "currentHandler": "/",
                        "planStartTime": "2011-09-01",
                        "planEndTime": "2013-03-01",
                        "planDuration": "548",
                        "notesURL": "notes://nt2@jey/__482575B2003D00E2.nsf/0/000A3B828E7A7C144825792F0009D9AD?OpenDocument",
                        "industryType": "其他",
                        "workflowInstanceId": null
                      }
                    ],
                    page:null
                  }
                ],
                page:null
              }
            ],
            page:null
          }
        ],
        "traceId": "4295854A1A4047749391B39210AB9A4D"
      },
      'projectData1': {
        "errcode": 0,
        "errmsg": "OK",
        "traceId": "4295854A1A4047749391B39210AB9A4D",
        data: [
          {
            "id": "442ca2bdcfb7414cb6fb07a3e9883557",
            "name": "芜湖长江 LNG 内河接收（转运）站项目LNG加 注站、LNG集装箱码头工程",
            "creater": "2c9280a26706a73a016706a93ccf002b",
            "createdDeptId": "1803c80ed28a3e25871d58808019816e",
            "owner": "2c9280a26706a73a016706a93ccf002b",
            "ownerDeptId": "1803c80ed28a3e25871d58808019816e",
            "createdTime": "2022-01-14T09:25:52",
            "modifier": "2c9280a26706a73a016706a93ccf002b",
            "modifiedTime": "2022-01-14T09:25:52",
            "workflowInstanceId": null,
            "sequenceNo": null,
            "sequenceStatus": "COMPLETED",
            "ownerDeptQueryCode": null,
            "qbsName": "芜湖长江 LNG 内河接收（转运）站项目LNG加 注站、LNG集装箱码头工程",
            "projectName": "芜湖LNG",
            "appCode": "ZSPT",
            "parentId": null,
            "qbsCode": "1",
            "mbsQbsId": "",
            "jbsId": "",
            "modelTypeId": "",
            "leaf": false,
            "level": 0,
            "done": false,
            "parentName": null,
            "parent": null,
            "root": true,
            "childs": [
              {
                "id": "0f1179ccb4f445f4a1d4d1c714672b61",
                "name": "前方水域工程",
                "creater": "2c9280a26706a73a016706a93ccf002b",
                "createdDeptId": "1803c80ed28a3e25871d58808019816e",
                "owner": "2c9280a26706a73a016706a93ccf002b",
                "ownerDeptId": "1803c80ed28a3e25871d58808019816e",
                "createdTime": "2022-01-14T09:25:52",
                "modifier": "2c9280a26706a73a016706a93ccf002b",
                "modifiedTime": "2022-01-14T09:25:52",
                "workflowInstanceId": null,
                "sequenceNo": null,
                "sequenceStatus": "COMPLETED",
                "ownerDeptQueryCode": null,
                "qbsName": "前方水域工程",
                "projectName": "芜湖LNG",
                "appCode": "ZSPT",
                "parentId": "442ca2bdcfb7414cb6fb07a3e9883557",
                "qbsCode": "1.1",
                "mbsQbsId": "",
                "jbsId": "",
                "modelTypeId": "",
                "leaf": false,
                "level": 2,
                "done": false,
                "parentName": null,
                "parent": "442ca2bdcfb7414cb6fb07a3e9883557",
                "root": false,
                "childs": [],
                "ids": [
                  "0f1179ccb4f445f4a1d4d1c714672b61"
                ],
                "status": 1,
                "progressState": -1,
                "mbs": [],
                "jbs": [
                  {
                    "id": "d4df0710cc634d89a55f6521a9439fdc",
                    "qbsId": "0f1179ccb4f445f4a1d4d1c714672b61",
                    "jbsCode": "90.6.3",
                    "appCode": "ZSPT",
                    "projectName": "芜湖LNG",
                    "jbsId": "463b428ef2914556a39a447675956bea",
                    "qbsCode": null,
                    "jbsName": null,
                    "qbsBizs": null
                  }
                ],
                "progressExpr": "2/5",
                "hasChild": true,
                "modelType": null,
                "mark": null,
                "bindWbsFlag": null,
                "designNumber": null,
                "designUnit": null,
                "designType": null,
                "schemaNumber": null,
                "totalNum": 5,
                "undoNum": 3,
                "doingNum": 0,
                "doneNum": 2,
                "undoNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doingNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doneNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "undoRatio": 0.6,
                "doingRatio": 0,
                "doneRatio": 0.4
              },
              {
                "id": "82dc5c1465474439b5f6ced3224caa8b",
                "name": "后方陆域工程",
                "creater": "ff80808175bb06f10175cf1da4706a07",
                "createdDeptId": "ff80808177c7e1020177c842e1f803d4",
                "owner": "ff80808175bb06f10175cf1da4706a07",
                "ownerDeptId": "ff80808177c7e1020177c842e1f803d4",
                "createdTime": "2022-11-28T16:07:13",
                "modifier": "ff80808175bb06f10175cf1da4706a07",
                "modifiedTime": "2022-11-28T16:07:13",
                "workflowInstanceId": null,
                "sequenceNo": null,
                "sequenceStatus": "COMPLETED",
                "ownerDeptQueryCode": null,
                "qbsName": "后方陆域工程",
                "projectName": "芜湖LNG",
                "appCode": "ZSPT",
                "parentId": "442ca2bdcfb7414cb6fb07a3e9883557",
                "qbsCode": "1.2",
                "mbsQbsId": "",
                "jbsId": "",
                "modelTypeId": "",
                "leaf": false,
                "level": 3,
                "done": false,
                "parentName": null,
                "parent": "442ca2bdcfb7414cb6fb07a3e9883557",
                "root": false,
                "childs": [],
                "ids": [
                  "82dc5c1465474439b5f6ced3224caa8b"
                ],
                "status": -1,
                "progressState": -1,
                "mbs": [],
                "jbs": [],
                "progressExpr": "0/0",
                "hasChild": true,
                "modelType": null,
                "mark": null,
                "bindWbsFlag": null,
                "designNumber": null,
                "designUnit": null,
                "designType": null,
                "schemaNumber": null,
                "totalNum": 0,
                "undoNum": 0,
                "doingNum": 0,
                "doneNum": 0,
                "undoNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doingNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doneNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "undoRatio": 1,
                "doingRatio": 0,
                "doneRatio": 0
              },
              {
                "id": "d49c5a21f0b74afd8bb78639d0b2dfab",
                "name": "混凝土",
                "creater": "2c9280a26706a73a016706a93ccf002b",
                "createdDeptId": "1803c80ed28a3e25871d58808019816e",
                "owner": "2c9280a26706a73a016706a93ccf002b",
                "ownerDeptId": "1803c80ed28a3e25871d58808019816e",
                "createdTime": "2022-01-14T09:25:52",
                "modifier": "2c9280a26706a73a016706a93ccf002b",
                "modifiedTime": "2022-01-14T09:25:52",
                "workflowInstanceId": null,
                "sequenceNo": null,
                "sequenceStatus": "COMPLETED",
                "ownerDeptQueryCode": null,
                "qbsName": "混凝土",
                "projectName": "芜湖LNG",
                "appCode": "ZSPT",
                "parentId": "442ca2bdcfb7414cb6fb07a3e9883557",
                "qbsCode": "1.3",
                "mbsQbsId": "",
                "jbsId": "",
                "modelTypeId": "",
                "leaf": true,
                "level": null,
                "done": true,
                "parentName": null,
                "parent": "442ca2bdcfb7414cb6fb07a3e9883557",
                "root": false,
                "childs": [],
                "ids": [
                  "d49c5a21f0b74afd8bb78639d0b2dfab"
                ],
                "status": -1,
                "progressState": -1,
                "mbs": [],
                "jbs": [],
                "progressExpr": "0/0",
                "hasChild": false,
                "modelType": null,
                "mark": null,
                "bindWbsFlag": null,
                "designNumber": null,
                "designUnit": null,
                "designType": null,
                "schemaNumber": null,
                "totalNum": 0,
                "undoNum": 0,
                "doingNum": 0,
                "doneNum": 0,
                "undoNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doingNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doneNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "undoRatio": 1,
                "doingRatio": 0,
                "doneRatio": 0
              },
              {
                "id": "d90ac98a135b4fad878284d293e84a36",
                "name": "测试1.4",
                "creater": "2c9280a26706a73a016706a93ccf002b",
                "createdDeptId": "1803c80ed28a3e25871d58808019816e",
                "owner": "2c9280a26706a73a016706a93ccf002b",
                "ownerDeptId": "1803c80ed28a3e25871d58808019816e",
                "createdTime": "2022-01-14T09:25:52",
                "modifier": "2c9280a26706a73a016706a93ccf002b",
                "modifiedTime": "2022-01-14T09:25:52",
                "workflowInstanceId": null,
                "sequenceNo": null,
                "sequenceStatus": "COMPLETED",
                "ownerDeptQueryCode": null,
                "qbsName": "测试1.4",
                "projectName": "芜湖LNG",
                "appCode": "ZSPT",
                "parentId": "442ca2bdcfb7414cb6fb07a3e9883557",
                "qbsCode": "1.4",
                "mbsQbsId": "",
                "jbsId": "",
                "modelTypeId": "",
                "leaf": true,
                "level": null,
                "done": false,
                "parentName": null,
                "parent": "442ca2bdcfb7414cb6fb07a3e9883557",
                "root": false,
                "childs": [],
                "ids": [
                  "d90ac98a135b4fad878284d293e84a36"
                ],
                "status": -1,
                "progressState": -1,
                "mbs": [],
                "jbs": [],
                "progressExpr": "0/0",
                "hasChild": false,
                "modelType": null,
                "mark": null,
                "bindWbsFlag": null,
                "designNumber": null,
                "designUnit": null,
                "designType": null,
                "schemaNumber": null,
                "totalNum": 0,
                "undoNum": 0,
                "doingNum": 0,
                "doneNum": 0,
                "undoNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doingNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doneNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "undoRatio": 1,
                "doingRatio": 0,
                "doneRatio": 0
              },
              {
                "id": "82c0947143ed45129ecd3931d43900f0",
                "name": "成孔",
                "creater": "2c9280a26706a73a016706a93ccf002b",
                "createdDeptId": "1803c80ed28a3e25871d58808019816e",
                "owner": "2c9280a26706a73a016706a93ccf002b",
                "ownerDeptId": "1803c80ed28a3e25871d58808019816e",
                "createdTime": "2022-01-14T09:25:52",
                "modifier": "2c9280a26706a73a016706a93ccf002b",
                "modifiedTime": "2022-01-14T09:25:52",
                "workflowInstanceId": null,
                "sequenceNo": null,
                "sequenceStatus": "COMPLETED",
                "ownerDeptQueryCode": null,
                "qbsName": "成孔",
                "projectName": "芜湖LNG",
                "appCode": "ZSPT",
                "parentId": "442ca2bdcfb7414cb6fb07a3e9883557",
                "qbsCode": "1.5",
                "mbsQbsId": "",
                "jbsId": "",
                "modelTypeId": "",
                "leaf": false,
                "level": null,
                "done": false,
                "parentName": null,
                "parent": "442ca2bdcfb7414cb6fb07a3e9883557",
                "root": false,
                "childs": [],
                "ids": [
                  "82c0947143ed45129ecd3931d43900f0"
                ],
                "status": -1,
                "progressState": -1,
                "mbs": [],
                "jbs": [],
                "progressExpr": "0/0",
                "hasChild": true,
                "modelType": null,
                "mark": null,
                "bindWbsFlag": null,
                "designNumber": null,
                "designUnit": null,
                "designType": null,
                "schemaNumber": null,
                "totalNum": 0,
                "undoNum": 0,
                "doingNum": 0,
                "doneNum": 0,
                "undoNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doingNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "doneNodes": {
                  "bimModelDTOList": null,
                  "bimModelDTOInfo": [],
                  "positionType": null,
                  "Center_X": null,
                  "Center_Y": null,
                  "SMSDRIW": null,
                  "SMSDRIE": null,
                  "SMSDRIN": null,
                  "SMSDRIS": null
                },
                "undoRatio": 1,
                "doingRatio": 0,
                "doneRatio": 0
              }
            ],
            "ids": [
              "442ca2bdcfb7414cb6fb07a3e9883557",
              "d90ac98a135b4fad878284d293e84a36",
              "d49c5a21f0b74afd8bb78639d0b2dfab",
              "82dc5c1465474439b5f6ced3224caa8b",
              "0f1179ccb4f445f4a1d4d1c714672b61",
              "82c0947143ed45129ecd3931d43900f0"
            ],
            "status": 1,
            "progressState": -1,
            "mbs": [],
            "jbs": [],
            "progressExpr": "2/5",
            "hasChild": true,
            "modelType": null,
            "mark": null,
            "bindWbsFlag": null,
            "designNumber": null,
            "designUnit": null,
            "designType": null,
            "schemaNumber": null,
            "totalNum": 5,
            "undoNum": 3,
            "doingNum": 0,
            "doneNum": 2,
            "undoNodes": {
              "bimModelDTOList": null,
              "bimModelDTOInfo": [],
              "positionType": null,
              "Center_X": null,
              "Center_Y": null,
              "SMSDRIW": null,
              "SMSDRIE": null,
              "SMSDRIN": null,
              "SMSDRIS": null
            },
            "doingNodes": {
              "bimModelDTOList": null,
              "bimModelDTOInfo": [],
              "positionType": null,
              "Center_X": null,
              "Center_Y": null,
              "SMSDRIW": null,
              "SMSDRIE": null,
              "SMSDRIN": null,
              "SMSDRIS": null
            },
            "doneNodes": {
              "bimModelDTOList": null,
              "bimModelDTOInfo": [],
              "positionType": null,
              "Center_X": null,
              "Center_Y": null,
              "SMSDRIW": null,
              "SMSDRIE": null,
              "SMSDRIN": null,
              "SMSDRIS": null
            },
            "undoRatio": 0.6,
            "doingRatio": 0,
            "doneRatio": 0.4
          }
        ]
      }
    }),
  },
};
