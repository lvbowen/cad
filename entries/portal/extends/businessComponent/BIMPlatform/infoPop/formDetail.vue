<template>
  <article :class="[this.markStr!==''?'show':'hide','main']">
    <vue-drag-resize
      :w="vw"
      :h="vh"
      :x="left"
      :y="top"
      :isResizable="false"
    >
      <div class="pop_main" :style="{ width: `${vw+120}px`, height: `${vh+40}px` }">
        <div style="margin:40px 40px 40px 80px">
          <a-input-search
            placeholder="请输入关键字"
            :allowClear="true"
            class="search_class"
            @search="onSearch"/>
          <img
            :src="ClosePic"
            class="closeBtn"
            @click="()=>{this.markStr='';this.$emit('closeDetail')}"/>
          <p style="clear: both;margin-bottom: 15px"/>
          <div class="table_container">
            <a-table
              :key="markNum"
              :columns="tableLabel"
              :data-source="tableData"
              :customRow="rowClick"
            >
              <template
                v-for="(val,index) in attachment"
                :slot="val"
                slot-scope="text, record"
              >
                <a
                  v-if="record[val]"
                  :key="index"
                  @click="download(record[val].downLoadUrl)"
                >{{ record[val].name }}</a>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </vue-drag-resize>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
//@ts-ignore
import VueDragResize from 'vue-drag-resize';
import env from '@/config/env';
import {Button, Table, Input} from "@h3/antd-vue";
import ClosePic from '../../../../src/assets/extends/bim/infoPop/close.png'
import {getCardTableData, queryGet} from './infoPop.api';

@Component({
  name: "connectInfo",
  components: {
    VueDragResize,
    AButton: Button,
    ATable: Table,
    AInputSearch: Input.Search
  }
})
export default class connectInfo extends Vue {
  @Prop() appCode!: string;
  @Prop() projectName!: string;
  @Prop() smid!: any;
  @Prop() dataSource!: Array<any>;
  @Prop() schemaCode!: string;
  @Prop() modelType!:string;
  @Prop() codeValue!: string;

  vw: number = 1200;
  vh: number = 600;
  top: number = 150;
  left: number = 300;
  markStr: string = '';
  ClosePic: any = ClosePic;


  markNum: number = 0;
  tableLabel: Array<any> = [];
  tableData: Array<any> = [];
  attachment: Array<string> = [];//用于保存附件列的dataIndex


  @Watch('schemaCode', {immediate: true})
  indexListener(val: string) {
    this.initTable();
    this.vw = 1200;
    this.vh = 600;
    this.top = 150;
    this.left = 300;
    if (val.length !== 0) {
      this.markStr = val;
    }
  }

  initTable() {
    this.getTableLabel();
    this.getTableData()
  }

  onSearch(v) {
    this.tableData = [];
    const params = {
      schemaCode: this.schemaCode,
      projectName: this.projectName,
      keyWord: v,
      dataSource:this.dataSource,
      smid:this.smid[0],
      appCode:this.appCode,
      modelType: this.modelType??'',
      codeValue: this.codeValue??''
    };
    getCardTableData(params).then(res => {
        if (res.errcode !== 0) return
        //@ts-ignore
        const temptData = res.data.content;
        for (let i = 0; i < temptData.length; i++) {
          this.$set(temptData[i].data, 'key', temptData[i].data.id)
          this.tableData.push(temptData[i].data);
        }
      })
  }

  /**
   * 获取列表表头
   */
  getTableLabel() {
    this.tableLabel = [ {
      title: '序号',
      align: "center",
      width: 50,
      customRender: (text, record, index) => `${index + 1}`,
    } ];
    this.attachment = [];
    const params ={
      schemaCode: this.schemaCode,
      code: this.schemaCode,
      source: 1
    }
    queryGet(params).then(res => {
        //@ts-ignore
        if (res.errcode !== 0) return
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
      })
  }

  getTableData(){
    this.tableData = [];
    const params = {
      schemaCode: this.schemaCode,
      projectName: this.projectName,
      dataSource:this.dataSource,
      smid:this.smid[0],
      appCode:this.appCode,
      modelType: this.modelType??'',
      codeValue: this.codeValue??''
    };
    getCardTableData(params).then(res => {
      if (res.errcode !== 0) return
      //@ts-ignore
      const temptData = res.data.content;
      for (let i = 0; i < temptData.length; i++) {
        this.$set(temptData[i].data, 'key', temptData[i].data.id)
        this.tableData.push(temptData[i].data);
      }
    })
  }

  rowClick(record, index) {
    return {
      on: {
        dblclick: () => {
          const token = localStorage.getItem("token");
          const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
          const url = `/form/detail?schemaCode=${this.schemaCode}&sheetCode=${this.schemaCode}&objectId=${record.id}&access_token=${token}`;
          if(this.isDingTalk) {
            this.$router.push(`${url}&return=${ encodeURIComponent( urlReturn ) }`)
          }else {
            window.open(`${env.portalHost}${url}`)
          }
        },
      }
    };
  }

  download(v){
    if(v) return window.open(`${env.apiHost}/${v}`)
  }
}
</script>

<style lang="less" scoped>
/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
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

  .pop_main {
    background: url("../../../../src/assets/extends/bim/infoPop/bg_form.png");
    background-size: 100% 100%;
    position: fixed;
    margin-left: -60px;
    margin-top: -10px;

    .closeBtn {
      float: right;
      width: 14px;
      height: 14px;
      margin-top: 7px;
      cursor: pointer;
      //margin-right: 30px;
    }

    .search_class {
      width: 200px;
      float: left;
    }

    .table_container{
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

      /deep/ .ant-table-body {
        position: relative;
        background-color: transparent;
        height: 450px !important;
      }

      /deep/ .ant-table-placeholder {
        display: none;
      }

      //表格分页
      /deep/ .ant-pagination-item-active {
        font-weight: 500;
        background: transparent;
        color: white;
        border-color: #2970ff;
      }

      /deep/ .ant-pagination-item {
        color: #ffffff !important;
        background-color: transparent;
        border: 1px solid #d9d9d9;
      }

      /deep/ .ant-table-pagination.ant-pagination {
        float: right;
        margin: 1px !important;
      }

      //表格页码-数字
      /deep/ .ant-pagination-item a {
        color: #ffffff;
      }

      //表格页码-数字-点击
      /deep/ .ant-pagination-item-active a {
        color: #2970ff;
      }

      //表格页码向前向后跳转
      /deep/ .ant-pagination-item-link {
        color: #ffffff;
        background-color: transparent;
      }

      /deep/ .ant-pagination-item-ellipsis {
        color: #ffffff;
      }
    }

  }
}
</style>
