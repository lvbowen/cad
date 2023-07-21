<template>
  <div class="maintain-record full-height flex flex-column">
    <div class="flex tabs">
      <span :class="activeTab==='task'?'tab-active':''" @click="changeActiveTab('task')">保养工单</span>
      <span :class="activeTab==='plan'?'tab-active':''" @click="changeActiveTab('plan')">保养计划</span>
    </div>
    <div class="base-search-btn flex flex-space-between">
      <a-input-search
        :placeholder="activeTab==='plan'?'请输入计划名称':'请输入单据号'"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getModalList"></a-input-search>
      <div class="flex flex-center-align">
        <span v-show="activeTab==='task'">保养工单名称：</span>
        <base-select
          v-show="activeTab==='task'"
          @changeValue="getDeviceListByTaskPlans"
          :options="taskPlansOptions"
          :value="currentTaskPlans"/>
        <span v-show="activeTab==='task'">保养人员：</span>
        <base-select
          v-show="activeTab==='task'"
          @changeValue="getDeviceListByTaskChecker"
          :options="taskCheckerOptions"
          :value="currentTaskChecker"/>
        <span v-show="activeTab==='plan'">保养频率：</span>
        <base-select
          v-show="activeTab==='plan'"
          :options="maintainFreqOptions"
          :value="currentTaskMaintainFreq"
          @changeValue="getDeviceListByTaskFreq"/>
        <span v-show="activeTab==='plan'">保养人：</span>
        <base-select
          v-show="activeTab==='plan'"
          @changeValue="getDeviceListByMaintainer"
          :options="maintainerOptions"
          :value="currentMaintainer"/>
        <span v-show="activeTab==='plan'">保养等级：</span>
        <base-select
          v-show="activeTab==='plan'"
          :options="planLevelOptions"
          :value="currentplanLevel"
          @changeValue="getDeviceListByPlanLevel"/>
        <a-button
          @click="toForm(activeTab==='plan'?'device_maintainPlan':'device_maintainTask')"
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
        <template slot="pics" slot-scope="t,r">
          <div v-if="t">
            <a href="#" @click="showPics(r)" class="pic">查看图片列表</a>
          </div>
        </template>
        <template slot="repair" slot-scope="t,r">
          <a href="#" @click="searchDeviceDetail(t.id,t.schemaCode)" v-if="t">{{ t.displayName }}</a>
        </template>
        <template slot="spareParts" slot-scope="t,r">
          <a href="#" @click="searchDeviceDetail(t.id,t.schemaCode)" v-if="t">{{ t.displayName }}</a>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a href="#" @click="searchDeviceDetail(record.id,activeTab ==='plan'?`${projectCode}_device_maintainPlan`:`${projectCode}_device_maintainTask`)">查看</a>
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
  TableColumn,
  DeviceFilterInfo,
  DeviceMaintainTasks, DeviceMaintainPlans, Pics
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
import { getDeviceMaintainTasks,getDeviceMaintainSearchRule,getDeviceMaintainPlans } from "../../service/deviceInfo";
import {getFormUrl} from "../../service/api";
import { PicModal } from '../EquipmentStatistics/Components'

