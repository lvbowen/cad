<template>
  <article class="mainContainer">
    <!--    左 侧边栏 显示状态-->
    <a-card class="left_class" :class="isLeftShow?'cardShow':'cardHide'">
      <div class="mainTree">
        <nav class="title">
          <span>计量清单</span>
          <a-input-search
            placeholder="请输入关键字进行搜索"
            size="small"
            :allowClear="true"
            @search="onSearch"/>
        </nav>
        <div class="left_tree">
          <a-tree
            selectable
            :defaultExpandedKeys="treeExpandData"
            :key="treeKey"
            :loadData="onLoadData"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"
          >
            <template slot="title" slot-scope="text,record">
              <span
                v-if="highLightKeys.indexOf(text.eventKey)>-1"
                style="color: #0BCDA3">{{ text.listName }}</span>
              <span v-else>{{ text.listName }}</span>
            </template>
          </a-tree>
        </div>
      </div>
      <div class="cardOpt">
        <img
          v-show="isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a1.png"
          @click="() => {this.isLeftShow = false}"
          style="height: 100%;width: 100%"
        />
        <img
          v-show="!isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a.png"
          @click="() => {this.isLeftShow = true}"
          style="height: 100%;width: 100%"
        />
      </div>
    </a-card>
    <div
      :role="isBottomShow?'showContainer':'hideContainer'"
      ref="MainTable"
      class="bottom_class"
    >
      <nav class="bottomOption">
        <img
          :src="bottomArray"
          @click="() => {this.isBottomShow = false}"
          class="bottom_array"
          v-show="isBottomShow"
        />
        <img
          :src="bottomArrayHide"
          @click="() => {this.isBottomShow = true}"
          class="bottom_array"
          v-show="!isBottomShow"
        />
      </nav>
      <main class="bottomMain">
        <div style="width:75%" v-show="!isDetailShow">
          <a-table
            size="small"
            class="bottom_table"
            rowKey="id"
            :columns="tableLabel"
            :data-source="tableData"
            :customRow="rowClick"
            :rowClassName="setRowClassName"
            :scroll="{ x: '100%', y: tableHeight}"
          >
            <template
              slot="操作"
              slot-scope="text, record"
            >
              <a @click="showDetail(record)">查看详情</a>
            </template>
            <template
              slot="payState"
              slot-scope="text, record">
              <div :class="record.payState === '进行中'?'doing':record.payState === '已完成'?'done':'todo'">
                {{ record.payState }}
              </div>
            </template>
            <template
              slot="measureState"
              slot-scope="text, record">
              <p :class="record.measureState === '进行中'?'doing':record.measureState === '已完成'?'done':'todo'">
                {{ record.measureState }}</p>
            </template>
          </a-table>
        </div>
        <div class="detailContainer" v-show="!isDetailShow">
          <nav class="detailNav">
            <a-button
              class="bottom_button"
              style="float: left;margin-left: 10px"
              @click="clickMap">
              模型展示
            </a-button>
            <a-button
              :class="buttonIndexBottom !== '支付状态'?'bottom_button':'bottom_hover_button'"
              @click="payClick">
              支付状态
            </a-button>
            <a-button
              :class="buttonIndexBottom !== '计量状态'?'bottom_button':'bottom_hover_button'"
              @click="measureClick">
              计量状态
            </a-button>
          </nav>
          <div id="myChart"/>
        </div>
        <div v-show="isDetailShow" style="width:100%;">
          <img
            :src="arrayIcon"
            style="float: left;font-size:25px;margin-top: 1%"
            @click="() => {this.isDetailShow = false}">
          <div style="float: left;width: 98%;margin-left: 1%">
            <a-table
              size="small"
              class="bottom_table"
              :columns="detailLabel"
              :data-source="detailData"
              :customRow="rowClick"
              :rowClassName="setRowClassName"
              :scroll="{ x: 1000, y: 195}"
            ></a-table>
          </div>
        </div>
      </main>
      <a-spin :spinning="isSpinShow" size="large"/>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue} from "vue-property-decorator";
import env from '@/config/env';
import {Card, Button, Icon, Table, Input, Divider, Col, Row, Tree, Dropdown, Menu, Spin, Select} from '@h3/antd-vue';
import bottomArray from '../../../../src/assets/extends/bim/frame_bottom_1.png'
import bottomArrayHide from '../../../../src/assets/extends/bim/frame_bottom_2.png'
import arrayIcon from '../../../../src/assets/extends/bim/arrow1.png'
import * as Api from "../../../service/api";
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

