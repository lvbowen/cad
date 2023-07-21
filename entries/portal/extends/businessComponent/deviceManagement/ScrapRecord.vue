<template>
  <div class="scrap-record full-height flex flex-column">
    <div class="base-search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入单据号"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span>发起人：</span>
        <base-select
          @changeValue="getDeviceListByCreater"
          :options="createrOptions"
          :value="currentCreater"/>
        <a-button
          @click="toForm"
          type="primary">新增
        </a-button>
        <!--        <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteRefModal()">-->
        <!--          <a-button-->
        <!--            type="primary">删除</a-button>-->
        <!--        </a-popconfirm>-->
      </div>
    </div>
    <div class="device-table flex-auto">
      <a-table
        bordered
        :key="num"
        rowKey="id"
        :data-source="defaultPagesData"
        :columns="defaultPagesColumns"
        :loading="tableLoading"
        :pagination="{
          pageSize: this.pageSize,
          total: this.curNodeUsersTotal,
          pageNum: this.pageNum,
          onChange: this.paginationChange
        }">
        <template slot="pics" slot-scope="t,r">
          <div v-if="t">
            <a href="#" @click="showPics(r)" class="pic">查看图片列表</a>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,`${projectCode}_device_scrap`)">查看</a>
        </template>
      </a-table>
    </div>
    <PicModal @onCancel="onCancel" :visible="visiblePics" :imgSrc="imgSrc"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import {ProjectConfig, DeviceScrapTasks, TableColumn, DeviceFilterInfo, Pics} from "../../type";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import BaseSelect from "./BaseSelect.vue";
import {
  getDeviceScrapTasks,
  getDeviceScrapSearchRule,
} from "../../service/deviceInfo";
import {getFormUrl} from "../../service/api";
import { PicModal } from '../EquipmentStatistics/Components'

@Component({
  name: 'ScrapRecord',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
    BaseSelect,
    PicModal
  }
})
export default class ScrapRecord extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig;
  @Prop() selectDeviceId!:string;
  isWorkflow: boolean = false;
  //search
  keyWords: string = '';
  pageNum: number = 1;
  pageSize: number = 15;
  curNodeUsersTotal: number = 0;

  enterSearch(e) {
    this.keyWords = e.target.value;
    this.pageNum = 1;
    this.getDeviceList();
  }
  getModalList(keyword) {
    this.keyWords = keyword;
    this.pageNum = 1;
    this.getDeviceList();
  }

  //creater
  createrRule:DeviceFilterInfo[] = [];
  currentCreater: string = '';
  createrOptions:string[] = [];
  getDeviceListByCreater(value:string) {
    this.currentCreater = value;
    this.getDeviceList();
  }

  //table
  num: number = 0;
  defaultPagesData: DeviceScrapTasks[] = [];
  tableLoading: boolean = false;
  defaultPagesColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '单据号',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo'
    },
    {
      title: '发起人',
      dataIndex: 'creater',
      key: 'creater'
    },
    {
      title: '发起日期',
      dataIndex: 'scrapDate',
      key: 'scrapDate',
    },
    {
      title: '报废原因',
      dataIndex: 'scrapReason',
      key: 'scrapReason',
      width: 350
    },
    {
      title: '报废原设备照片',
      dataIndex: 'pics',
      key: 'pics',
      scopedSlots: { customRender: 'pics'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'}
    }
  ];
  visiblePics: boolean = false;
  imgSrc:Pics[] = [];
  onCancel(val){
    this.visiblePics = val;
  }
  showPics(record){
    this.imgSrc = record.pics;
    this.visiblePics = true;
  };

  getDeviceList() {
    this.defaultPagesData = [];
    this.tableLoading = true;
    let currentCreater:string = '';
    this.createrRule.map((s) => {
      if(s.name === this.currentCreater) {
        currentCreater = s.value;
      }
    })
    getDeviceScrapTasks({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      creater: currentCreater,
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.defaultPagesData = res.data.records;
      this.curNodeUsersTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false
    })
  }

  paginationChange(page: number, pageSize: number) {
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getDeviceList();
  }

  searchDeviceDetail(id: string,schemaCode:string) {
    getFormUrl({
      bizObjectId: id,
      schemaCode: schemaCode
    }).then((res)=> {
      if(this.isDingTalk) {
        //@ts-ignore
        this.$router.push(res)
      }else{
        window.open(`/${this.projectCode}${res}`);
      }
    })
  }

  toForm() {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_device_scrap`,
        sheetCode: `${this.projectCode}_device_scrap`,
        startWorkflowCode: this.isWorkflow?`${this.projectCode}_device_scrap`:undefined,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        fieldParam1: this.selectDeviceId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getDeviceApplySearchRule() {
    getDeviceScrapSearchRule({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      res.data.map((item) => {
        switch (item.name) {
          case 'creater':
            this.createrRule = item.value;
            this.createrOptions = item.value.map((s)=> {
              return s.name
            })
            break;
          case 'isWorkflow':
            this.isWorkflow = item.value;
        }
      })
    })
  }

  mounted() {
    this.getDeviceList();
    this.getDeviceApplySearchRule()
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import './deviceManagement.public.less';
.scrap-record {

}
</style>