@Component({
  name: 'MaintainRecord',
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
export default class MaintainRecord extends Vue {
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
  //table
  num: number = 0;
  inspectPlansPagesData: DeviceMaintainPlans[] = [];
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
      title: '保养计划名称',
      dataIndex: 'planName',
      key: 'planName'
    },
    {
      title: '保养等级',
      dataIndex: 'maintainLevel',
      key: 'maintainLevel'
    },
    {
      title: '保养频率',
      dataIndex: 'maintainFreq',
      key: 'maintainFreq',
    },
    {
      title: '已保养次数',
      dataIndex: 'maintainNum',
      key: 'maintainNum',
      width: 120
    },
    {
      title: '保养人员',
      dataIndex: 'maintainer',
      key: 'maintainer',
      width: 100
    },
    {
      title: '保养内容',
      dataIndex: 'maintainDesc',
      key: 'maintainDesc',
      width: 400,
      ellipsis: true
    },
    {
      title: '最近一次保养日期',
      dataIndex: 'lastMaintainDate',
      key: 'lastMaintainDate',
    },
    {
      title: '下次保养日期',
      dataIndex: 'nextMaintainDate',
      key: 'nextMaintainDate',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
      width: 80

    }
  ];

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

  getDeviceMaintainSearchRule() {
    getDeviceMaintainSearchRule({
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
              case 'maintainer':
                this.maintainerRule = v.value;
                this.maintainerOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
              case 'level':
                this.planLevelOptions = v.value;
                break;
              case 'freq':
                this.maintainFreqOptions = v.value;
                break;
            }
          })
        }else if(item.name === 'taskRule'){
          item.value.map((v)=> {
            switch (v.name) {
              case 'maintainer':
                this.taskCheckerRule = v.value;
                this.taskCheckerOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
              case 'plan':
                this.taskPlansRule = v.value;
                this.taskPlansOptions = v.value.map((i)=> {
                  return i.name
                })
                break;
            }
          })
        }else if(item.name === 'isWorkflow') {
          this.isWorkflow = item.value;
        }
      })
    })
  }


  //inspectChecker-保养人
  currentMaintainer: string = '';
  maintainerOptions:string[] = [];
  maintainerRule: DeviceFilterInfo[] = [];
  getDeviceListByMaintainer(value:string) {
    this.currentMaintainer = value;
    this.getDeviceInspectPlans();
  }
  //planType
  planLevelOptions: string[] = [];
  currentplanLevel: string = '';
  getDeviceListByPlanLevel(value:string) {
    this.currentplanLevel = value;
    this.getDeviceInspectPlans();
  }
  //currentTaskMaintainFreq-巡检结果
  maintainFreqOptions: string[] = [];
  currentTaskMaintainFreq: string = '';
  getDeviceListByTaskFreq(value:string) {
    this.currentTaskMaintainFreq = value;
    this.getDeviceInspectPlans();
  }
  getDeviceInspectPlans() {
    this.inspectPlansPagesData = [];
    this.tableLoading = true;
    let currentMaintainer:string = '';
    this.maintainerRule.map((s) => {
      if(s.name === this.currentMaintainer) {
        currentMaintainer = s.value;
      }
    })
    getDeviceMaintainPlans({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      maintainLevel: this.currentplanLevel,
      maintainFreq: this.currentTaskMaintainFreq,
      maintainer: currentMaintainer
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.inspectPlansPagesData = res.data.records;
      this.curNodeUsersTotal = res.data.total;
    }).finally(()=> {
      this.tableLoading = false;
    })
  }

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
    getDeviceMaintainTasks({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId,
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      keyWord: this.keyWords,
      maintainer: currentTaskChecker,
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
  //task-table
  taskPagesData: DeviceMaintainTasks[] = [];
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
      title: '保养工单名称',
      dataIndex: 'planName',
      key: 'planName'
    },
    {
      title: '工单编号',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo'
    },
    {
      title: '保养人',
      dataIndex: 'maintainer',
      key: 'maintainer',
      width: 100
    },
    {
      title: '保养内容',
      dataIndex: 'maintainDesc',
      key: 'maintainDesc',
      width: 400,
      ellipsis: true
    },
    {
      title: '保养时间',
      dataIndex: 'maintainDate',
      key: 'maintainDate',
    },
    {
      title: '保养照片',
      dataIndex: 'pics',
      key: 'pics',
      scopedSlots: { customRender: 'pics'}
    },
    {
      title: '关联备品备件工单',
      dataIndex: 'spareParts',
      key: 'spareParts',
      scopedSlots: { customRender: 'spareParts'}
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
      scopedSlots: {customRender: 'operation'},
      width: 80
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
  mounted() {
    this.getDeviceMaintainSearchRule()
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
.maintain-record {

}
</style>
