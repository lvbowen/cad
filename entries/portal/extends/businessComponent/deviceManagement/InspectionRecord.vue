<template>
  <div class="inspection-record full-height flex flex-column">
    <div class="flex tabs">
      <span :class="activeTab==='task'?'tab-active':''" @click="changeActiveTab('task')">巡检工单</span>
      <span :class="activeTab==='plan'?'tab-active':''" @click="changeActiveTab('plan')">巡检计划</span>
    </div>
    <div class="base-search-btn flex flex-space-between">
      <a-input-search
        :placeholder="activeTab==='plan'?'请输入计划名称':'请输入单据号'"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span v-show="activeTab==='task'">巡检工单名称：</span>
        <base-select
          v-show="activeTab==='task'"
          @changeValue="getDeviceListByTaskPlans"
          :options="taskPlansOptions"
          :value="currentTaskPlans"/>
        <span v-show="activeTab==='task'">巡检人：</span>
        <base-select
          v-show="activeTab==='task'"
          @changeValue="getDeviceListByTaskChecker"
          :options="taskCheckerOptions"
          :value="currentTaskChecker"/>
        <span v-show="activeTab==='task'">巡检结果：</span>
        <base-select
          v-show="activeTab==='task'"
          :options="taskResultOptions"
          :value="currentTaskResult"
          @changeValue="getDeviceListByTaskResult"/>
        <span v-show="activeTab==='plan'">巡检人：</span>
        <base-select
          v-show="activeTab==='plan'"
          @changeValue="getDeviceListByInspectChecker"
          :options="inspectCheckerOptions"
          :value="currentInspectChecker"/>
        <span v-show="activeTab==='plan'">计划类型：</span>
        <base-select
          v-show="activeTab==='plan'"
          :options="planTypeOptions"
          :value="currentplanType"
          @changeValue="getDeviceListByPlanType"/>
        <a-button
          @click="toForm(activeTab==='plan'?'device_inspect_plan':'device_inspect_task')"
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
        :data-source="activeTab==='task'?taskPagesData:inspectPlansPagesData"
        :columns="activeTab==='task'?taskPagesColumns:inspectPlansPagesColumns"
        :loading="tableLoading"
        :pagination="{
          pageSize: this.pageSize,
          total: this.curNodeUsersTotal,
          pageNum: this.pageNum,
          onChange: this.paginationChange
        }">
        <template slot="inspectCode" slot-scope="t,r">
          <span :class="t==='正常'?'pass':'no-pass'"> {{ t }}</span>
        </template>
        <template slot="pics" slot-scope="t,r">
          <div v-if="t">
            <a href="#" @click="showPics(r)" class="pic">查看图片列表</a>
          </div>
        </template>
        <template slot="repair" slot-scope="t,r">
          <a href="#" @click="searchDeviceDetail(t.id,t.schemaCode)" v-if="t">{{ t.displayName }}</a>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,activeTab ==='plan'?`${projectCode}_device_inspect_plan`:`${projectCode}_device_inspect_task`)">查看</a>
        </template>
      </a-table>
    </div>
    <PicModal @onCancel="onCancel" :visible="visiblePics" :imgSrc="imgSrc"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import {
  ProjectConfig,
  DeviceInspectPlans,
  DeviceInspectTasks,
  TableColumn,
  DeviceFilterInfo,
  Pics
} from "../../type";
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
import { getDeviceInspectTasks,getDeviceInspectSearchRule,getDeviceInspectPlans } from "../../service/deviceInfo";
import { getFormUrl } from "../../service/api";
import { PicModal } from '../EquipmentStatistics/Components'
@Component({
  name: 'InspectionRecord',
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
export default class InspectionRecord extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig;
  @Prop() selectDeviceId!:string;
  isWorkflow: boolean = false;
  activeTab: string = 'task';
  changeActiveTab(tabs:string) {
    this.activeTab = tabs;
    this.keyWords = '';
    this.pageNum = 1;
    this.pageSize = 15;
    this.curNodeUsersTotal = 0;
    if(this.activeTab === 'plan') {
      this.getDeviceInspectPlans()
    }else if(this.activeTab === 'task') {
      this.getDeviceInspectTasks()
    }
  }
  //search
  keyWords: string = '';
  pageNum: number = 1;
  pageSize: number = 15;
  curNodeUsersTotal: number = 0;

  enterSearch(e) {
    this.keyWords = e.target.value;
    this.pageNum = 1;
    if(this.activeTab === 'plan') {
      this.getDeviceInspectPlans()
    }else if(this.activeTab === 'task') {
      this.getDeviceInspectTasks()
    }
  }
  getModalList(keyword) {
    this.keyWords = keyword;
    this.pageNum = 1;
    if(this.activeTab === 'plan') {
      this.getDeviceInspectPlans()
    }else if(this.activeTab === 'task') {
      this.getDeviceInspectTasks()
    }
  }
  //inspectChecker-巡检人
  currentInspectChecker: string = '';
  inspectCheckerOptions:string[] = [];
  inspectCheckerRule: DeviceFilterInfo[] = [];
  getDeviceListByInspectChecker(value:string) {
    this.currentInspectChecker = value;
    this.getDeviceInspectPlans();
  }
  //planType
  planTypeOptions: string[] = [];
  currentplanType: string = '';
  getDeviceListByPlanType(value:string) {
    this.currentplanType = value;
    this.getDeviceInspectPlans();
  }
  getDeviceInspectPlans() {
    this.inspectPlansPagesData = [];
    this.tableLoading = true;
    let currentInspectChecker:string = '';
    this.inspectCheckerRule.map((s) => {
      if(s.name === this.currentInspectChecker) {
        currentInspectChecker = s.value;
      }
    })
    getDeviceInspectPlans({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      checker: currentInspectChecker,
      planType: this.currentplanType
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.inspectPlansPagesData = res.data.records;
      this.curNodeUsersTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false;
    })
  }

  //table
  num: number = 0;
  inspectPlansPagesData: DeviceInspectPlans[] = [];
  tableLoading: boolean = false;
  inspectPlansPagesColumns: TableColumn<any>[] = [
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
      title: '巡检计划名称',
      dataIndex: 'planName',
      key: 'planName'
    },
    {
      title: '计划类型',
      dataIndex: 'planType',
      key: 'planType'
    },
    {
      title: '周期类型',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '巡检频率',
      dataIndex: 'num',
      key: 'num'
    },
    {
      title: '计划开始时间',
      dataIndex: 'checkStartDate',
      key: 'checkStartDate',
    },
    {
      title: '计划结束时间',
      dataIndex: 'checkEndDate',
      key: 'checkEndDate'
    },
    {
      title: '巡检人员',
      dataIndex: 'checker',
      key: 'checker'
    },
    {
      title: '巡检项数量',
      dataIndex: 'checkItemsNum',
      key: 'checkItemsNum'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'}
    }
  ];
  //task
  taskPagesData: DeviceInspectTasks[] = [];
  taskPagesColumns: TableColumn<any>[] = [
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
      title: '巡检工单名称',
      dataIndex: 'planName',
      key: 'planName'
    },
    {
      title: '工单编号',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo'
    },
    {
      title: '巡检执行人',
      dataIndex: 'checker',
      key: 'checker',
    },
    {
      title: '巡检数量',
      dataIndex: 'checkItemsNum',
      key: 'checkItemsNum'
    },
    {
      title: '巡检结果',
      dataIndex: 'inspectCode',
      key: 'inspectCode',
      scopedSlots: { customRender: 'inspectCode'}
    },
    {
      title: '巡检照片',
      dataIndex: 'pics',
      key: 'pics',
      scopedSlots: { customRender: 'pics'}
    },
    {
      title: '关联维修工单',
      dataIndex: 'repair',
      key: 'repair',
      scopedSlots: { customRender: 'repair'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'}
    }
  ];
  //taskChecker-巡检人
  currentTaskChecker: string = '';
  taskCheckerOptions:string[] = [];
  taskCheckerRule: DeviceFilterInfo[] = [];
  getDeviceListByTaskChecker(value:string) {
    this.currentTaskChecker = value;
    this.getDeviceInspectTasks();
  }
  //plans-巡检工单名称
  currentTaskPlans: string = '';
  taskPlansOptions:string[] = [];
  taskPlansRule: DeviceFilterInfo[] = [];
  getDeviceListByTaskPlans(value:string) {
    this.currentTaskPlans = value;
    this.getDeviceInspectTasks();
  }
  //currentTaskResult-巡检结果
  taskResultOptions: string[] = [];
  currentTaskResult: string = '';
  getDeviceListByTaskResult(value:string) {
    this.currentTaskResult = value;
    this.getDeviceInspectTasks();
  }
  getDeviceInspectTasks() {
    this.taskPagesData = [];
    this.tableLoading = true;
    let currentTaskChecker:string = '';
    this.taskCheckerRule.map((s) => {
      if(s.name === this.currentTaskChecker) {
        currentTaskChecker = s.value;
      }
    })
    let planId:string = '';
    this.taskPlansRule.map((s) => {
      if(s.name === this.currentTaskPlans) {
        planId = s.value;
      }
    })
    getDeviceInspectTasks({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      checker: currentTaskChecker,
      result: this.currentTaskResult,
      planId: planId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.taskPagesData = res.data.records;
      this.curNodeUsersTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false;
    })
  }
  visiblePics: boolean = false;
  imgSrc:Pics[] = [];
  onCancel(val){
    this.visiblePics = val;
  }
  showPics(record){
    this.imgSrc = record.pics;
    this.visiblePics = true;
  };

  paginationChange(page: number, pageSize: number) {
    this.pageNum = page;
    this.pageSize = pageSize;
    if(this.activeTab === 'plan') {
      this.getDeviceInspectPlans()
    }else if(this.activeTab === 'task') {
      this.getDeviceInspectTasks()
    }
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

  toForm(bizSchemaCode:string) {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_${bizSchemaCode}`,
        sheetCode: `${this.projectCode}_${bizSchemaCode}`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        startWorkflowCode: this.isWorkflow?`${this.projectCode}_${bizSchemaCode}`:undefined,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        fieldParam1: this.selectDeviceId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  getDeviceInspectSearchRule() {
    getDeviceInspectSearchRule({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      res.data.map((item) => {
        if(item.name === 'planRule') {
          item.value.map((v)=> {
            switch (v.name) {
              case 'inspectChecker':
                this.inspectCheckerRule = v.value;
                this.inspectCheckerOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
              case 'planType':
                this.planTypeOptions = v.value;
                break;
            }
          })
        }else if(item.name === 'taskRule'){
          item.value.map((v)=> {
            switch (v.name) {
              case 'checker':
                this.taskCheckerRule = v.value;
                this.taskCheckerOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
              case 'plans':
                this.taskPlansRule = v.value;
                this.taskPlansOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
              case 'result':
                this.taskResultOptions = v.value;
                break;
            }
          })
        }else if(item.name === 'isWorkflow') {
          this.isWorkflow = item.value;
        }
      })
    })
  }

  mounted() {
    this.getDeviceInspectSearchRule();
    if(this.activeTab === 'plan') {
      this.getDeviceInspectPlans()
    }else if(this.activeTab === 'task') {
      this.getDeviceInspectTasks()
    }
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import './deviceManagement.public.less';
.inspection-record {
  .pic {
    display: block;
  }
}
</style>
