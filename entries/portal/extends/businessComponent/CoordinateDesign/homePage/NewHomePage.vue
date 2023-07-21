<template>
  <div class="new-home-page flex flex-column full-height">
    <div class="flex flex-space-between">
      <div
        v-for="(item,index) in statisticsConfig"
        :key="index"
        class="total-view flex flex-center-align flex-center"
        :style="{width:`${95/statisticsConfig.length}%`}">
        <img :src="require(`../../../../src/assets/extends/coordinate/${item.img}.png`)" alt="">
        <div class="flex flex-column flex-center-align">
          <div class="text flex-center-align"> <b>{{ item.text }}</b><span class="value">{{ item.value }}</span>{{ item.dw }}</div>
        </div>
      </div>
    </div>
    <div class="works">
      <a-tabs @change="changeMenu" :activeKey="activeTaskKey" :key="activeTaskKey">
        <a-tab-pane tab="我的待办" key="todo">
          <common-menu :activeTaskKey="activeTaskKey"/>
        </a-tab-pane>
        <a-tab-pane tab="我的已办" key="done">
          <common-menu :key="menuKey+1" :activeTaskKey="activeTaskKey"/>
        </a-tab-pane>
        <a-tab-pane tab="我的未办" key="doing">
          <common-menu :key="menuKey+2" :activeTaskKey="activeTaskKey"/>
        </a-tab-pane>
      </a-tabs>
    </div>
    <!--    <div class="medium flex flex-column">-->
    <!--      <div class="flex flex-space-between flex-center-align">-->
    <!--        <div class="btns flex flex-center-align">-->
    <!--          <span class="title">我的待办</span>-->
    <!--          <a-badge v-for="i in toWorksConfig" :key="i.key" :count="i.value">-->
    <!--            <a-button :type="activeMenu===i.field?'primary':''" :icon="i.img" @click="changeActiveMenu(i.field)"><b>{{ i.text }}</b></a-button>-->
    <!--          </a-badge>-->
    <!--        </div>-->
    <!--        <div>-->
    <!--          <a @click="$router.push({name: 'TaskCenter'})">流程中心</a>-->
    <!--          <img src="../../../../src/assets/extends/coordinate/p1_more.png" alt="">-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <div class="table-height-auto flex-auto line-table-header">-->
    <!--        <a-table-->
    <!--          rowKey="id"-->
    <!--          :data-source="toDoWorksTable"-->
    <!--          :columns="activeMenu!=='externalMaterials'?toDoWorksColumns:dataColumns"-->
    <!--          :loading="tableLoading"-->
    <!--          :customRow="toDoWorksRowClick"-->
    <!--          :scroll="{ y: 300 }"-->
    <!--          :pagination="false">-->
    <!--          <template #planEndTime="text, record">-->
    <!--            <span :style="{color:record.risk==='正常'?'#3BB141':record.risk==='紧急'?'#E6A23C':record.risk==='已过期'?'#DE1037':'',fontWeight:'bold'}">{{ text }}</span>-->
    <!--          </template>-->
    <!--        </a-table>-->
    <!--      </div>-->
    <!--    </div>-->
    <!--    <div class="bottom flex flex-column">-->
    <!--      <div class="flex flex-center-align">-->
    <!--        <span class="title">我的项目</span>-->
    <!--        &lt;!&ndash; <div v-for="(item,index) in projectLevelConfig" :key="index" class="menu-level">-->
    <!--          <span v-if="item.field.length && activeLevel!==1" :class="activeLevel===index+1?'active-level':''" @click="getProjectListByLevel(item.key)">{{ item.text }}</span>-->
    <!--          <a-icon type="right" v-if="item.field.length && item.key!==activeLevel"/>-->
    <!--        </div> &ndash;&gt;-->
    <!--      </div>-->
    <!--      <div class="table-height-auto flex-auto line-table-header">-->
    <!--        <a-table-->
    <!--          rowKey="id"-->
    <!--          expandRowByClick-->
    <!--          :data-source="projectList"-->
    <!--          :columns="projectListColumns"-->
    <!--          :loading="projectListLoading"-->
    <!--          :scroll="{ y: 300}"-->
    <!--          :pagination="false">-->
    <!--          <template slot="engineeringName" slot-scope="text">-->
    <!--            <span>{{ text }}</span>-->
    <!--            &lt;!&ndash; <a v-else @click="getProjectList(record.id,record.engineeringName,record.name)">{{ text }}</a> &ndash;&gt;-->
    <!--          </template>-->
    <!--          <template slot="currentStatus" slot-scope="text">-->
    <!--            <span :class="text==='进行中'?'success-color':text==='已归档'?'base-color':text==='未开始'?'warning-color':''">{{ text }}</span>-->
    <!--          </template>-->
    <!--          <template slot="planDuration" slot-scope="text" v-if="text">{{ text }}天</template>-->
    <!--          <a-table-->
    <!--            slot="expandedRowRender"-->
    <!--            slot-scope="record"-->
    <!--            class="innerTable"-->
    <!--            rowKey="id"-->
    <!--            bordered-->
    <!--            :dataSource="record.produceTasks"-->
    <!--            :columns="innerColumns"-->
    <!--            :customRow="customRow"-->
    <!--            :pagination="false">-->
    <!--          </a-table>-->
    <!--        </a-table>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts">
