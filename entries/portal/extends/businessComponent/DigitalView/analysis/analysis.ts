/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import env from '@/config/env';
import {difference} from "lodash";
import {Utils} from "@ctesi/core";
import * as ModelApi from "../../../service/modelInterface";
import {listApi} from '@cloudpivot/api';
import OAuthApi from "@/apis/oauth";
import * as Api from "../../../service/api";

import Card from "ant-design-vue/lib/card";
import "ant-design-vue/lib/card/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Tabs from "ant-design-vue/lib/tabs";
import "ant-design-vue/lib/tabs/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Divider from "ant-design-vue/lib/divider";
import "ant-design-vue/lib/divider/style/index.css";
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

import ConnectInfo from './connectInfo.vue';
import closePng from "@/assets/extends/cim/tree_array.png";
import allDataIcon from '@/assets/extends/bim/icon_sj.png';
import mxDataIcon from "@/assets/extends/bim/icon_mx.png";
import zbDataIcon from '@/assets/extends/bim/icon_zb.png';
import addDataIcon from '@/assets/extends/bim/icon_xz.png';

@Component({
  name: 'FormAnalysis',
  components: {
    ADivider: Divider,
    ACard: Card,
    AButton: Button,
    AInputSearch: Input.Search,
    ATree: Tree,
    ATable: Table,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ASelect: Select,
    ASelectOption: Select.Option,
    ConnectInfo,
  }
})
export default class FormAnalysis extends Vue {
  @InjectReactive('project') projectCode!: string;

  @Prop() projectName!: string;
  @Prop() componentCode!: string;
  @Prop() location?: any;

  @Ref()
  MainTable?: HTMLElement;

  closePng: HTMLImageElement = closePng;
  allDataIcon: HTMLImageElement = allDataIcon;
  mxDataIcon: HTMLImageElement = mxDataIcon;
  zbDataIcon: HTMLImageElement = zbDataIcon;
  addDataIcon: HTMLImageElement = addDataIcon;
  tableHeight: number = 0;
  isLeftShow: boolean = true;
  //左侧项目树
  isScale: boolean = true;

  treeKey: number = 0;
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  treeData: Array<any> = [];
  treeExpandData: Array<string> = [];
  modalManageData: Array<any> = [];
  checkedKeys: Array<string> = [];
  defaultCheckedKeys: Array<string> = [];
  selectedKeys: Array<string> = [];
  searchKeys: Array<string> = [];
  oldCheckedKeys: Array<string> = [];

  /*  @Watch('locationData', {immediate: true})
    locationDataListener(val: object) {
      console.log('locationObject==============', val)
      if (JSON.stringify(val) !== '{}') {
        this.locationObject = val
      }
    }*/

  onSearch(value) {
    this.treeExpandData = [];
    this.treeData = [];
    if (value.length === 0) return this.initTree();
    OAuthApi.getByCodeName({
      codeType: "MBS",
      projectCode: this.projectCode,
      projectName: this.projectName,
      name: value
    })
      .then(res => {
        if (res.errcode === 0) {
          this.treeData = res.data.tree ?? [];
          this.searchKeys = res.data.selectedIds;
          this.treeExpandData = res.data.fatherIds;
        }
      })
  }

  onTableSearch(v) {
    this.tableData = [];
    ModelApi.getAllListDataAnalysis({
      schemaCode: this.schemaCode,
      projectName: this.projectName,
      keyWord: v
    }).then(res => {
      if (res.errcode == 0) {
        res.data?.content.forEach(item => {
          this.tableData.push(item.data);
        })
      }
    })
  }

  //初始化左侧树
  initTree() {
    this.treeExpandData = [];
    this.defaultCheckedKeys = [];//清空树默认勾选
    this.treeData = [];
    OAuthApi.topTreeList({
      projectCode: this.projectCode ?? '',
      projectName: this.projectName ?? '',
      codeType: '',
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('获取模型树失败！');
      if (!res.data || res.data.length === 0) return this.$message.warn('模型数据为空！');
      const resData = res.data;
      resData.forEach((item, i) => {
        if (!item.children) {
          resData[i].isLeaf = true;
        }
        this.treeExpandData.push(item.id);
        this.defaultCheckedKeys.push(item.id);
      })
      FormAnalysis.slotAdapter(resData);
      this.treeData = resData;
      this.onCheck(this.defaultCheckedKeys, "start");
    })
  }

