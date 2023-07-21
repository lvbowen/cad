<template>
  <div class="used-record full-height flex flex-column">
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
        <span>审批人：</span>
        <base-select :options="managerOptions" :value="currentManager" @changeValue="getDeviceListByPurpose"/>
        <!--        <span>工单状态：</span>-->
        <!--        <base-select :options="stateOptions" :value="currentState" @changeValue="getDeviceListByState"/>-->
        <span>审批结果：</span>
        <base-select :options="auditResultOptions" :value="currentAuditResult" @changeValue="getDeviceListByAuditResult"/>
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
        <template slot="auditResult" slot-scope="t,r">
          <span :class="t==='通过'?'pass':'no-pass'"> {{ t }}</span>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,`${projectCode}_device_apply`)">查看</a>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import {ProjectConfig, UsedRecordInfo, TableColumn, DeviceFilterInfo} from "../../type";
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
import { getDeviceApplyByProjectNamePage,getDeviceApplySearchRule } from "../../service/deviceInfo";
import {getFormUrl} from "../../service/api";

@Component({
  name: 'UsedRecord',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
    BaseSelect
  }
})
export default class UsedRecord extends Vue {
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
  currentCreater: string = '';
  createrOptions:string[] = [];
  createrRule:DeviceFilterInfo[] = [];
  getDeviceListByCreater(value:string) {
    this.currentCreater = value;
    this.getDeviceList();
  }
  //manager
  managerOptions: string[] = [];
  currentManager: string = '';
  managerRule:DeviceFilterInfo[] = [];
  getDeviceListByPurpose(value:string) {
    this.currentManager = value;
    this.getDeviceList();
  }
  //state
  stateOptions: string[] = [];
  currentState: string = '';
  stateRule:DeviceFilterInfo[] = [];
  getDeviceListByState(value:string) {
    this.currentState = value;
    this.getDeviceList();
  }
  //auditResultOptions
  auditResultOptions: string[] = [];
  currentAuditResult: string = '';
  getDeviceListByAuditResult(value:string) {
    this.currentAuditResult = value;
    this.getDeviceList();
  }
  //table
  num: number = 0;
  defaultPagesData: UsedRecordInfo[] = [];
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
      key: 'sequenceNo',
      width: 130
    },
    {
      title: '发起人',
      dataIndex: 'creater',
      key: 'creater',
      width: 100
    },
    {
      title: '发起日期',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: '起始使用时间',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '预计归还时间',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: '使用用途',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 300,
      ellipsis: true
    },
    {
      title: '审批人',
      dataIndex: 'manager',
      key: 'manager',
      width: 100
    },
    {
      title: '审批结果',
      dataIndex: 'auditResult',
      key: 'auditResult',
      width: 120,
      scopedSlots: { customRender: 'auditResult'}
    },
    // {
    //   title: '工单状态',
    //   dataIndex: 'state',
    //   key: 'state'
    // },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
      width: 100
    }
  ];

  getDeviceList() {
    this.defaultPagesData = [];
    this.tableLoading = true;
    let currentState:string = '';
    this.stateRule.map((s) => {
      if(s.name === this.currentState) {
        currentState = s.value;
      }
    })
    let currentCreater:string = '';
    this.createrRule.map((s) => {
      if(s.name === this.currentCreater) {
        currentCreater = s.value;
      }
    })
    let currentManager:string = '';
    this.managerRule.map((s) => {
      if(s.name === this.currentManager) {
        currentManager = s.value;
      }
    })
    getDeviceApplyByProjectNamePage({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      creater: currentCreater,
      manager: currentManager,
      auditResult: this.currentAuditResult,
      state: currentState,
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
        schemaCode: `${this.projectCode}_device_apply`,
        startWorkflowCode: this.isWorkflow?`${this.projectCode}_device_apply`:undefined,
        sheetCode: `${this.projectCode}_device_apply`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        fieldParam1: this.selectDeviceId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getDeviceApplySearchRule() {
    getDeviceApplySearchRule({
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
          case 'manager':
            this.managerRule = item.value;
            this.managerOptions = item.value.map((s)=> {
              return s.name
            })
           break;
          case 'state':
            this.stateRule = item.value;
            this.stateOptions = item.value.map((s)=> {
              return s.name
            })
            break;
          case 'auditResult':
            this.auditResultOptions = item.value
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
.used-record {

}
</style>
