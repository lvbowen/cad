<template>
  <div class="device-list full-height flex flex-column">
    <div class="search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入设备名称"
        v-model="keyWords"
        :disabled="selectDeviceTypeId===''"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span>设备状态：</span>
        <base-select
          :options="deviceStateOptions"
          :value="currentState"
          @changeValue="getDeviceListByState"
          :disabled="selectDeviceTypeId===''"/>
        <a-button
          @click="toForm"
          :disabled="selectDeviceTypeId===''"
          type="primary">新增设备
        </a-button>
        <!--        <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteRefModal()">-->
        <!--          <a-button-->
        <!--            :disabled="selectDeviceTypeId===''"-->
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
        <template slot="deviceState" slot-scope="text">
          <span class="base-status" :class="text==='未入场'?'error-color':text==='使用中'?'success-color':text==='维修中'?'warning-color':text==='已报废'?'cancel-color':text==='已退场'?'danger-color':''">{{ text }}</span>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,record.deviceName)">查看</a>
        </template>
      </a-table>
    </div>
    <device-standing-book-detail
      :showDeviceDetail="showDeviceDetail"
      :selectDeviceName="selectDeviceName"
      :selectDeviceId="selectDeviceId"
      @closeDeviceDetailModal="closeDeviceDetailModal"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Watch, InjectReactive, Prop} from 'vue-property-decorator';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import {ProjectConfig, RelationModelPage, TableColumn} from "../../type";
import {exampleData} from "../engineeringArchives/mock";
import DeviceStandingBookDetail from "./DeviceStandingBookDetail.vue";
import {listApi, listParams} from "@cloudpivot/api";
import ApplicationList from '@cloudpivot/list/src/components/pc/scripts/application-list';
import BaseSelect from "./BaseSelect.vue";

@Component({
  name: 'DeviceList',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    ATable: Table,
    ASelect: Select,
    ASelectOption: Select.Option,
    APopconfirm: Popconfirm,
    DeviceStandingBookDetail,
    AIcon: Icon,
    BaseSelect
  }
})
export default class DeviceList extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;
  @Prop() selectDeviceTypeId!: string;
  @Prop() codeValue!: string;
  @Prop() codeId!: string;
  @Watch('selectDeviceTypeId', {deep: true})
  selectDeviceIdListener(val) {
    this.num++;
    this.keyWords = '';
    this.currentState = '';
    this.pageNum = 1;
    this.defaultPagesData = [];
    if (val) {
      this.getDeviceList();
      //刷新列表
    } else {

    }
  }

  toForm() {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_device_info`,
        sheetCode: `${this.projectCode}_device_info`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        typeId: this.selectDeviceTypeId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  //search
  keyWords: string = '';
  pageNum: number = 1;
  pageSize: number = 15;
  curNodeUsersTotal: number = 0;
  currentState: string = '';
  isShowClearIcon: boolean = false;

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
  //
  deviceStateOptions: string[] = ['未入场','使用中','维修中','已报废','已退场'];
  getDeviceListByState(value:string) {
    this.currentState = value;
    this.getDeviceList();
  }
  clearState() {
    this.currentState = '';
    this.getDeviceList();
  }

  //table
  num: number = 0;
  defaultPagesData: any[] = [];
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
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName'
    },
    {
      title: '设备编号',
      dataIndex: 'deviceSn',
      key: 'deviceSn',
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: '设备责任人',
      dataIndex: 'managers',
      key: 'managers',
      align: 'center'
    },
    {
      title: '设备状态',
      dataIndex: 'deviceState',
      key: 'deviceState',
      align: 'center',
      width: 120,
      scopedSlots: { customRender: 'deviceState'}
    },
    {
      title: '最新巡检日期',
      dataIndex: 'lastCheckTime',
      key: 'lastCheckTime',
    },
    {
      title: '最新保养日期',
      dataIndex: 'lastMaintainDate',
      key: 'lastMaintainDate'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'}
    }
  ];

  getDeviceList() {
    // this.defaultPagesData = exampleData.response.data.deviceList
    this.defaultPagesData = [];
    this.tableLoading = true;
    listApi.getTableDataByDic({
      page: this.pageNum - 1,
      size: this.pageSize,
      appCode: this.projectCode,
      schemaCode: `${this.projectCode}_device_info`,
      codeValue: this.codeValue,
      codeId: this.codeId,
      projectName: this.projectConfig?.projectName??'',
      multiProjectFlag: this.projectConfig?.multiProjectFlag??false,
      filters: [
        {
          propertyCode: "xmjc_1",
          propertyType: 0,
          propertyValue: this.projectConfig?.projectName??'',
        },
        {
          propertyCode: "deviceState",
          propertyType: 0,
          propertyValue: this.currentState,
        },
        {
          propertyCode: "deviceName",
          propertyType: 0,
          propertyValue: this.keyWords,
        }
      ]
    }).then((res)=> {
      if(res.errcode === 0) {
        if ( res.data.content != null && Array.isArray(res.data.content)) {
          res.data.content.map((item) => {
            //设备状态
            if(item.data.hasOwnProperty('deviceTypeId')) {
              Object.assign(item,{ deviceType: item.data.deviceTypeId.code_name})
            }
            //设备责任人
            if(item.data.hasOwnProperty('manager')) {
              let managers = '';
              item.data.manager.map((m)=> {
                managers = managers + '  ' +m.name
              })
              Object.assign(item.data,{ managers: managers})
            }
            this.defaultPagesData.push(item.data)
          })
        }
        this.curNodeUsersTotal = res.data.totalElements;
      }
    }).finally(()=> {
      this.tableLoading = false;
    })
  }

  deleteRefModal() {
  }

  paginationChange(page: number, pageSize: number) {
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getDeviceList();
  }

  searchDeviceDetail(id:string,name:string) {
    this.showDeviceDetail = true;
    this.selectDeviceName = name;
    this.selectDeviceId = id;
  }

  //device-detail
  selectDeviceId: string = '';
  selectDeviceName: string = '';
  showDeviceDetail: boolean = false;
  closeDeviceDetailModal() {
    this.showDeviceDetail = false;
  }

  mounted() {
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import '../classLibrary/classLibrary.modules.less';

.device-list {
  .search-btn  {
    /deep/ .ant-select {
      min-width: 120px;
      margin-right: @spacing-base;
    }
  }
  .device-table {
    overflow: auto;

    .ant-table-wrapper {
      .full-height;
      .overflow-hidden;
    }

    /deep/ .ant-spin-nested-loading {
      .full-height;

      .ant-spin-container {
        .full-height;
        .flex;
        .flex-column;

        .ant-table {
          .full-height;
          .overflow-hidden;

          .ant-table-content {
            .full-height;
            overflow-y: auto;
          }
        }

        .ant-pagination {
          text-align: right;
          padding-right: @spacing-large;
        }
      }
    }

    .base-status {
      color: #FFFFFF;
      font-weight: bold;
      padding: 1/4 *@spacing-base;
      border-radius: 5px;
    }

    .base-color {
      background-color: @base-color;
    }
    .success-color {
      background-color: @success-color;
    }
    .warning-color {
      background-color: @warning-color;
    }
    .cancel-color {
      background-color: @cancel-color;
    }
    .error-color {
      background-color: @error-color;
    }
    .danger-color {
      background-color: @danger-color-p;
    }
  }
}
</style>
