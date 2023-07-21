<template>
  <div class="attendance-record full-height flex flex-column">
    <div class="base-search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入单据号"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span>入/离场状态：</span>
        <base-select
          @changeValue="getDeviceListByCreater"
          :options="stateOptions"
          :value="currentState"/>
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
        <template slot="inOrOut" slot-scope="t,r">
          <span :class="t==='进场'?'pass':'no-pass'"> {{ t }}</span>
        </template>
        <template slot="pics" slot-scope="t,r">
          <div v-if="t">
            <a href="#" @click="showPics(r)" class="pic">查看图片列表</a>
          </div>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,`${projectCode}_device_present`)">查看</a>
        </template>
      </a-table>
    </div>
    <PicModal @onCancel="onCancel" :visible="visiblePics" :imgSrc="imgSrc"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import {ProjectConfig, AttendanceRecordInfo, TableColumn, Pics} from "../../type";
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
import { getDevicePresentRecords,getDevicePresentSearchRule } from "../../service/deviceInfo";
import { PicModal } from '../EquipmentStatistics/Components'
import {getFormUrl} from "../../service/api";

@Component({
  name: 'AttendanceRecord',
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
export default class AttendanceRecord extends Vue {
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
  //state
  currentState: string = '';
  stateOptions:string[] = [];
  getDeviceListByCreater(value:string) {
    this.currentState = value;
    this.getDeviceList();
  }

  //table
  num: number = 0;
  defaultPagesData: AttendanceRecordInfo[] = [];
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
      title: '类型',
      dataIndex: 'inOrOut',
      key: 'inOrOut',
      scopedSlots: { customRender: 'inOrOut'}
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
      title: '入场日期',
      dataIndex: 'inOrOutDate',
      key: 'inOrOutDate',
    },
    {
      title: '登记验收日期',
      dataIndex: 'registerDate',
      key: 'registerDate'
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '设备照片',
      dataIndex: 'pics',
      key: 'pics',
      scopedSlots: { customRender: 'pics'}
    },
    {
      title: '审批人',
      dataIndex: 'checker',
      key: 'checker',
    },
    {
      title: '审批结果',
      dataIndex: 'checkerOpinion',
      key: 'checkerOpinion'
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
    getDevicePresentRecords({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      inOrOut: this.currentState
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
        schemaCode: `${this.projectCode}_device_present`,
        startWorkflowCode: this.isWorkflow?`${this.projectCode}_device_present`:undefined,
        sheetCode: `${this.projectCode}_device_present`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        deviceId: this.selectDeviceId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getDevicePresentSearchRule() {
    getDevicePresentSearchRule({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      res.data.map((item) => {
        if(item.name === 'type') {
          this.stateOptions = item.value;
        }
        if(item.name === 'isWorkflow') {
          this.isWorkflow = item.value;
        }
      })
    })
  }

  mounted() {
    this.getDeviceList();
    this.getDevicePresentSearchRule();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import './deviceManagement.public.less';
.attendance-record {

}
</style>
