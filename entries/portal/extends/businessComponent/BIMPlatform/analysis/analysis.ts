import { Component, Prop, Ref, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import env from '@/config/env';
import {
  Card, Button, Table, Input, Tree, Tabs, Select, Divider
} from '@h3/antd-vue';
import axios from "axios";
import ConnectInfo from './popUp/connectInfo.vue'
//@ts-ignore
import allDataIcon from '../../../../src/assets/extends/bim/icon_sj.png'
//@ts-ignore
import mxDataIcon from '../../../../src/assets/extends/bim/icon_mx.png'
//@ts-ignore
import zbDataIcon from '../../../../src/assets/extends/bim/icon_zb.png'
//@ts-ignore
import addDataIcon from '../../../../src/assets/extends/bim/icon_xz.png'
//@ts-ignore
import bottomArray from '../../../../src/assets/extends/bim/frame_bottom_1.png'
//@ts-ignore
import bottomArrayHide from '../../../../src/assets/extends/bim/frame_bottom_2.png'
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

@Component({
  name: 'analysis',
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
export default class analysis extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() tabName!: string;
  @Prop() componentCode!: string;
  @Prop() locationData?: object;

  @Ref()
  MainTable?: HTMLElement;

  allDataIcon: any = allDataIcon;
  mxDataIcon: any = mxDataIcon;
  zbDataIcon: any = zbDataIcon;
  addDataIcon: any = addDataIcon;
  bottomArray: any = bottomArray;
  bottomArrayHide: any = bottomArrayHide;

  tableHeight: number = 0;

  bimURL: string = `${env.apiHost}/`;
  isLeftShow: boolean = true;
  buttonIndexLeft: string = "";
  //左侧项目树
  treeKey: number = 0;
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  treeData: Array<any> = [];
  treeExpandData: Array<any> = [];
  modalManageData: Array<any> = [];
  checkedKeys: Array<any> = [];
  defaultCheckedKeys: Array<any> = [];
  selectedKeys: Array<any> = [];
  highLightKeys: Array<any> = [];
  locationObject: object = {};

  @Watch('locationData', { immediate: true })
  locationDataListener(val: object) {
    console.log('locationObject==============', val)
    if (JSON.stringify(val) !== '{}') {
      this.locationObject = val
    }
  }

  // @Watch('componentCode', {immediate: true})
  // componentCodeListener(val: string) {
  //     this.componentCode = val;
  //     this.initTree('安全分析');
  //     this.initBottom();
  // }

  onSearch(value) {
    this.treeExpandData = [];
    this.treeData = [];
    if (value.length == 0) {
      this.initTree('安全分析')
      this.treeKey += this.treeKey;
    } else {
      axios
        .get(
          this.bimURL + 'api/code_mbs/getByCodeName', {
            params: {
              "codeType": "MBS",
              "projectCode": this.projectCode,
              "projectName": this.projectName,
              "name": value
            }
          })
        .then(res => {
          this.treeKey += this.treeKey;
          //@ts-ignore
          this.treeData = res.data.tree;
          this.highLightKeys = res.data.selectedIds;
          this.treeExpandData = res.data.fatherIds;
          // this.onSelect(this.selectedKeys);
        })
    }
  }

  onTableSearch(v) {
    this.tableData = [];
    axios
      .get(this.bimURL + `bim/analysis/getAllListData`, {
        params: {
          schemaCode: this.schemaCode,
          projectName: this.projectName,
          keyWord: v
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const temptData = res.data.content;
          for (let i = 0; i < temptData.length; i++) {
            this.$set(temptData[i].data, 'key', temptData[i].data.id)
            this.tableData.push(temptData[i].data);
          }
        }
      })
  }

  //初始化左侧树
  initTree(item) {
    this.treeExpandData = [];
    //清空树默认勾选
    this.defaultCheckedKeys = [];
    //配置接口路径
    const url = this.bimURL + "api/code_mbs/top_tree_list";
    this.treeData = []
    axios
      .get(
        url, {
          params: {
            projectCode: this.projectCode,
            projectName: this.projectName,
            parentId: '',
            codeType: ''
          }
        })
      .then(res => {
        //@ts-ignore
        if (res.errcode === 0) {
          const resData = res.data;
          for (let i = 0; i < resData.length; i++) {
            if (resData[i].children === undefined) {
              resData[i].isLeaf = true;
            }
            this.$set(resData[i], "key", resData[i].id);
            this.treeExpandData.push(resData[i].id);
            this.defaultCheckedKeys.push(resData[i].id);
          }
          this.treeData = resData;
          this.treeKey += 1;
          const temptKeys: any[] = [];
          if (this.treeData.length === 0) {
            // @ts-ignore
            this.$message.warn("暂无模型数据");
            this.isLeftShow = false;
          } else {
            // @ts-ignore
            // this.$message.success(res.errmsg)
            temptKeys.push(this.treeData[0].key);
            this.isLeftShow = true;
          }
          this.onCheck(this.defaultCheckedKeys, "start");
        } else {
          this.treeData = [];
          //@ts-ignore
          this.$message.warn(res.errmsg)
        }
      })
  }

  private calcContentHeight() {
    const vmHeight = 17.625;
    const containerHeight = vmHeight / 100 * (document.body.clientWidth);
    console.log(containerHeight);
    this.tableHeight = containerHeight - 25 - 30 - 24 - 100;
  }

  mounted() {
    const { calcContentHeight } = this;
    this.calcContentHeight();
    this.buttonIndexLeft = '安全分析';
    this.initTree('安全分析');
    this.initBottom();
    window.addEventListener('resize', calcContentHeight);
  }

  destroyed() {
    const { calcContentHeight } = this;
    window.removeEventListener('resize', calcContentHeight);
  }

  // 左侧弹窗-树-多选
  async onCheck(checkedKeys, info) {
    this.checkedKeys = []
    if (info == "start") {
      this.checkedKeys = checkedKeys;
      this.$emit('getShowHideData', true, '模型管理', this.checkedKeys)
    } else {
      if (info.checked === false) {
        this.checkedKeys.push(info.node.eventKey);
        this.$emit('getShowHideData', false, '模型管理', this.checkedKeys)
      } else {
        this.checkedKeys.push(info.node.eventKey);
        this.$emit('getShowHideData', true, '模型管理', this.checkedKeys)
      }
    }

  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise(resolve => {
      if (treeNode.dataRef.children != undefined && treeNode.dataRef.children.length > 0) { // 有值了直接渲染
        //@ts-ignore
        resolve();
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      //配置接口路径
      const url = this.bimURL + "api/code_mbs/child_tree_list";
      const params = {
        projectCode: this.projectCode,
        projectName: this.projectName,
        id: treeNode.$vnode.data.key,
        codeType: "MBS"
      };
      axios
        .get(url, {
          params: params
        })
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].children == undefined) {
              res.data[i].isLeaf = true;
            }
          }
          treeNode.dataRef.children = res.data;
          _this.treeData = [ ..._this.treeData ];
        });
      //@ts-ignore
      resolve();
    });
  }

  // 树-选择
  async onSelect(selectedKeys) {
    if (selectedKeys.length == 0) {
      await this.onSelect(this.selectedKeys);
    } else {
      this.selectedKeys = selectedKeys;
      //展开下方表格
      this.isBottomShow = true;
      if (this.isConnectShow) {
        //关联弹窗存在更新弹窗数据
        this.getQueryById(selectedKeys)
      } else {
        //关联弹窗不存在更新下方表格数据
        this.filterData(selectedKeys);
      }
      //这里开始为模型高亮做准备
      const url = this.bimURL + "bim/data/getMBSData";
      // 构造输入
      const params = {
        projectCode: this.projectCode,
        mbsId: this.selectedKeys[0],
        projectName: this.projectName
      };
      axios
        .get(
          url, {
            params: params
          })
        .then(res => {
          //@ts-ignore
          if (res.errcode == 0) {
            this.modalManageData = res.data;
            this.$emit('modelHight', this.modalManageData)
          } else {
            //@ts-ignore
            this.$message.warn(res.errmsg)
          }
        })
    }
  }

  //  下方表格分析
  isBottomShow: boolean = true;
  tabData: object = {};
  tableLabel: Array<any> = [];
  tableData: Array<any> = [];
  constTableData: Array<any> = [];
  schemaCode: string = '';
  allOptions: object = {};
  attachment: Array<string> = [];//用于保存附件列的dataIndex
  maxWidth: number = 2000;
  filterOption: string = '';
  optionCode: string = '';
  isConnectShow: boolean = false;
  rowData: Array<object> = [];
  index: number = 0;
  codeData: object = {};
  cardKey: number = 0;

  /**
   * 下方TAB选项初始化
   */
  initBottom() {
    this.cardKey += 1;
    this.tabData = [];
    this.tableLabel = [];
    this.tableData = [];
    // @ts-ignore
    const myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear();
    axios
      .get(this.bimURL + `bim/analysis/getAllTable`, {
        params: {
          appCode: this.projectCode,
          componetCode: this.componentCode
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          if (JSON.stringify(res.data) !== '{}') {
            this.tabData = res.data;
            this.pressTab(this.tabData[Object.keys(this.tabData)[0]]);
            this.isBottomShow = true;
          } else {
            this.isBottomShow = false;
          }
        }
      })
  }

  /**
   * TAB页点击事件
   */
  pressTab(value) {
    this.$emit('clearCustomEntity');
    this.schemaCode = value;
    this.getAllListData(value);
    // this.getAllOptions(value);
    this.getTableLabel(value);
  }

  /**
   * 获取表单所有分析列和选项
   */
  getAllOptions(schemaCode) {
    this.allOptions = [];
    axios
      .get(this.bimURL + `bim/analysis/getAllOptions`, {
        params: {
          appCode: this.projectCode,
          schemaCode: schemaCode
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.allOptions = res.data;
          this.filterChange(Object.keys(this.allOptions)[0]);
          // this.filterOption = this.allOptions[Object.keys(this.allOptions)[0]].propertyName;
          for (let i = 0; i < this.tableLabel.length; i++) {
            for (const k in res.data) {
              if (k === this.tableLabel[i].key) {
                const temptOptins: Array<object> = [];
                for (let j = 0; j < res.data[k].data.length; j++) {
                  temptOptins.push({
                    text: res.data[k].data[j].optionName,
                    value: res.data[k].data[j].optionName,
                  });
                }
                this.$set(this.tableLabel[i], 'filters', temptOptins);
                const name = this.tableLabel[i].dataIndex;
                this.$set(this.tableLabel[i], 'scopedSlots', { 'customRender': name });
                this.$set(this.tableLabel[i], 'onFilter', (value, record) => record[name].indexOf(value) === 0);
              }
            }
          }
        }
      })
  }

  /**
   * 获取列表所有数据
   */
  getAllListData(schemaCode) {
    this.tableData.length = 0;
    this.constTableData.length = 0;
    axios
      .get(this.bimURL + `bim/analysis/getAllListData`, {
        params: {
          schemaCode: schemaCode,
          projectName: this.projectName,
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const temptData = res.data.content;
          for (let i = 0; i < temptData.length; i++) {
            this.$set(temptData[i].data, 'key', temptData[i].data.id)
            this.tableData.push(temptData[i].data);
          }
        }

        this.constTableData = JSON.parse(JSON.stringify(this.tableData));
      })
  }

  /**
   * 获取列表表头
   */
  getTableLabel(schemaCode) {
    this.tableLabel = [ {
      title: '序号',
      align: "center",
      width: 50,
      customRender: (text, record, index) => `${index + 1}`,
    } ];
    this.attachment = [];
    axios
      .get(this.bimURL + `api/app/query/get`, {
        params: {
          schemaCode: schemaCode,
          code: schemaCode,
          source: 1
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          const resColumn = res.data.queryColumns;
          for (let i = 0; i < resColumn.length; i++) {
            //排除子表
            if (resColumn[i].propertyType !== 8) {
              if (resColumn[i].propertyType == 6) {
                this.tableLabel.push({
                  align: "center",
                  title: resColumn[i].name,
                  dataIndex: resColumn[i].propertyCode,
                  key: resColumn[i].propertyCode,
                  ellipsis: true,
                  scopedSlots: { customRender: resColumn[i].propertyCode, }
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
          }
        }
        this.tableLabel.push({
          align: "center",
          title: "操作",
          key: "操作",
          width: 160,
          scopedSlots: { customRender: "操作" }
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
    console.log('viewDetail', value);
    const token = localStorage.getItem("token");
    if (value.id.indexOf("/") != -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    if (value.id.indexOf("/") == -1) {
      axios
        .get(this.bimURL + `api/runtime/form/get_form_url`, {
          params: {
            bizObjectId: value.id,
            schemaCode: this.schemaCode,
          }
        }).then(res => {
        return window.open(`${env.portalHost}${res}&access_token=${token}`)
      })
    }
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
        textStyle: { color: "#fff", fontSize: 12 },
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
          center: [ '50%', '42%' ],
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
    this.$emit('clearCustomEntity');
    //获取当前点击索引，
    const preUrl = `${env.apiHost}`;
    const token = window.localStorage.getItem("token");
    axios
      .post(this.bimURL + `bim/analysis/showStaticData`, {
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
        //@ts-ignore
        if (res.errcode == 0) {
          this.$emit('createCustomEntity', res.data);
        }
        console.log('showStaticData========================================', res);
      })
  }

  /**
   * 按钮：新增
   */
  addNew() {
    const { href,route } = this.$router.resolve({
      name: 'form-detail',
      query: {
        schemaCode: this.schemaCode,
        sheetCode: this.schemaCode,
        queryCode: this.schemaCode,
        projectName: this.projectName,
        iframeAction: 'add',
        return: `${this.$route.fullPath}&iframeAction=add`
        // access_token: localStorage.getItem("token")
      }
    })
    if(this.isDingTalk) {
      this.$router.push(route.fullPath)
    }else {
    window.open(href,'_blank')
    }
    // window.open(`${env.portalHost}/form/detail?schemaCode=${this.schemaCode}&sheetCode=${this.schemaCode}&queryCode=${this.schemaCode}&access_token=${token}`)
  }

  /**
   * 按钮：坐标分布（表格操作栏--定位）
   */
  distribution(value) {
    this.$emit('clearCustomEntity');
    // const token = localStorage.getItem("token");
    const preUrl = `${env.apiHost}`;
    axios
      .post(this.bimURL + `bim/analysis/showTableData`, {
        dataList: typeof value == "string" ? this.tableData : [ value ],
        appCode: this.projectCode,
        optionCode: this.optionCode,
        preUrl: preUrl,
        projectName: this.projectName,
        schemaCode: this.schemaCode,
        // token:token
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.$emit('createCustomEntity', res.data);
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
    axios
      .post(this.bimURL + `bim/analysis/filterAllModelData`, {
        dataList: this.constTableData,
        filterValue: '',
        propertyCode: ''
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableData = res.data
        }
        console.log('filterAllModelData========', this.constTableData, this.tableData)
      })
  }

  /**
   * 按钮：坐标数据
   */
  filterAllCoorData() {
    axios
      .post(this.bimURL + `bim/analysis/filterAllCoorData`, {
        dataList: this.constTableData,
        filterValue: '',
        propertyCode: ''
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableData = res.data
        }
        console.log('filterAllCoorData========', this.constTableData, this.tableData)
      })
  }

  /**
   * 点击左侧模型树，筛选下方表格
   */
  filterData(key) {
    console.log('key========', key)
    axios
      .post(this.bimURL + `bim/analysis/filterData`, {
        dataList: this.constTableData,
        filterValue: key[0],
        propertyCode: 'bsId'
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.tableData = res.data
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
    axios
      .post(this.bimURL + `bim/analysis/getStaticData`, {
        appCode: this.projectCode,
        dataList: this.tableData,
        optionCode: value,
        projectName: this.projectName,
        schemaCode: this.schemaCode,
      })
      .then(res => {
        //@ts-ignore
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
                }
              )
            }
            this.drawPie(color, name, data)
          } else {
          }
        }
        console.log('getStaticData========', res)
      })
  }

  /**
   * 关联详情
   */
  showConnect(value, index) {
    this.isConnectShow = true;
    this.rowData = [ value ];
    this.index = index + 1;
  }

  getQueryById(value) {
    this.codeData = {}
    axios
      .get(this.bimURL + `codeManage/queryById`, {
        params: {
          appCode: this.projectCode,
          id: value[0],
        }
      })
      .then(res => {
        //@ts-ignore
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

  @Watch('tableData', { immediate: true })
  tableDataListener(val: Array<object>) {
    this.$nextTick(function () {
      this.initPiePic(this.optionCode)
    })
  }

}