@Component({
  name: 'MeasureOverall',
  components: {
    ASpin: Spin,
    ADropdown: Dropdown,
    ACard: Card,
    ARow: Row,
    ACol: Col,
    AButton: Button,
    AInputSearch: Input.Search,
    ADivider: Divider,
    ATree: Tree,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
    AMenuDivider: Menu.Divider,
    AMenu: Menu,
    AMenuItem: Menu.Item
  }
})

export default class MeasureOverall extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;

  @Ref()
  MainTable?: HTMLElement;

  tableHeight: number = 0;

  bottomArray: any = bottomArray;
  bottomArrayHide: any = bottomArrayHide;
  arrayIcon: any = arrayIcon;

  bimURL: string = `${env.apiHost}/`;

  buttonList: Array<any> = [];
  isLeftShow: boolean = true;
  isBottomShow: boolean = false;
  projectData: Array<any> = [];
  //左侧项目树
  treeKey: number = 0;
  replaceFields = {
    key: "id",
    title: "listName"
  };
  treeData: Array<any> = [];
  treeExpandData: Array<any> = [];
  mainSchemaCode: string = "";
  selectedKeys: Array<string> = [];
  highLightKeys: Array<any> = [];
  //下方表格
  isSpinShow = false;
  constTable: Array<any> = [];//保存表格数据
  constMeasureStatic: Array<any> = [];//保存pie数据
  constMeasureTotal: number = 0;//保存pie数据
  tableLabel: Array<any> = [];
  measureLabel: Array<any> = [
    {
      title: '序号',
      align: "center",
      width: "4%",
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "CBS编码",
      width: "20%",
      key: "cbsQbsCode",
      dataIndex: "cbsQbsCode",
    },
    {
      align: "center",
      title: "清单项编码",
      key: "listCode",
      dataIndex: "listCode",
    },
    {
      align: "center",
      title: "名称",
      width: "15%",
      key: "name",
      dataIndex: "name",
    },
    {
      align: "center",
      title: "CBS数量",
      key: "cbsAmount",
      dataIndex: "cbsAmount",
    },
    {
      align: "center",
      title: "CBS单价",
      key: "cbsUnitPrice",
      dataIndex: "cbsUnitPrice",
    },
    {
      align: "center",
      title: "CBS合价(元)",
      key: "cbsTotalPrice",
      dataIndex: "cbsTotalPrice",
    },
    {
      align: "center",
      title: "计量状态",
      width: "7%",
      key: "measureState",
      dataIndex: "measureState",
      scopedSlots: {customRender: "measureState"}
    },
    {
      align: "center",
      title: "支付状态",
      width: "7%",
      key: "payState",
      dataIndex: "payState",
      scopedSlots: {customRender: "payState"}
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      width: "7%",
      scopedSlots: {customRender: "操作"}
    }
  ];
  tableData: Array<any> = [];
  selectedRowKeys: Array<any> = [];//表格多选
  currentRow = {};
  code: string = '';
  childColumn: Array<any> = [];
  //pie图
  measureStatic: Array<any> = [];
  measureTotal: number = 0;
  payStatic: Array<any> = [];
  payTotal: number = 0;
  //查看详情
  isDetailShow: boolean = false;
  detailLabel: Array<any> = [
    // 表头数据
    {
      align: "center",
      className: "column-class",
      title: "所属CBS",
      key: "cbs",
      dataIndex: "cbs"
    },
    {
      align: "center",
      className: "column-class",
      title: "名称",
      key: "cbsname",
      dataIndex: "cbsname"
    },
    {
      align: "center",
      className: "column-class",
      title: "CBS单价",
      key: "schemeCBSUnitPrice",
      dataIndex: "schemeCBSUnitPrice",

      scopedSlots: {customRender: "schemeCBSUnitPrice"}
    },
    {
      align: "center",
      className: "column-class",
      title: "CBS数量",
      key: "schemeCBSAmount",
      dataIndex: "schemeCBSAmount",

      scopedSlots: {customRender: "schemeCBSAmount"}
    },
    {
      align: "center",
      className: "column-class",
      title: "CBS合价",
      key: "schemeCBSMoney",
      dataIndex: "schemeCBSMoney"
    },
    {
      align: "center",
      className: "column-class",
      title: "施工申报量",
      key: "sgAmount",
      dataIndex: "sgAmount",

      scopedSlots: {customRender: "sgAmount"}
    },
    {
      align: "center",
      className: "column-class",
      title: "施工申报金额",
      key: "sgMoney",
      dataIndex: "sgMoney"
    },
    {
      align: "center",
      className: "column-class",
      title: "监理审核量",
      key: "jlAmount",
      dataIndex: "jlAmount",

      scopedSlots: {customRender: "jlAmount"}
    },
    {
      align: "center",
      className: "column-class",
      title: "监理申报金额",
      key: "jlMoney",
      dataIndex: "jlMoney"
    },
    {
      align: "center",
      className: "column-class",
      title: "业主核定量",
      key: "yzAmount",
      dataIndex: "yzAmount",

      scopedSlots: {customRender: "yzAmount"}
    },
    {
      align: "center",
      className: "column-class",
      title: "业主核定金额",
      key: "yzMoney",
      dataIndex: "yzMoney"
    },
    {
      align: "center",
      className: "column-class",
      title: "状态",
      key: "currentState",
      dataIndex: "currentState",
      filters: [
        {
          text: "已提交汇总",
          value: "已提交汇总"
        },
        {
          text: "未提交汇总",
          value: "未提交汇总"
        }
      ],
      // filterMultiple: false,
      onFilter: (value, record) => record.currentState.indexOf(value) === 0
    },
    {
      align: "center",
      className: "column-class",
      title: "计量期号",
      key: "tg04cCbscommoninfosFk",
      dataIndex: "tg04cCbscommoninfosFk"
    },
    {
      align: "center",
      className: "column-class",
      title: "创建日期",
      key: "createdTime",
      dataIndex: "createdTime"
    },
    {
      align: "center",
      className: "column-class",
      title: "备注",
      key: "remarks",
      dataIndex: "remarks",

      scopedSlots: {customRender: "remarks"}
    }
  ];
  detailData: Array<any> = [];
  //右侧表格
  SMID: string = "";
  LAYERNAME: string = '';
  stateCode: string = '';
  temptPie: object = {};
  stateCodeAll: Array<any> = [];
  buttonIndexBottom: string = '';
  dataSource: Array<any> = []

  clickMap() {
    Api.getBimCbsByStateV3({
      projectCode: this.projectCode,
      projectName: this.projectName,
      tabName: '计量支付',
      stateCode: this.stateCode,
      select: 'false',
      detailId: this.selectedKeys[0],
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      if (res.data && res.data.length !== 0) return this.$emit('modelHight', res.data);
      this.$message.warn("无对应模型！");
      this.$emit('modelHight', []);
    });
  }

  //关闭详情页面（返回上级页面）
  closeDetail() {
    this.isDetailShow = false;
  }

  /**
   *画饼图
   *Data  画图数据[{name:,value:}]
   *totalNum   总数
   */
  drawPie(Data, totalNum) {
    //@ts-ignore
    let myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear()
    myChart.setOption({
      color: ["#0ab104", "#0459ff", "#ac0505"], //环形颜色
      legend: {
        itemWidth: 15,
        orient: "vertical",
        //@ts-ignore
        x: "left",
        y: "center",
        left: "78%",
        icon: "rect",
        data: ["进行中", "已完成", "未开始"],
        textStyle: {color: "#fff", fontSize: 15},
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      graphic: {
        //图形中间文字
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "总金额" + "\n" + totalNum.toFixed(2) + "\n" + "（万元）",
          textAlign: "center",
          fill: "#fff",
          fontSize: 18,
        },
      },
      series: [
        {
          name: "详细数据",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: Data,
        },
      ],
    });
    myChart.on("click", this.eConsole);
    window.onresize = function () {
      myChart.resize();
    };
  }

  eConsole(param) {
    Api.getBimCbsByStateV3({
      projectCode: this.projectCode,
      projectName: this.projectName,
      tabName: '计量支付',
      stateCode: this.stateCode,
      select: 'false',
      detailId: this.selectedKeys[0],
      selectedState: param.name
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      if (res.data && res.data.length !== 0) return this.$emit('modelHight', res.data);
      this.$message.warn("无对应模型！");
      this.$emit('modelHight', []);
    });
  }

  initDetail(record) {
    Api.getByCBSV3({
      projectCode: this.projectCode,
      cbsCode: record.cbsQbsCode as string,
      schemaId: record.schemaId as string,
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.detailData = res.data;
    })
  }

  //初始化左侧树
  initTree() {
    this.treeExpandData = [];
    this.treeData = [];
    this.tableData = [];
    //@ts-ignore
    let myChart = echarts.init(document.getElementById('myChart'));
    myChart.clear();
    this.replaceFields = {key: "id", title: "listName"};
    Api.getCBS({
      projectCode: this.projectCode,
      projectName: this.projectName,
      parentId: '',
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      const resData = res.data;
      if (!resData) return;
      for (let i = 0; i < resData?.length; i++) {
        if (!resData?.[i].children) {
          resData[i].isLeaf = true;
        }
        this.treeExpandData.push(resData?.[i].id);
      }
      this.treeData = resData;
      this.treeKey += 1;
      this.isBottomShow = false;
    })
  }

  //点击饼图切换按钮-计量状态
  measureClick() {
    this.stateCode = '计量状态';
    this.buttonIndexBottom = '计量状态';
    this.drawPie(this.measureStatic, this.measureTotal)
  }

  mounted() {
    const {calcContentHeight} = this;
    this.calcContentHeight();
    this.code = '';
    this.mainSchemaCode = "";
    this.tableData = [];
    //设置默认
    this.initTree();
    window.addEventListener('resize', calcContentHeight);
  }

  destroyed() {
    const {calcContentHeight} = this;
    window.removeEventListener('resize', calcContentHeight);
  }

  created() {
    window.addEventListener('message', (event) => {
      if (event.data.promise) {
        this.clickMap();
      }
    })
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise(resolve => {
      if (treeNode.dataRef.children && treeNode.dataRef.children.length > 0) { // 有值了直接渲染
        //@ts-ignore
        resolve();
        return;
      }
      Api.getCBS({
        projectCode: this.projectCode,
        projectName: this.projectName,
        parentId: treeNode.$vnode.data.id,
      }).then(res => {
        if (!res.data) return;
        for (let i = 0; i < res.data.length; i++) {
          if (!res.data[i].children) {
            res.data[i].isLeaf = true;
          }
        }
        treeNode.dataRef.children = res.data;
        _this.treeData = [..._this.treeData];
      });
      //@ts-ignore
      resolve();
    });
  }

  onSearch(value) {
    this.treeExpandData = [];
    this.treeData = [];
    this.treeKey += this.treeKey;
    if (value.length == 0) return this.initTree();

    Api.getCBSByName({
      projectCode: this.projectCode,
      projectName: this.projectName,
      name: value
    }).then(res => {
      this.treeData = res.data.tree;
      this.highLightKeys = res.data.selectedIds;
      this.treeExpandData = res.data.fatherIds;
    })

  }

  // 树-选择
  async onSelect(selectedKeys: Array<string>, info?) {
    if (selectedKeys.length === 0) return;
    this.isSpinShow = true;
    this.stateCode = '';
    this.code = '';
    this.measureStatic = [];
    this.measureTotal = 0;
    this.constMeasureStatic = [];
    this.constMeasureTotal = 0;
    this.payTotal = 0;
    this.payStatic = [];
    this.selectedKeys = selectedKeys;
    this.tableData = [];
    this.isDetailShow = false;
    //清空表格选择
    this.selectedRowKeys = [];
    Api.getAllQbsV3({
      projectCode: this.projectCode,
      detailId: info.node.dataRef.id,
    }).then(res => {
      setTimeout(() => {
        this.isSpinShow = false;
      }, 300);
      if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
      this.isBottomShow = true;
      this.tableLabel = this.measureLabel;
      const resData = res.data;
      this.tableData = resData.qbsMbsTotalList;
      this.constTable = resData.qbsMbsTotalList;
      for (let key in resData.measureStatics) {
        const tempt = resData.measureStatics;
        this.measureStatic.push({name: key, value: tempt[key]});
        this.measureTotal += Number(tempt[key])
      }
      for (let key in resData.payStatics) {
        const tempt = resData.payStatics;
        this.payStatic.push({name: key, value: tempt[key]});
        this.payTotal += Number(tempt[key])
      }
      this.constMeasureStatic = this.measureStatic;
      this.constMeasureTotal = this.measureTotal;
      //默认显示计量状态饼图
      this.drawPie(this.measureStatic, this.measureTotal);
      this.buttonIndexBottom = '计量状态';
      this.stateCode = '计量状态';
    })
  }

  //点击饼图切换按钮-支付状态
  payClick() {
    this.stateCode = '支付状态';
    this.buttonIndexBottom = '支付状态';
    this.drawPie(this.payStatic, this.payTotal);
  }

  // 表格点击事件
  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.currentRow = record;
          let array: Array<any> = [];
          array.push(this.currentRow)
          Api.getBimCbsByStateV3({
            dataList: array,
            projectCode: this.projectCode,
            projectName: this.projectName,
            tabName: '计量支付',
            stateCode: this.stateCode,
            select: 'false'
          }).then((res) => {
            if (res.errcode !== 0) return this.$message.warn(res.errmsg as string);
            if (res.data && res.data.length !== 0) return this.$emit('modelHight', res.data);
            this.$message.warn("无对应模型！");
            this.$emit('modelHight', []);
          });
        },
      }
    }
  }

  //点击查看详情按钮
  showDetail(record) {
    this.isDetailShow = true;
    this.initDetail(record)
  }

  setRowClassName(record, index) {
    let rowColor = Number(index) % 2 === 0 ? "evenRowStyl" : "";
    return record === this.currentRow ? "clickRowStyl" : rowColor;
  }

  private calcContentHeight() {
    const vmHeight = 17.625;
    const containerHeight = vmHeight / 100 * (document.body.clientWidth);
    this.tableHeight = containerHeight - 25 - 30 - 24 - 40;
  }
}

