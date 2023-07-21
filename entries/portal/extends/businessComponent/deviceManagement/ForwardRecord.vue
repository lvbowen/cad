<template>
  <div class="forward-record full-height flex flex-column">
    <div class="base-search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入单据号"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span>原责任人：</span>
        <base-select
          @changeValue="getDeviceListByOldManager"
          :options="oldManagerOptions"
          :value="currentOldManager"/>
        <span>新责任人：</span>
        <base-select :options="newManagerOptions" :value="currentNewManager" @changeValue="getDeviceListByNewManager"/>
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
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,`${projectCode}_device_transfer`)">查看</a>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import {ProjectConfig, DeviceTransferTasks, TableColumn, DeviceFilterInfo} from "../../type";
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
import {getDeviceTransferSearchRule, getDeviceTransferTasks} from "../../service/deviceInfo";
import {getFormUrl} from "../../service/api";

@Component({
  name: 'ForwardRecord',
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
export default class ForwardRecord extends Vue {
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
  //oldManager
  oldManagerRule:DeviceFilterInfo[] = [];
  currentOldManager: string = '';
  oldManagerOptions:string[] = [];
  getDeviceListByOldManager(value:string) {
    this.currentOldManager = value;
    this.getDeviceList();
  }
  //newManager
  newManagerOptions: string[] = [];
  currentNewManager: string = '';
  newManagerRule:DeviceFilterInfo[] = [];
  getDeviceListByNewManager(value:string) {
    this.currentNewManager = value;
    this.getDeviceList();
  }
  //table
  num: number = 0;
  defaultPagesData: DeviceTransferTasks[] = [];
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
      title: '转交日期',
      dataIndex: 'transferDate',
      key: 'transferDate'
    },
    {
      title: '转交原因',
      dataIndex: 'transferReason',
      key: 'transferReason'
    },
    {
      title: '原责任人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '新责任人',
      dataIndex: 'newManager',
      key: 'newManager'
    },
    {
      title: '审批人',
      dataIndex: 'deviceMajor',
      key: 'deviceMajor',
    },
    {
      title: '审批意见',
      dataIndex: 'auditOpinion',
      key: 'auditOpinion',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'}
    }
  ];

  getDeviceList() {
    this.defaultPagesData = [];
    this.tableLoading = true;
    let currentOldManager:string = '';
    this.oldManagerRule.map((s) => {
      if(s.name === this.currentOldManager) {
        currentOldManager = s.value;
      }
    })
    let currentNewManager:string = '';
    this.newManagerRule.map((s) => {
      if(s.name === this.currentNewManager) {
        currentNewManager = s.value;
      }
    })
    getDeviceTransferTasks({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      oldManager: currentOldManager,
      newManager: currentNewManager
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
        schemaCode: `${this.projectCode}_device_transfer`,
        sheetCode: `${this.projectCode}_device_transfer`,
        startWorkflowCode: this.isWorkflow?`${this.projectCode}_device_transfer`:undefined,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        fieldParam1: this.selectDeviceId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getDeviceApplySearchRule() {
    getDeviceTransferSearchRule({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      res.data.map((item) => {
        switch (item.name) {
          case 'oldManager':
            this.oldManagerRule = item.value;
            this.oldManagerOptions = item.value.map((s)=> {
              return s.name
            })
            break;
          case 'newManager':
            this.newManagerRule = item.value;
            this.newManagerOptions = item.value.map((s)=> {
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
.forward-record {

}
</style>
