<template>
  <article :class="[this.markStr!==''?'show':'hide','main']">
    <vue-drag-resize
      :w="vw"
      :h="vh"
      :x="left"
      :y="top"
      :isResizable="false"
    >
      <div class="pop_main" :style="{ width: `${vw+60}px`, height: `${vh+45}px` }">
        <div style="margin:10px">
          <a-button size="small" @click="submit()">提交</a-button>
          <img
            src="../../../../../src/assets/extends/bim/infoPop/close.png"
            class="closeBtn"
            @click="()=>{this.markStr='';this.$emit('closeConnectInfo')}"/>
        </div>
        <a-table
          :key="markNum"
          :columns="tableLabel"
          :data-source="tableData"
          :pagination="false"
        >
          <!--          <template slot="longitude" slot-scope="text, record">-->
          <!--            <editable-cell :text="text" @change="onCellChange(record.longitude, item, $event)"/>-->
          <!--          </template>-->
          <!--          <template slot="latitude" slot-scope="text, record">-->
          <!--            <editable-cell :text="text" @change="onCellChange(record.latitude, item, $event)"/>-->
          <!--          </template>-->
          <!--          <template slot="altitude" slot-scope="text, record">-->
          <!--            <editable-cell :text="text" @change="onCellChange(record.altitude, item, $event)"/>-->
          <!--          </template>-->
        </a-table>
      </div>
    </vue-drag-resize>
  </article>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
//@ts-ignore
import VueDragResize from 'vue-drag-resize';
import {Button, Table,} from "@h3/antd-vue";
import axios from "axios";
import env from "@/config/env";
import EditableCell from "../../../measurePayment/data/editTableCell.vue";

@Component({
  name: "connectInfo",
  components: {
    VueDragResize,
    AButton: Button,
    ATable: Table,
    EditableCell
  }
})
export default class connectInfo extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() schemaCode!: string;
  @Prop() rowData!: Array<any>;
  @Prop() index!: object;
  @Prop() codeData?: object;
  @Prop() locationData?: object;

  vw: number = 750;
  vh: number = 100;
  top: number = 100;
  left: number = 1100;
  markStr: string = '';
  tableLabel: Array<object> = [
    {
      title: '序号',
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
      scopedSlots: {customRender: "longitude"}
    },
    {
      align: "center",
      title: "纬度",
      key: "latitude",
      dataIndex: "latitude",
      scopedSlots: {customRender: "latitude"}
    },
    {
      align: "center",
      title: "高程",
      key: "altitude",
      dataIndex: "altitude",
      scopedSlots: {customRender: "altitude"}
    },];
  tableData: Array<any> = [];
  bimURL: string = `${env.apiHost}/`;
  markNum:number=0;

  @Watch('locationData', {immediate: true})
  locationDataListener(val: object) {
    if (JSON.stringify(val) !== '{}'&&this.tableData.length!==0) {
      //@ts-ignore
      this.tableData[0].longitude = val.longitude;
      //@ts-ignore
      this.tableData[0].latitude = val.latitude;
      //@ts-ignore
      this.tableData[0].altitude = val.height;
      //刷新表格
      this.markNum+=1;
    }
  }

  @Watch('codeData', {immediate: true})
  codeDataListener(val: object) {
    if (JSON.stringify(val) !== '{}'&&this.tableData.length!==0) {
      //@ts-ignore
      this.tableData[0].codeValue = val.codeValue;
      //@ts-ignore
      this.tableData[0].codeName = val.codeName;
      //@ts-ignore
      this.tableData[0].codeId = val.codeId;
    }
  }

  @Watch('rowData', {immediate: true})
  indexListener(val: Array<any>) {
    this.initTable();
    this.vw = 750;
    this.vh = 100;
    this.top = 100;
    this.left = 1100;
    if (val.length !== 0) {
      this.markStr = val[0].id;
    }
  }

  initTable() {
    this.tableData = [];
    let temptData: object = {}
    axios
      .post(this.bimURL + `bim/analysis/getDataRelate`, {
        appCode: this.projectCode,
        data: this.rowData[0],
      })
      .then(res => {
        console.log('getDataRelate', res);
        //@ts-ignore
        if (res.errcode === 0) {
          temptData = res.data;
          this.$set(temptData, 'index', this.index);
          this.tableData.push(temptData)
        }
      })
  }

  onCellChange(value, item, $event) {

  }

  submit() {
    console.log('submit', this.rowData)
    axios
      .post(this.bimURL + `bim/analysis/updateDataRelate`, {
        "altitude": this.tableData[0].altitude,
        "appCode": this.projectCode,
        "codeValue": this.tableData[0].codeValue,
        //@ts-ignore
        "dataId": this.rowData[0].id,
        "latitude": this.tableData[0].latitude,
        "longitude": this.tableData[0].longitude,
        "projectName": this.projectName,
        "schemaCode": this.schemaCode
      })
      .then(res => {
        console.log('updateDataRelate', res);
        //@ts-ignore
        if (res.errcode === 0) {
          //@ts-ignore
          return this.$message.success(res.errmsg)
        }
      })
  }
}
</script>
<style lang="less" scoped>
/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
}

.pop_main {
  position: fixed;
  margin-left: -30px;
  margin-top: -10px;
  background-color: rgba(28, 54, 106, 0.8);
}

.main {
  position: relative;

  &.show {
    height: 0;
    width: 0;
    z-index: 999999999;
  }

  &.hide {
    display: none;
  }
}

.closeBtn {
  float: right;
  width: 14px;
  height: 14px;
  margin-top: 7px;
  //margin-right: 30px;
}

/deep/ .ant-table-tbody > tr:hover > td {
  background: #2970ff !important
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
  position: relative;
  z-index: 1;
  margin-top: -1px;
  padding: 4px 8px;
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  background: transparent;
}

.ant-btn {
  background-color: transparent;
  color: #FFFFFF;
  border: 1px solid #307AE4 !important;
}

.ant-btn:active, .ant-btn:focus {
  color: #17e5fd;
}

.ant-btn:hover, .ant-btn:focus {
  color: #17e5fd;
}
</style>