</script>

<style lang="less" scoped>
@import '../BIMPlatform.module.less';
@import "../../../styles/antd.less";
.bottom_class {
  .flex;
  transition: all .3s;
  flex-direction: column;
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 17.625vw;
  width: 99.8%;
  bottom: 0px;
  margin-left: 0.1%;

  & .bottomOption {
    .flex;
    width: 1.7187vw;
    height: 1.3028vw;
    margin-left: auto;
    margin-right: auto;

    & > .bottom_array {
      margin: auto;
      width: 100%;
    }
  }

  & .bottomMain {
    .flex;
    width: 98%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0.9375vw;
  }

  & .detailContainer {
    width: 25%;
    .flex;
    flex: 1;
    flex-direction: column;
    margin-right: 8px;

    & .detailNav {
      .flex;
      width: 100%;

      & > button:first-of-type {
        margin-right: auto;
      }
    }

    & > #myChart {
      width: 100%;
      height: 90%;
    }

  }

  /deep/ .ant-btn > span {
    margin-left: 0 !important;
  }

  .bottom_button {
    margin-top: 1.5%;
    margin-right: 1%;
    float: right;
    z-index: 999;
    color: #fff !important;
    background: rgba(11, 27, 36, 0.8) !important;
    border: 1px solid #307AE4 !important;
    border-radius: 12px !important;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);

    /deep/ .ant-btn:hover, .ant-btn:focus {
      color: white;
    }
  }

  .bottom_hover_button {
    margin-top: 1.5%;
    margin-right: 1%;
    float: right;
    z-index: 999;
    color: #17e5fd !important;
    background: rgba(11, 27, 36, 0.8) !important;
    border: 1px solid #307AE4 !important;
    border-radius: 12px !important;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  }

  .bottom_table {
    width: 99%;

    .table-small-transparent;
    .pagnition-transparent;
  }
}

