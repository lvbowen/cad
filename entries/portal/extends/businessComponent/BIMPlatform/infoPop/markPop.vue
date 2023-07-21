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
        <div>
          <p class="title">数据详情</p>
          <img
            src="../../../../src/assets/extends/bim/infoPop/close.png"
            class="closeBtn"
            @click="()=>{this.markStr=''}">
        </div>
        <div class="father_tab">
          <p class="table_p">{{ title }}</p>
          <a-table
            class="devOps_table"
            :pagination="false"
            :columns="tableLabel"
            :data-source="tableData"
          >
            <template
              slot="msg"
              slot-scope="text, record"
            >
              <a v-if="record.property&&record.msg!=='查看/编辑'" @click="toUrl(record)" class="underline">
                <img
                  src="../../../../src/assets/extends/bim/infoPop/11.png"
                  style="width: 18px;height:17px;"
                />{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
              <a v-else-if="record.property&&record.msg==='查看/编辑'" @click="toUrl(record)">{{
                record.msg
              }}</a>
              <p v-else>{{ record.msg }}</p>
            </template>
            <template
              slot="name"
              slot-scope="text, record"
            >
              <p style="color: #0BCDA3">{{ record.name }}</p>
            </template>
          </a-table>
        </div>
      </div>
    </vue-drag-resize>
  </article>
</template>
<script lang="ts">
import { getFormUrl} from './infoPop.api';
import {Button, Tabs, Spin, Table, Checkbox, Icon} from "@h3/antd-vue";
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
//@ts-ignore
import VueDragResize from 'vue-drag-resize';
//@ts-ignore
import env from "@/config/env";
import axios from "axios";

@Component({
  name: "infoPopTs",
  components: {
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    AIcon: Icon,
    ASpin: Spin,
    VueDragResize
  }
})
export default class infoPopTs extends Vue {
  @Prop() projectCode!: string;

  @Prop() schemaCode!: string;

  @Prop() dataId!: Array<any>;


  vw: number = 0;
  vh: number = 0;
  top: number = 0;
  left: number = 0;

  markStr: string = '';
  showSpin: boolean = false;
  bimURL: string = `${env.apiHost}/`;
  title: string = '';


  tableData: Array<object> | null = [];
  tableLabel: Array<object> = [{
    title: '属性',
    dataIndex: 'name',
    width: '120px',
    key: 'name',
    scopedSlots: {customRender: 'name'},
  }, {
    title: '值',
    dataIndex: 'msg',
    key: 'msg',
    scopedSlots: {customRender: 'msg'},
  }];

  @Watch('dataId', {immediate: true})
  dataIdListener(val: string) {
    this.markStr = val[0];
    this.vw = 350;
    this.vh = 500;
    this.top = 60;
    this.left = 1100;
    this.initable();
  }


  initable() {
    axios
      .get(this.bimURL + `bim/analysis/getDataFromCoordinate`, {
        params: {
          appCode: this.projectCode,
          dataId: this.dataId[0],
          schemaCode: this.schemaCode
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode === 0) {
          this.title = Object.keys(res.data)[0];
          this.tableData = res.data[this.title]
        }else{
          //@ts-ignore
          this.$message.warn(res.errmsg)
        }
      })
  }


  toUrl(value) {
    const token = localStorage.getItem("token");
    if (value.property.indexOf("/") != -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    if (value.property.indexOf("/") == -1) {
      getFormUrl({
        bizObjectId: value.property,
        schemaCode: value.schemaCode,
      }).then(res => {
        return window.open(`${env.portalHost}${res}&access_token=${token}`)
      })
    }
  }
}

</script>
<style lang="less" scoped>
html {
  --foo: 88px;
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

.pop_main {
  background: url("../../../../src/assets/extends/bim/bg_xk.png");
  background-size: 100% 100%;
  position: fixed;
  margin-left: -30px;
  margin-top: -10px;
}

.title {
  width: 100px;
  height: 48px;
  font-size: 20px;
  font-family: Source Han Sans CN;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 48px;
  float: left;
  margin-top: 20px;
  margin-left: 30px;
}

.closeBtn {
  float: right;
  width: 14px;
  height: 14px;
  margin-top: 30px;
  margin-right: 30px;
}

.father_tab {
  clear: both;
  margin: 30px;

    .table_p {
      text-align: center;
      font-size: 20px;
      background: url("../../../../src/assets/extends/bim/infoPop/pic.png");
      background-size: 100% 100%;
      font-family: '楷体';
      line-height: 12px;
      font-weight: 600;
      color: #FFFFFF;
  }


  .devOps_table {
    margin-top: 1%;
    margin-bottom: 10px;
    width: 100%;
    overflow: auto;
    height: 400px;
    //clear: both;
    .underline {
      border-bottom: 1px solid white;
      padding-bottom: 3px
    }

    /deep/ .ant-table {
      height: auto;
    }

    /deep/ .ant-table-tbody > tr:hover > td {
      background: #558fab !important
    }

    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-thead {
      display: none;
    }

    /deep/ .ant-table-tbody > tr > td {
      padding: 8px 8px !important;
      border-bottom: 0px solid transparent;
      color: #ffffff;
      text-align: center;
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
  }

  ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }
}

/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
}
</style>