  private static slotAdapter(datas) {
    if (!Array.isArray(datas)) return;
    Utils.deepFind(datas, (item) => {
      item.scopedSlots = {title: "title"};
      item.isLeaf = !item.hasChild;
      return false;
    }, "children");
  }

  private calcContentHeight() {
    const vmHeight = 17.625;
    const containerHeight = vmHeight / 100 * (document.body.clientWidth);
    console.log(containerHeight);
    this.tableHeight = containerHeight - 25 - 30 - 24 - 100;
  }

  mounted() {
    const {calcContentHeight} = this;
    this.calcContentHeight();
    this.initTree();
    this.initBottom();
    window.addEventListener('resize', calcContentHeight);
  }

  destroyed() {
    const {calcContentHeight} = this;
    window.removeEventListener('resize', calcContentHeight);
  }

  // 左侧弹窗-树-多选
  onCheck(checkedKeys, info) {
    if (info == "start") {
      let codeValue: string = '';
      Utils.deepFind(this.treeData, item => {
        if (item.id === checkedKeys[0]) {
          codeValue = item.codeValue;
        }
        return false;
      }, 'children');
      this.$emit("submitMessage", 'Model_Visuality', {'code': codeValue, "isHidden": 0,});
      this.oldCheckedKeys = checkedKeys;
    } else {
      let value: string = '';
      let newCheckKey: Array<string> = []
      if (!info.checked) {
        newCheckKey = difference(this.oldCheckedKeys, checkedKeys);
      } else {
        newCheckKey = difference(checkedKeys, this.oldCheckedKeys,);
      }
      value = newCheckKey[0] ?? '';
      let codeValue: string = '';
      Utils.deepFind(this.treeData, item => {
        if (item.id === value) {
          codeValue = item.codeValue;
        }
        return false;
      }, 'children');
      this.$emit("submitMessage", 'Model_Visuality', {
        'code': codeValue,
        "isHidden": !info.checked ? 1 : 0,
      });
      this.oldCheckedKeys = checkedKeys;
    }
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise((resolve) => {
      // 有值了直接渲染
      if (treeNode.dataRef.children && treeNode.dataRef.children.length > 0) {
        //@ts-ignore
        resolve();
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      OAuthApi.childTreeList({
        projectCode: this.projectCode ?? "",
        projectName: this.projectName ?? '',
        id: treeNode.$vnode.data.key,
        codeType: "MBS",
      }).then((res) => {
        res.data?.forEach((item, i) => {
          res.data[i].isLeaf = !!item.children;
        })
        FormAnalysis.slotAdapter(res.data);
        treeNode.dataRef.children = res.data;
        _this.treeData = [..._this.treeData];
      });
      //@ts-ignore
      resolve();
    });
  }

  // 树-选择
  async onSelect(selectedKeys, info?) {
    if (selectedKeys.length == 0) {
      await this.onSelect(this.selectedKeys);
    } else {
      this.selectedKeys = selectedKeys;
      this.isBottomShow = true;     //展开下方表格
      if (this.isConnectShow) {
        this.getQueryById(selectedKeys)        //关联弹窗存在更新弹窗数据
      } else {
        this.filterData(selectedKeys);        //关联弹窗不存在更新下方表格数据
      }
      OAuthApi.getMBSData({
        projectCode: this.projectCode,
        mbsId: this.selectedKeys[0],
        projectName: this.projectName
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
        this.modalManageData = res.data;
        this.$emit("submitMessage", 'Model_Positioning', {'code': info.node.dataRef.codeValue});
        this.$emit("submitMessage", 'Model_Highlight', {
          'code': info.node.dataRef.codeValue,
          "isHigh": 1
        });
      })
    }
  }

  //  下方表格分析
  isBottomShow: boolean = true;
  tabData: { [propsName: string]: string } = {};
  tableLabel: Array<any> = [];
  tableData: Array<any> = [];
  constTableData: Array<any> = [];
  schemaCode: string = '';
  allOptions: { [propsName: string]: any } = {};
  attachment: Array<string> = [];//用于保存附件列的dataIndex
  maxWidth: number = 2000;
  filterOption: string = '';
  optionCode: string = '';
  isConnectShow: boolean = false;
  rowData: Array<any> = [];
  index: number = 0;
  codeData: any = {};
  cardKey: number = 0;

  /**
   * 下方TAB选项初始化
   */
  initBottom() {
    this.cardKey += 1;
    this.tabData = {};
    this.tableLabel = [];
    this.tableData = [];
    // @ts-ignore
    const myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear();
    ModelApi.getAllTableAnalysis({
      appCode: this.projectCode,
      componetCode: this.componentCode
    }).then(res => {
      if (res.errcode == 0) {
        if (JSON.stringify(res.data) === '{}') return this.isBottomShow = false;
        this.tabData = res.data ?? {};
        this.pressTab(this.tabData[Object.keys(this.tabData)[0]]);
        this.isBottomShow = true;
      }
    })
  }

  /**
   * TAB页点击事件
   */
  pressTab(value) {
    this.$emit("submitMessage", 'Icon_Clear');
    this.schemaCode = value;
    this.getAllListData(value);
    this.getTableLabel(value);
  }

  /**
   * 获取表单所有分析列和选项
   */
  getAllOptions(schemaCode) {
    this.allOptions = {};
    ModelApi.getAllOptionsAnalysis({
      appCode: this.projectCode,
      schemaCode: schemaCode
    })
      .then(res => {
        if (res.errcode == 0) {
          this.allOptions = res.data ?? {};
          this.filterChange(Object.keys(this.allOptions)[0]);
          this.tableLabel.forEach((item, i) => {
            for (const k in res.data) {
              if (k === item.key) {
                const temptOptions: Array<object> = [];
                res.data[k].data.forEach((v) => {
                  temptOptions.push({
                    text: v.optionName,
                    value: v.optionName,
                  });
                })
                this.$set(this.tableLabel[i], 'filters', temptOptions);
                const name = this.tableLabel[i].dataIndex;
                this.$set(this.tableLabel[i], 'scopedSlots', {'customRender': name});
                this.$set(this.tableLabel[i], 'onFilter', (value, record) => record[name].indexOf(value) === 0);
              }
            }
          })
        }
      })
  }

  /**
   * 获取列表所有数据
   */
  getAllListData(schemaCode) {
    this.tableData = [];
    this.constTableData = [];
    ModelApi.getAllListDataAnalysis({
      schemaCode: schemaCode,
      projectName: this.projectName,
    }).then(res => {
      if (res.errcode == 0) {
        res.data?.content.forEach(item => {
          this.tableData.push(item.data);
        })
      }
      this.constTableData = JSON.parse(JSON.stringify(this.tableData));
    })
  }

  /**
   * 获取列表表头
   */
  getTableLabel(schemaCode) {
    this.tableLabel = [{
      title: '序号',
      align: "center",
      width: 50,
      customRender: (text, record, index) => `${index + 1}`,
    }];
    this.attachment = [];
    listApi.getListConfigData({
      schemaCode: schemaCode,
      code: schemaCode,
      source: 1
    }).then(res => {
      if (res.errcode == 0) {
        const resColumn = res.data.queryColumns ?? [];
        resColumn.forEach((item, i) => {
          //排除子表
          if (item.propertyType !== 8) {
            if (item.propertyType === 6) {
              this.tableLabel.push({
                align: "center",
                title: resColumn[i].name,
                dataIndex: resColumn[i].propertyCode,
                key: resColumn[i].propertyCode,
                ellipsis: true,
                scopedSlots: {customRender: resColumn[i].propertyCode,}
              })
              this.attachment.push(resColumn[i].propertyCode)
            } else {
              this.tableLabel.push({
                align: "center",
                ellipsis: true,
                title: resColumn[i].name,
                dataIndex: resColumn[i].propertyCode,
                key: resColumn[i].propertyCode,
                width: resColumn[i].width,
              })
            }
          }
        })
      }
      this.tableLabel.push({
        align: "center",
        title: "操作",
        key: "操作",
        width: 160,
        scopedSlots: {customRender: "操作"}
      });
      this.maxWidth = (this.tableLabel.length - 1) * 160 + 50;
      this.getAllOptions(this.schemaCode);
    })
  }

  /**
   * 查看当前行详情
   * param 当前行数据
   */
  viewDetail(value) {
    const token = localStorage.getItem("token");
    if (value.id.indexOf("/") !== -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    listApi.getFormUrl({
      bizObjectId: value.id as string,
      schemaCode: this.schemaCode,
    }).then(res => {
      return window.open(`${env.portalHost}${res}&access_token=${token}`)
    })
  }

  /**
   *画饼图
   *Data  画图数据[{name:,value:}]
   *totalNum   总数
   */
  drawPie(color, name, data) {
    // @ts-ignore
    const myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear()
    myChart.setOption({
      color: color,
      legend: {
        top: "bottom",
        icon: "rect",
        data: name,
        textStyle: {color: "#fff", fontSize: 12},
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '选项',
          type: 'pie',
          radius: '55%',
          center: ['50%', '42%'],
          data: data,
          label: {
            position: 'outer',
            distanceToLabelLine: 1,
            containLabel: true,
            bleedMargin: 1,
            overflow: 'breakAll'
          },
          labelLine: {
            length: 3
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
    myChart.on("click", this.eConsole);
    window.onresize = function () {
      myChart.resize();
    };
  }

  eConsole(param) {
    this.$emit("submitMessage", 'Icon_Clear');
    //获取当前点击索引，
    const preUrl = `${env.apiHost}`;
    const token = window.localStorage.getItem("token") as string;
    ModelApi.showStaticDataDigital({
      dataList: this.tableData,
      appCode: this.projectCode,
      optionCode: this.optionCode,
      preUrl: preUrl,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
      token: token,
      optionValue: param.data.name
    })
      .then(res => {
        if (res.errcode == 0) {
          if(!res.data) return;
          if(res.data?.bimCoordinateDTOList.length!==0){
            res.data?.bimCoordinateDTOList.forEach(item=>{
              this.$emit("submitMessage", 'Icon_Positioning',item);
            })
          }
          if(res.data?.codeIdList.length!==0){
            res.data?.codeIdList.forEach(item=>{
              this.$emit("submitMessage", 'Model_Positioning', {code:item});
              this.$emit("submitMessage", 'Model_Highlight', {code: item, isHigh: 1});
            })
          }
        }
      })
  }

  /**
   * 按钮：新增
   */
  addNew() {
    const {href, route} = this.$router.resolve({
      name: 'form-detail',
      query: {
        schemaCode: this.schemaCode,
        sheetCode: this.schemaCode,
        queryCode: this.schemaCode,
        projectName: this.projectName,
        iframeAction: 'add',
        return: `${this.$route.fullPath}&iframeAction=add`
      }
    })
    if (this.isDingTalk) {
      this.$router.push(route.fullPath)
    } else {
      window.open(href, '_blank')
    }
  }

  /**
   * 按钮：坐标分布（表格操作栏--定位）
   */
  distribution(value) {
    this.$emit("submitMessage", 'Icon_Clear');
    const preUrl = `${env.apiHost}`;
    ModelApi.showTableDataDigital({
      dataList: typeof value == "string" ? this.tableData : [value],
      appCode: this.projectCode,
      optionCode: this.optionCode,
      preUrl: preUrl,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
      // token:token
    })
      .then(res => {
        if (res.errcode == 0) {
          if(!res.data) return;
          if(res.data?.bimCoordinateDTOList.length!==0){
            res.data?.bimCoordinateDTOList.forEach(item=>{
              this.$emit("submitMessage", 'Icon_Positioning',item);
            })
          }
          if(res.data?.codeIdList.length!==0){
            res.data?.codeIdList.forEach(item=>{
              this.$emit("submitMessage", 'Model_Positioning', {code:item});
              this.$emit("submitMessage", 'Model_Highlight', {code: item, isHigh: 1});
            })
          }
        }
      })
  }

  /**
   * 按钮：全部数据
   */
  filterAll() {
    this.tableData = this.constTableData;
  }

  /**
   * 按钮：模型数据
   */
  filterAllModelData() {
    ModelApi.filterAllModelDataAnalysis({
      dataList: this.constTableData,
      filterValue: '',
      propertyCode: ''
    }).then(res => {
      if (res.errcode == 0) {
        this.tableData = res.data ?? []
      }
    })
  }

  /**
   * 按钮：坐标数据
   */
  filterAllCoorData() {
    ModelApi.filterAllCoorDataAnalysis({
      dataList: this.constTableData,
      filterValue: '',
      propertyCode: ''
    })
      .then(res => {
        if (res.errcode == 0) {
          this.tableData = res.data ?? []
        }
      })
  }

  /**
   * 点击左侧模型树，筛选下方表格
   */
  filterData(key) {
    ModelApi.filterDataAnalysis({
      appCode: this.projectCode,
      dataList: this.constTableData,
      filterValue: key[0],
      propertyCode: 'bsId'
    })
      .then(res => {
        if (res.errcode == 0) {
          this.tableData = res.data ?? []
        }
      })
  }

  /**
   * 点击表格附件下载
   */
  download(record, val) {
    console.log('点击表格附件下载', record, val);
    const token = localStorage.getItem("token");
    if (record[val] == undefined) {
      this.$message.warn('文件为空！')
    } else {
      window.open(`${env.apiHost}/${record[val]}&access_token=${token}`)
    }
  }

  filterChange(value) {
    this.filterOption = this.allOptions[value].propertyName;
    this.optionCode = value
    this.initPiePic(value);
  }

  initPiePic(value) {
    // @ts-ignore
    const myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear()
    ModelApi.getStaticDataAnalysis({
      appCode: this.projectCode,
      dataList: this.tableData,
      optionCode: value,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
    })
      .then(res => {
        if (res.errcode == 0) {
          const color: Array<string> = [];
          const name: Array<string> = [];
          const data: Array<object> = [];
          if (JSON.stringify(res.data) !== '{}') {
            for (const key in res.data) {
              name.push(key);
              color.push(res.data[key].color);
              data.push({
                value: res.data[key].count,
                name: key
              })
            }
            this.drawPie(color, name, data)
          }
        }
      })
  }

  sendMessage(v) {
    this.$emit("submitMessage", 'PointData_Toggle', {'isOn': v});
  }

  /**
   * 关联详情
   */
  showConnect(value, index) {
    console.log('关联详情',value,index)
    this.isConnectShow = true;
    this.rowData = [value];
    this.index = index + 1;
  }

  getQueryById(value) {
    this.codeData = {}
    Api.getQueryById({
      appCode: this.projectCode,
      id: value[0],
    }).then(res => {
      if (res.errcode == 0) {
        this.$set(this.codeData, 'codeValue', res.data.codeValue);
        this.$set(this.codeData, 'codeName', res.data.taskName);
        this.$set(this.codeData, 'codeId', res.data.id);
      }
    })
  }

  closeConnectInfo() {
    this.isConnectShow = false;
    this.pressTab(this.schemaCode)
  }

  setRowClass(record, index) {
    return Number(index) % 2 === 1 ? "evenRowStyl" : "";
  }

  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.distribution(record);
        },
        dblclick: () => {
          this.viewDetail(record);
        }
      }
    };
  }

  @Watch('tableData', {immediate: true})
  tableDataListener(val: Array<any>) {
    this.$nextTick(function () {
      this.initPiePic(this.optionCode)
    })
  }
}