/deep/ .ant-card-body {
  padding-bottom: 0 !important;
  zoom: 1;
}

.ant-card-bordered {
  border: 0 solid transparent;
  border-radius: 0;
}

.mainContainer {
  .flex;

  & .left_class {
    .flex;
    position: fixed;
    background: url("../../../../src/assets/extends/bim/frame_left.png");
    background-size: 100% 100%;
    border-color: transparent;
    padding: 0.05vw;

    .mainTree {
      .flex;
      width: 100%;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      .title {
        .flex;
        flex-direction: column;
        width: 100%;
        height: auto;
        font-size: 20px;
        font-family: Microsoft YaHei, serif;
        font-weight: bolder;
        color: #FFFFFF;
        margin-bottom: 5px;

        & span[class~=ant-input-search] {
          width: 95%;
          margin-top: 5px;
          margin-left: 2px;
        }
      }

      .left_tree {
        width: 95%;
        overflow: auto;
        margin-top: 0;
        position: relative;

        /deep/ .ant-tree {
          height: 22vw !important;
        }

        .tree-transparent
      }
    }

    /deep/ .ant-card-body {
      flex-direction: row;
      display: flex;
      width: 21vw;
    }

    .cardOpt {
      display: flex;
      height: 100%;
      align-items: center;

      & > img {
        width: 27px !important;
        height: 36px !important;
        cursor: pointer;
      }
    }
  }
}

.cardShow {
  margin-left: 0 !important;
}

.cardHide {
  margin-left: -18vw !important;
}

/deep/ .ant-btn:hover, .ant-btn:focus {
  color: #17e5fd !important;
}

.doing {
  background: #0459ff;
}

.done {
  background: #0ab104;
}

.todo {
  background: #ac0505;
}

div[role=showContainer] {
  bottom: 0;
}

div[role=hideContainer] {
  bottom: -15.625vw;
}

/deep/ ::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent !important;
}

/deep/ ::-webkit-scrollbar {
  width: 4px;
}

/deep/ .clickRowStyl {
  background-color: #2970ff;
}

/deep/ .evenRowStyl {
  background-color: rgba(53, 130, 243, 0.1);
}

</style>


