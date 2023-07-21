import { Component, Vue, InjectReactive, Ref } from 'vue-property-decorator';
import {Icon,Table,Progress,Timeline,Pagination} from "@h3/antd-vue";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import DatePicker from "ant-design-vue/lib/date-picker";
import 'ant-design-vue/lib/date-picker/style/index.css';
import moment from 'moment';
import {myWorkItems,WorkItem,myCompletedWorkItems,myProjects,Project} from "../../../service/CoordinateDesign/TaskCenter";
import Utils from "../../../utils";
type PaginationClass={current:number,pageSize:number,showQuickJumper:true,total:number,
  showTotal:(total:number, range)=>string,onChange:(page:number, pageSize:number)=>void};
type Columns={dataIndex?:string,align?:'left'|'right'|'center',title?:string,width?:string|number,scopedSlots?:{customRender?:string,filterDropdown?:string},
  customRender?:(text:string, record, index:number)=>string|object|void,slots?:{filterIcon?:string,title?:string}}[];
type TableConfiguration={loading?:boolean,columns:Columns,pagination?:PaginationClass|false,customRow?:(record, index:number)=>object,scroll?:{x?:number|true,y?:number},
  rowClassName?:(record,index:number)=>string,expandedRowKeys?:string[]};
type tableItem = {id: string;projectName: string;children?: tableItem[];index?:number};
@Component({
  name:"TaskCenter",
  components:{
    [Icon.name]:Icon,
    [Table.name]:Table,
    [Progress.name]:Progress,
    [Timeline.name]:Timeline,
    [Timeline.Item.name]:Timeline.Item,
    [Pagination.name]:Pagination,
    AButton: Button,
    AInputSearch: Input.Search,
    ARangePicker:DatePicker.RangePicker
  }
})
export default class TaskCenter extends Vue {
  @InjectReactive("project") appCode!: string;
  @Ref("doWrap") doWrap!:HTMLDivElement;
  @Ref("projectWrap") projectWrap!:HTMLDivElement;
    /* Table ID */
    rowId=0;

  created(){
    this.getMyWorkItems();
    this.getMyCompletedWorkItems();
    this.getMyProjects();
  }
  mounted(){
    this.projectCode = this.appCode??'';
    window.addEventListener("resize",this.windowReSize);
  }
  updated(){
    this.$nextTick().then(()=>{
      this.windowReSize();
    });
  }
  beforeDestroy(){
    window.removeEventListener("resize",this.windowReSize);
  }
  /* 动态计算Table高度 */
  windowReSize(){
    const toDoWrapTableHeader = document.querySelector(".toDoWrap .ant-table-header") as HTMLDivElement;
    const toDoWrapTablepagination=document.querySelector(".toDoWrap .ant-pagination") as HTMLUListElement;
    this.toDoTable.scroll!.y=this.doWrap.offsetHeight-62-toDoWrapTablepagination.offsetHeight-toDoWrapTableHeader.offsetHeight;
    this.doneTable.scroll=this.toDoTable.scroll;
    const projectWrapTableHeader = document.querySelector(".projectWrap .ant-table-header") as HTMLDivElement;
    this.projectTable.scroll!.y=this.projectWrap.offsetHeight-55-projectWrapTableHeader.offsetHeight;
  }