import {Vue, Component,InjectReactive} from 'vue-property-decorator';
import { DefineTypes,TableColumn } from "../../../type";
import {projectLevelConfig, statisticsConfig} from "../publicConfig";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Badge from 'ant-design-vue/lib/badge';
import 'ant-design-vue/lib/badge/style/index.css';
import { queryMyTaskInfo,queryMyWorkItemsNewV2,queryMyProjectsNew,queryMyProjects } from "../../../service/CoordinateDesign/myHomePage";
import {MyWorkItemsNewV2, WorkItem} from "../../../service/CoordinateDesign/TaskCenter";
import { toWorksConfig } from "../publicConfig";
import Utils from "../../../utils";
import { getPreConfig } from "../../../service/CoordinateDesign/base";
import Tabs from 'ant-design-vue/lib/tabs';
import 'ant-design-vue/lib/tabs/style/index.css';
import CommonMenu from "./CommonMenu.vue";
@Component({
  name: 'NewHomePage',
  components: {
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    ABadge: Badge,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    CommonMenu
  }
})
export default class NewHomePage extends Vue {
  @InjectReactive('project') projectCode!:string
  //TODO 改版首页 start
  menuKey: number = 0;
  activeTaskKey: string = 'todo';//todo done doing
  changeMenu(key:string) {
    // debugger
    // this.menuKey++;
    this.activeTaskKey = key
    console.log(this.activeTaskKey,'key')
  }
  //TODO end
  //statistics
  statisticsConfig: DefineTypes[] = [];
  queryMyTaskInfo() {
    queryMyTaskInfo({
      appCode: this.projectCode??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.statisticsConfig.map((item)=> {
        for (const dataKey in res.data) {
          if(item.field===dataKey) {
            if (res.data) {
              item.value = res.data[dataKey]
            }
          }
        }
      })
    })
  }
  //table
  toDoWorks: MyWorkItemsNewV2 = {
    projects: [],
    workOutlines: [],
    professionTasks: [],
    professionOutlines: [],
    designTasks: [],
    externalMaterials: []
  };
  toDoWorksTable: WorkItem[] = [];
  toDoWorksColumns:  TableColumn<any>[] = [
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
      title:"流程名称",
      dataIndex:"instanceName"
    },
    {
      title:"发起人",
      dataIndex:"originatorName",
    },
    {
      title:"当前节点",
      dataIndex:"activityName"
    },
    {
      title:"发起时间",
      dataIndex:"startTime"
    },
    {
      title:"停留时间",
      dataIndex:"",
      //@ts-ignore
      customRender:(text:string, record, index:number)=>{
        return this.calcUsedTime(record.startTime);
      }
    },
    {
      title:"截止时间",
      dataIndex:"planEndTime",
      scopedSlots: { customRender: "planEndTime"}
    }
  ];
  dataColumns: TableColumn<any>[] = [
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
      title:"流程名称",
      dataIndex:"instanceName"
    },
    {
      dataIndex: 'sourceName',
      key: 'sourceName',
      title: '资料名称'
    },
    {
      title:"发起人",
      dataIndex:"originatorName",
    },
    {
      title:"当前节点",
      dataIndex:"activityName"
    },
    {
      title:"发起时间",
      dataIndex:"startTime"
    },
    {
      title:"停留时间",
      dataIndex:"",
      //@ts-ignore
      customRender:(text:string, record, index:number)=>{
        return this.calcUsedTime(record.startTime);
      }
    },
  ]
  tableLoading: boolean = false;
  toWorksConfig: DefineTypes[] = [];
  queryMyWorkItemsNewV2() {
    this.tableLoading = true;
    queryMyWorkItemsNewV2({
      appCode: this.projectCode??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const toDoWorksKey in this.toDoWorks) {
        if(res.data[toDoWorksKey]) {
          this.toDoWorks[toDoWorksKey] = res.data[toDoWorksKey];
          this.toWorksConfig.map((item) => {
            if(item.field === toDoWorksKey) {
              item.value = this.toDoWorks[toDoWorksKey].length
            }
          })
        }
      }
      this.toDoWorksTable = this.toDoWorks[this.activeMenu]
    }).finally(()=> {
      this.tableLoading = false
    })
  }
  calcUsedTime(startTime:string):string{
    const now = +new Date();
    const start = +new Date(startTime);
    const timestamp=(now-start)/1000;
    const days = parseInt(timestamp/60/60/24+'');
    const hours = parseInt(timestamp/60/60%24+'');
    const minutes = parseInt(timestamp/60%60+'');
    let str:string="";
    if(days){
      str+=`${days}天`;
    }
    if(hours){
      str+=`${hours}小时`;
    }
    if(minutes){
      str+=`${minutes}分`;
    }
    return str;
  }
  routerKeyValue:{[key:string]:string}={
    sjrwd:"ProfessionalDesignTask",//设计任务单
    zysjtg:"ProfessionalDesignOutline",//专业任务大纲
    xmlb:"ProductionTaskList",//生产任务单
    zyrwd:"ProfessionalTask",//专业任务
    xmsqb:"ProjectPlanning",//项目策划
  }
  toDoWorksRowClick(record, index) {
    return {
      on: {
        click: (e) => {
          if (!record.pendingType) return;
          if (record.pendingType==='wlzl') {
            Utils.goForm(this,'edit',null,this.isDingTalk,record.extendId,record.workflowCode)
          }else {
            this.$router.push({
              name: this.routerKeyValue[record.pendingType],
              query: {
                projectId: record.projectId,
                id: record.extendId
              }
            });
          }
        }
      }
    }
  }

  //project-list
  projectList: any[ ]= [];
  projectListLoading: boolean = false;
  projectListColumns: Array<any>  = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {title:'项目名称',dataIndex:"engineeringName",scopedSlots: { customRender: 'engineeringName'}},
    {title:"工程分类",dataIndex:"industryType",scopedSlots: { customRender: 'currentStatus'}},
    {title:"工程类型",dataIndex:"projectType"},
    {title:"项目所在省市",dataIndex:"engineeringLocation"},
    {title:"所属年度",dataIndex:"year"},
  ];
  projectLevelConfig: DefineTypes[] = [];
  clickType: string = '';//专业提纲  设计任务单
  projectListRowClick(record, index) {
    return {
      on: {
        dblclick: (e) => {
          console.log(this.activeLevel,this.clickType,'')
          if(this.activeLevel===4) {
            if (!record.id || !record.xmlbId || !this.clickType) return;
            this.$router.push({
              name: this.clickType.indexOf('专业任务单')>-1?'ProfessionalDesignTask':this.clickType.indexOf('专业提纲')>-1?'ProfessionalDesignOutline':'',
              query: {
                projectId: record.xmlbId,
                id: record.id
              }
            });
          }
        }
      }
    }
  }

  get activeLevel() {
    let activeIndex = 1;
    this.projectLevelConfig.map((item) => {
      if(item.field?.length) {
        activeIndex = item.key
      }
    })
    return activeIndex
  }

  queryMyProjectsNew() {
    this.projectListLoading = true;
    queryMyProjectsNew({
      appCode: this.projectCode??'',
      projectId: this.projectLevelConfig.filter((r)=> r.key===2)[0].field??'',
      xmsqbId: this.projectLevelConfig.filter((r)=> r.key===3)[0].field??'',
      zyrwdId: this.projectLevelConfig.filter((r)=> r.key===4)[0].field??"",
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.projectList = res.data??[];
    }).finally(()=> {
      this.projectListLoading = false;
    })
  }

  async getMyProjects(){
    try {
      this.projectListLoading = true;
      const {errcode,errmsg,data} = await queryMyProjects({appCode:this.projectCode??''});
      if(errcode){
        return this.$message.error(`获取我的项目失败,${errmsg}`);
      }
      this.projectList = data??[];
    } catch (error) {
      this.$message.error(`获取我的项目异常,${error}`);
    }finally{
      this.projectListLoading = false;
    }
  }

  getProjectList(id: string,name: string,type:string) {
    if(this.activeLevel===3) {
      this.clickType = type;
    }
    const activeLevel = this.activeLevel;
    this.projectLevelConfig.map((item)=> {
      //tab点击
      if(activeLevel+1===item.key) {
        item.text = name;
        item.field = id;
      }
    })
    this.queryMyProjectsNew();
  }
  getProjectListByLevel(level: number) {
    this.projectLevelConfig.map((item)=> {
      //tab - 切换
      if(level<item.key) {
        item.text = '';
        item.field = '';
      }
    })
    this.queryMyProjectsNew();
  }
  activeMenu: string = '';
  changeActiveMenu(key:string) {
    this.activeMenu = key;
    this.toDoWorksTable = this.toDoWorks[key];
  }
  mounted() {
    this.activeMenu = 'projects'; //projects workOutlines professionTasks professionOutlines designTasks
    this.statisticsConfig = statisticsConfig as DefineTypes[];
    this.toWorksConfig = toWorksConfig as DefineTypes[];
    this.toWorksConfig.map((i)=> {
      i.value = 0;
    })
    this.queryMyTaskInfo();
    // this.queryMyWorkItemsNewV2();
    this.projectLevelConfig = JSON.parse(JSON.stringify(projectLevelConfig as DefineTypes[]));
    // this.queryMyProjectsNew();
    // this.getMyProjects();
    const token = localStorage.getItem('token')
    const previewUrl = sessionStorage.getItem('previewUrl')
    if (token && !previewUrl) {
      this.getPreConfig()
    }
  }

  getPreConfig() {
    getPreConfig().then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      sessionStorage.setItem('previewUrl',res.data.idocvServiceUrl)
    })
  }

  innerColumns = [
    { title: '序号', dataIndex: 'index',width:70,customRender: (text, record, index) => `${index + 1}`,align: 'center', },
    { title: '当前阶段', dataIndex: 'engineeringStage',width:150,align: 'center', },
    { title: '当前状态', dataIndex: 'manufactureStatus',align: 'center',width:150,},
    { title: '当前处理人', dataIndex: 'currentHandler',width:120,align: 'center', },
    { title: '计划开始时间', dataIndex: 'planStartTime',width:150,align: 'center',},
    { title: '计划结束时间', dataIndex: 'planEndTime', width:150,align: 'center',},
    { title: '计划工期', dataIndex: 'planDuration',width:120,align: 'center', },
    {title:"项目经理",dataIndex:"projectManager",width:120,align: 'center',},
  ]

  customRow(record){
    return {
      on:{
        click:(event)=>{
          this.$router.push({
            name:"ProductionTaskList",
            params:{
              isBack:"true",
            },
            query:{
              projectId:record.id,
            }
          })
        }
      }
    }
  }

}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../../../styles/table.modules.less';
@import '../../systemConfig/system.module.less';
.new-home-page {
  width: 80%;
  margin: 0 auto;
  overflow: hidden;
  padding-bottom:@spacing-medium;
  .title {
    font-weight: bold;
    font-size: 18px;
    color: #333333;
    padding-bottom: 1/2 * @spacing-base;
    border-bottom: 2px solid #0167D8;
    margin-right: @spacing-large;
  }
  .total-view {
    background: #FFFFFF;
    border-radius: 2px;
    padding: @spacing-large 0;
    color: #666666;
    >img {
      margin-right: @spacing-base;
    }
    .text {
      margin-left:@spacing-base;
      font-size: 18px;
    }
    .value {
      color: #333333;
      margin:0 @spacing-base;
      font-family: fantasy;
      font-size: 36px;
    }
  }
  .medium,.bottom {
    background-color: white;
    margin-top: @spacing-large;
    padding: @spacing-medium 5/4 * @spacing-medium;
    flex:1;
    overflow: hidden;
    .btns {
      margin-bottom: 1/ 2 * @spacing-base;
      .ant-btn {
        margin-left: @spacing-large;
        /deep/.anticon {
          margin-right: 1/4 * @spacing-base;
        }
      }
    }
  }
  .bottom {
    .menu-level:nth-child(2) {
      margin-left: @spacing-large;
    }
    .menu-level {
      margin-right: @spacing-base;
      font-weight: bold;
      .active-level {
        color: #107FFF;
      }
      >span {
        cursor: pointer;
        &:hover {
          color: #107FFF;
        }
      }
    }
  }
  .table-content-scroll {
    margin-top: @spacing-base;
  }
  .innerTable{
    width: 90%;
    padding: 15px 0;
    /deep/.ant-table-thead > tr > th{
      font-weight: 500;
      border-right: 1px solid #e8e8e8!important;
    }
    /deep/.ant-table-thead > tr > th:not(:last-child):after{
      display: none;
    }
  }
}
</style>
<style scoped lang="less">
@import '../../../styles/public.module.less';
.works {
  background-color: white;
  margin-top: @spacing-large;
  padding: @spacing-base 5/4 * @spacing-medium @spacing-base 0;
  flex:1;
  overflow: hidden;
  /deep/ .ant-tabs {
    font-weight: bold;
    .full-height;
    .flex;
    .flex-column;
    .ant-tabs-content {
      //.flex-auto;
      //.overflow-hidden
      height: calc(100% - 50px);//计算所得
    }
    .ant-tabs-bar {
      border-bottom: none;
      padding-left: @spacing-large;
    }
    .ant-tabs-tab {
      font-size: 18px;
      padding: 1/2 * @spacing-base @spacing-base;
    }
    .ant-tabs-tab-active {
      font-weight: bold;
    }
  }
}
</style>
