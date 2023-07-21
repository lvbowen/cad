<template>
  <article :class="[this.infoShow? 'show' : 'hide', 'main']">
    <vue-drag-resize
      :w="vw"
      :h="vh"
      :x="left"
      :y="top"
      :isResizable="false">
      <div class="pop-main" :style="{ width: `${vw + 60}px`, height: `${vh + 45}px` }">
        <div style="margin: 10px">
          <a-button size="small" @click="submit()">提交</a-button>
          <p class="closeBtn" @click="closeInfo">X</p>
        </div>
        <a-table
          rowKey="index"
          :columns="tableLabel"
          :data-source="tableData"
          :pagination="false"
        ></a-table>
      </div>
    </vue-drag-resize>
  </article>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import * as ModelApi from "../../../service/modelInterface";

@Component({
  name: "ConnectInfo",
  components: {VueDragResize, AButton: Button, ATable: Table},
})
export default class ConnectInfo extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop() projectName!: string;
  @Prop() schemaCode!: string;
  @Prop() rowData!: Array<any>;
  @Prop() index!: string;
  @Prop() codeData?: any;
  @Prop() location?: any;

  vw: number = 750;
  vh: number = 100;
  top: number = 100;
  left: number = 800;
  infoShow: boolean = false;
  tableLabel: Array<object> = [
    {
      title: "序号",
      align: "center",
      key: "index",
      dataIndex: "index",
    },
    {
      align: "center",
      title: "编码名称",
      key: "codeName",
      dataIndex: "codeName",
    },
    {
      align: "center",
      title: "编码",
      key: "codeValue",
      dataIndex: "codeValue",
    },
    {
      align: "center",
      title: "经度",
      key: "longitude",
      dataIndex: "longitude",
      // scopedSlots: { customRender: "longitude" },
    },
    {
      align: "center",
      title: "纬度",
      key: "latitude",
      dataIndex: "latitude",
      // scopedSlots: { customRender: "latitude" },
    },
    {
      align: "center",
      title: "高程",
      key: "altitude",
      dataIndex: "altitude",
      // scopedSlots: { customRender: "altitude" },
    },
  ];
  tableData: Array<any> = [];

  @Watch("location", {immediate: true})
  locationListener(val: any) {
    if (JSON.stringify(val) !== "{}" && this.tableData.length !== 0) {
      this.tableData[0].codeValue = null;
      this.tableData[0].codeName = null;
      this.tableData[0].codeId = null;
      this.tableData[0].longitude = val.position.x;
      this.tableData[0].latitude = val.position.y;
      this.tableData[0].altitude = val.position.z;
    }
  }

  @Watch("codeData", {immediate: true})
  codeDataListener(val: any) {
    if (JSON.stringify(val) !== "{}" && this.tableData.length !== 0) {
      this.tableData[0].longitude = null;
      this.tableData[0].latitude = null;
      this.tableData[0].altitude = null;
      this.tableData[0].codeValue = val.codeValue;
      this.tableData[0].codeName = val.codeName;
      this.tableData[0].codeId = val.codeId;
    }
  }

  @Watch("rowData", {immediate: true})
  indexListener(val: Array<any>) {
    this.initTable();
    this.vw = 750;
    this.vh = 100;
    this.top = 100;
    this.left = 800;
    if (val.length !== 0) {
      this.infoShow = true;
    }
  }

  @Watch("infoShow", {immediate: true})
  infoShowListener(val: boolean) {
    this.$emit('sendMessage', val ? 1 : 0)
  }

  closeInfo() {
    this.infoShow = false;
    this.$emit('closeConnectInfo')
  }

  initTable() {
    this.tableData = [];
    let temptData: any = {};
    ModelApi.getDataRelateAnalysis({
      appCode: this.projectCode,
      data: this.rowData[0],
    }).then((res) => {
      if (res.errcode === 0) {
        temptData = res.data;
        this.$set(temptData, "index", this.index);
        this.tableData.push(temptData);
      }
    });
  }

  submit() {
    ModelApi.updateDataRelateAnalysis({
      altitude: this.tableData[0].altitude,
      appCode: this.projectCode,
      codeValue: this.tableData[0].codeValue ?? '',
      dataId: this.rowData[0].id,
      latitude: this.tableData[0].latitude,
      longitude: this.tableData[0].longitude,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
    }).then((res) => {
      if (res.errcode === 0) return this.$message.success(res.errmsg as string);
    });
  }
}
</script>

<style lang="less" scoped>
/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
}

.main {
  position: relative;

  .pop-main {
    position: fixed;
    margin-left: -30px;
    margin-top: -10px;
    background-color: rgba(28, 54, 106, 0.8);
  }

  .closeBtn {
    float: right;
    width: 14px;
    height: 14px;
    margin-top: 7px;
    color: #fff;
    //margin-right: 30px;
  }

  &.show {
    height: 0;
    width: 0;
    z-index: 10;
  }

  &.hide {
    display: none;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: #2970ff !important;
  }

  /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
    background: transparent;
    color: #ffffff;
  }

  /deep/ .ant-table-thead > tr > th {
    //表头背景色
    background-color: #3582f3;
    padding: 8px 8px !important;
    overflow-wrap: break-word;
    border-bottom: 1px solid transparent;
    color: rgba(248, 245, 245, 0.85);
    font-weight: 400;
    font-size: 13px;
  }

  /deep/ .ant-table-tbody > tr > td {
    padding: 2px 8px !important;
    border-bottom: 1px solid transparent;
    color: #ffffff;
  }

  /deep/ .ant-table-fixed-header .ant-table-scroll .ant-table-header {
    //margin-bottom: -20px !important;
    background-color: transparent;
  }

  /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
    position: relative;
    background-color: transparent;
  }

  /deep/ .ant-table-placeholder {
    display: none;
  }

  .ant-btn {
    background-color: transparent;
    color: #ffffff;
    border: 1px solid #307ae4 !important;
  }

  .ant-btn:active,
  .ant-btn:focus {
    color: #17e5fd;
  }

  .ant-btn:hover,
  .ant-btn:focus {
    color: #17e5fd;
  }
}
</style>