  routerKeyValue:{[key:string]:string}={
    sjrwd:"ProfessionalDesignTask",
    zysjtg:"ProfessionalDesignOutline",
    xmlb:"ProductionTaskList",//生产任务单
    zyrwd:"ProfessionalTask",//专业任务
    xmsqb:"ProjectPlanning",//项目策划
  }
  /* 待办Table配置 */
  toDoTable:TableConfiguration&{dataSource:WorkItem[]}={
    loading:false,
    scroll:{
      y:260,
    },
    columns:[
      {title:"序号",align:"center",width:50,customRender:(text:string, record, index:number)=>{
        const {pageSize,current}=this.toDoTable.pagination as PaginationClass;
        return `${(current-1)*pageSize+index+1}`;
      }},
      {title:"流程名称",dataIndex:"instanceName",align:"center",scopedSlots: {customRender:'instanceName'}},
      {title:"发起人",dataIndex:"originatorName",align:"center"},
      {title:"当前节点",dataIndex:"activityName",align:"center"},
      {title:"处理人",dataIndex:"participantName",align:"center"},
      {title:"发起时间",dataIndex:"startTime",align:"center"},
      {title:"停留时间",dataIndex:"",align:"center",    customRender:(text:string, record, index:number)=>{
        return this.calcUsedTime(record.startTime);
      }},
      {
        title:"截止时间",
        dataIndex:"planEndTime",
        scopedSlots: { customRender: "planEndTime"}
      }
    ],
    rowClassName(record,index:number){
      return index%2===0?"tableRowClassNameEven":"tableRowClassNameOdd";
    },
    pagination:{
      current:1,
      pageSize:20,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共${total}条`,
      onChange:(page:number, pageSize:number)=>this.toDoTablePaginationChange(page,pageSize),
    },
    customRow:(record:WorkItem)=>{
      return{
        on:{
          dblclick:()=>{
            if(!record.projectId||!record.extendId)return;
            if (record.pendingType==='wlzl') {
              Utils.goForm(this,'edit',null,this.isDingTalk,record.extendId,record.workflowCode)
            }else {
              this.$router.push({
                name:this.routerKeyValue[record.pendingType],
                query:{
                  projectId:record.projectId,
                  id:record.extendId
                }
              });
            }
          }
        }
      }
    },
    dataSource:[]
  }
  projectCode: string = '';
  toForm(record:WorkItem) {
    if(!record.projectId||!record.extendId)return;
    if (record.pendingType==='wlzl') {
      Utils.goForm(this,'edit',null,this.isDingTalk,record.extendId,record.workflowCode)
    }else {
      this.$router.push({
        name:this.routerKeyValue[record.pendingType],
        query:{
          projectId:record.projectId,
          id:record.extendId
        }
      });
    }
  }
  toDoTablePaginationChange(page:number,pageSize:number){
    (this.toDoTable.pagination as PaginationClass).current=page;
    this.getMyWorkItems();
  }
  /* 查询我的待办 */
  async getMyWorkItems(){
    try {
      this.toDoTable.loading=!this.toDoTable.loading;
      const {errcode,errmsg,data} = await myWorkItems({
        appCode:this.appCode,
        pageNum:(this.toDoTable.pagination as PaginationClass).current-1,
        pageSize:(this.toDoTable.pagination as PaginationClass).pageSize,
        workflowName: this.workflowNameKeyWords,
        name: this.originatorNameKeyWords,
        startDate: this.startDate,
        endDate: this.endDate})
      if(errcode){
        return this.$message.error(`查询我的待办失败,${errmsg}`);
      }
      this.toDoTable.dataSource=data?.content??[];
      (this.toDoTable.pagination as PaginationClass).total=data?.totalElements??0;
    } catch (error) {
      this.$message.error(`查询我的待办异常,${error}`);
    }finally{
      this.toDoTable.loading=!this.toDoTable.loading;
    }
  }
  /* 计算时间 */
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

  /* 已办Table配置 */
  doneTable:TableConfiguration&{dataSource:WorkItem[]}={
    loading:false,
    scroll:{
      y:260,
    },
    columns:[
      {title:"序号",align:"center",width:50,customRender:(text:string, record, index:number)=>{
        const {pageSize,current}=this.doneTable.pagination as PaginationClass;
        return `${(current-1)*pageSize+index+1}`;
      }},
      {title:"流程名称",dataIndex:"instanceName",align:"center",scopedSlots: {customRender:'instanceName'}},
      {title:"发起人",dataIndex:"originatorName",align:"center"},
      {title:"当前节点",dataIndex:"activityName",align:"center"},
      {title:"处理人",dataIndex:"participantName",align:"center"},
      {title:"发起时间",dataIndex:"startTime",align:"center"},
      {title:"停留时间",dataIndex:"",align:"center",    customRender:(text:string, record, index:number)=>{
        return this.calcUsedTime(record.startTime);
      }},
      {
        title:"截止时间",
        dataIndex:"planEndTime",
        scopedSlots: { customRender: "planEndTime"}
      }
    ],
    rowClassName(record,index:number){
      return index%2===0?"tableRowClassNameEven":"tableRowClassNameOdd";
    },
    pagination:{
      current:1,
      pageSize:20,
      showQuickJumper:true,
      total:0,
      showTotal:(total:number, range)=>`共${total}条`,
      onChange:(page:number, pageSize:number)=>this.doneTablePaginationChange(page,pageSize),
    },
    customRow:(record:WorkItem)=>{
      return{
        on:{
          dblclick:()=>{
            if(!record.projectId||!record.extendId)return;
            if (record.pendingType==='wlzl') {
              Utils.goForm(this,'edit',null,this.isDingTalk,record.extendId,record.workflowCode)
            }else {
              this.$router.push({
                name:this.routerKeyValue[record.pendingType],
                query:{
                  projectId:record.projectId,
                  id:record.extendId
                }
              });
            }
          }
        }
      }
    },
    dataSource:[]
  }
  doneTablePaginationChange(page:number,pageSize:number){
    (this.doneTable.pagination as PaginationClass).current=page;
    this.getMyCompletedWorkItems();
  }
  /* 查询我的已办 */
  async getMyCompletedWorkItems(){
    try {
      this.doneTable.loading=!this.doneTable.loading;
      const {errcode,errmsg,data} = await myCompletedWorkItems({
        appCode:this.appCode,
        pageNum:(this.doneTable.pagination as PaginationClass).current-1,
        pageSize:(this.doneTable.pagination as PaginationClass).pageSize,
        workflowName: this.workflowNameKeyWords,
        name: this.originatorNameKeyWords,
        startDate: this.startDate,
        endDate: this.endDate})
      if(errcode){
        return this.$message.error(`查询我的待办失败,${errmsg}`);
      }
      this.doneTable.dataSource=data?.content??[];
      (this.doneTable.pagination as PaginationClass).total=data?.totalElements??0;
    } catch (error) {
      this.$message.error(`查询我的待办异常,${error}`);
    }finally{
      this.doneTable.loading=!this.doneTable.loading;
    }
  }

  /* 项目Table配置 */
  projectTable:TableConfiguration&{dataSource:any}={
    loading:false,
    scroll:{
      y:315,
    },
    columns:[
      {title:"序号",dataIndex:"index",align:"center",width:50,},
      {dataIndex:"projectName",slots:{title:"projectNameTitle"}},
      {title:"任务名称",dataIndex:"extraTaskName",align:"center"},
      {title:"当前状态",dataIndex:"currentStatus",align:"center",width:100},
      {title:"当前审核人",dataIndex:"currentAuditorName",align:"center",width:120},
      {title:"计划开始时间",dataIndex:"planStartTime",align:"center",width:110},
      {title:"计划结束时间",dataIndex:"planEndTime",align:"center",width:110},
      {dataIndex:"taskRatio",width:200,slots:{title:"progressTitle"},scopedSlots:{customRender:"progress"}},
    ],
    rowClassName(record,index:number){
      return index%2===0?"tableRowClassNameEven":"tableRowClassNameOdd";
    },
    pagination:false,
    customRow:(record:{children?:object[],extraTaskType:string})=>{
      return{
        on:{
          click:()=>{
            if(record.children)return;
            const taskConfiguration=this.taskConfigurations.find(configuration=>configuration.name===record.extraTaskType);
            if(!taskConfiguration?.routerName)return;
            const {routerName,queryParams} = taskConfiguration;
            const query = {};
            for (const key in queryParams) {
              if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
                const element = queryParams[key];
                query[key]=record[element];
              }
            }
            this.$router.push({
              name:routerName,
              query:query
            })
          }
        }
      }
    },
    dataSource:[],
    expandedRowKeys:[],
  }
  customExpandIcon(props: any) {
    const { expanded, onExpand, record, expandable } = props;
    const h = this.$createElement;
    if (expandable) {
      return h("span", {}, [
        h("a-icon", {
          staticStyle: {
            paddingRight: "10px",
            fontSize: "20px",
            verticalAlign: "middle",
          },
          attrs: {
            type: expanded ? "caret-down" : "caret-right",
          },
          on: {
            click: (event: Event) => {
              onExpand(record, event);
            },
          },
        }),
      ]);
    } else {
      return h("span", {
        staticStyle: {
          paddingRight: "10px",
        },
      });
    }
  }
  /* 设置进度样式 */
  setProgressStyleObj(rate:number){
    let color="";
    if(rate>=100){
      color="#01c300";
    }else if(rate>=60){
      color="#0079fe";
    }else{
      color="ffa73f"
    }
    return {
      borderColor:color
    }
  }
  /* 设置进度样式 */
  setProgressBarStyleObj(rate:number){
    let color="";
    if(rate>=100){
      color="#01c300";
    }else if(rate>=60){
      color="#0079fe";
    }else{
      color="ffa73f"
    }
    return {
      width:`${rate}%`,
      backgroundColor:color
    }
  }
  taskConfigurations=[
    {name:"工作大纲",key:"taskType",routerName:""},
    {name:"设计任务",key:"achievementName",routerName:"ProfessionalDesignTask",queryParams:{projectId:"xmlbId",id:"id"}},
    {name:"专业任务",key:"professionName",routerName:""},
    {name:"专业设计提纲",key:"taskName",routerName:"ProfessionalDesignOutline",queryParams:{projectId:"xmlbId",id:"id"}},
  ]
  /* 查询我的项目 */
  async getMyProjects(){
    const { projectTable,appCode }=this;
    projectTable.loading = !projectTable.loading;
    try {
      const {errcode,errmsg,data} = await myProjects({appCode});
      if(errcode){
        return this.$message.error(`查询我的项目失败,${errmsg}`);
      }
      const tableData: tableItem[] = [];
      let count = 0;
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const firstLayerValue = data[key];
          const projectNames = key.split("_");
          tableData.push({
            index:count+1,
            id: `${projectNames[1]}`,
            projectName: projectNames[0],
            children: [],
          });
          const childrenData:tableItem[]=[];
          for (const firstLayerKey in firstLayerValue) {
            if (Object.prototype.hasOwnProperty.call(firstLayerValue, firstLayerKey)) {
              const secondLayerValue = firstLayerValue[firstLayerKey];
              const firstLayerData:tableItem = {
                id: `${this.rowId++}`,
                projectName: firstLayerKey,
                children: [],
              }
              for (const secondLayerKey in secondLayerValue) {
                const secondLayerData = {
                  id: `${this.rowId++}`,
                  projectName: secondLayerKey,
                  children: [] as tableItem[],
                }
                if (Object.prototype.hasOwnProperty.call(secondLayerValue, secondLayerKey)) {
                  const thirdLayerKeyValue = secondLayerValue[secondLayerKey];
                  secondLayerData.children?.push(...thirdLayerKeyValue.map(item=>{
                    const taskConfiguration=this.taskConfigurations.find(configuration=>configuration.name===firstLayerKey);
                    const extraTaskName=taskConfiguration?item[taskConfiguration.key]:"";
                    return {...item,projectName: item.engineeringName,taskRatio:+item.taskRatio,extraTaskType:firstLayerKey,extraTaskName};
                  }))
                }
                firstLayerData.children?.push(secondLayerData)
              }
              childrenData.push(firstLayerData)
            }
          }
          tableData[count].children?.push(...childrenData);
        }
        count++;
      }
      projectTable.expandedRowKeys=this.expandedAllRow(tableData);
      projectTable.dataSource=tableData;
    } catch (error) {
      return this.$message.error(`查询我的项目异常,${error}`);
    }finally{
      projectTable.loading = !projectTable.loading;
    }
  }

  findLastChildren(data: tableItem): tableItem[] {
    if (data.children && data.children.length <= 0) {
      return data.children;
    } else if (data.children) {
      return this.findLastChildren(data.children[0]);
    } else {
      return [];
    }
  }

  expandedAllRow(data: tableItem[]): string[] {
    const keys: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      keys.push(element.id);
      if (element.children) {
        keys.push(...this.expandedAllRow(element.children));
      }
    }
    return keys;
  }

  expand(expanded:boolean,record:{id:string}){
    const {expandedRowKeys} = this.projectTable
    if(expanded){
      expandedRowKeys!.push(record.id);
    }else{
      const itemIndex = expandedRowKeys!.indexOf(record.id);
      if(itemIndex>-1){
        expandedRowKeys!.splice(itemIndex, 1)
      }
    }
  }
  //start
  activeMenu: string = 'toDoWorks' //doneWorks
  changeActiveMenu(type:string) {
    this.activeMenu = type;
    this.workflowNameKeyWords = '';
    this.originatorNameKeyWords = '';
    this.startDate = '';
    this.endDate = '';
    // @ts-ignore
    this.doneTable.pagination?.current = 1;
    // @ts-ignore
    this.toDoTable.pagination?.current = 1;
    if(this.activeMenu==='toDoWorks') {
      this.getMyWorkItems()
    }else if(this.activeMenu==='doneWorks') {
      this.getMyCompletedWorkItems()
    }
  }
  //search
  workflowNameKeyWords: string = '';
  originatorNameKeyWords: string = '';
  enterSearch(e,type:string) {
    if(type==='workflowName') {
      this.workflowNameKeyWords = e.target.value;
    }else if(type==='originatorName'){
      this.originatorNameKeyWords = e.target.value;
    }
    // @ts-ignore
    this.doneTable.pagination?.current = 1;
    // @ts-ignore
    this.toDoTable.pagination?.current = 1;
    if(this.activeMenu==='toDoWorks') {
      this.getMyWorkItems()
    }else if(this.activeMenu==='doneWorks') {
      this.getMyCompletedWorkItems()
    }
  }
  getList(keyword:string,type:string) {
    if(type==='workflowName') {
      this.workflowNameKeyWords = keyword;
    }else if(type==='originatorName'){
      this.originatorNameKeyWords = keyword;
    }
    // @ts-ignore
    this.doneTable.pagination?.current = 1;
    // @ts-ignore
    this.toDoTable.pagination?.current = 1;
    if(this.activeMenu==='toDoWorks') {
      this.getMyWorkItems()
    }else if(this.activeMenu==='doneWorks') {
      this.getMyCompletedWorkItems()
    }
  }
  startDate: string = '';
  endDate: string = '';
  onChangeDate(date, dateString) {
    this.startDate = dateString[0];
    this.endDate = dateString[1];
    // @ts-ignore
    this.doneTable.pagination?.current = 1;
    // @ts-ignore
    this.toDoTable.pagination?.current = 1;
    if(this.activeMenu==='toDoWorks') {
      this.getMyWorkItems()
    }else if(this.activeMenu==='doneWorks') {
      this.getMyCompletedWorkItems()
    }
  }
}
