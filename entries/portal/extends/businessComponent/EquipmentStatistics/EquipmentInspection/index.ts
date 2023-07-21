import { Component, Vue, InjectReactive } from 'vue-property-decorator';
import {MyCard,LineChart,ItemNum} from "../Components";
import {Table,Icon,Button} from "@h3/antd-vue";
import * as Type from '../../../type';
import { deviceInspect,deviceInspectTasks,DeviceInspectTaskRecord } from "../../../service/equipmentStatistics";
import {getFormUrl} from "../../../service/api";
@Component({
  name:"EquipmentInspection",
  components:{
    MyCard,
    LineChart,
    ItemNum,
    [Table.name]:Table,
    [Icon.name]:Icon,
    [Button.name]:Button,
  }
})
export default class EquipmentInspection extends Vue {
  @InjectReactive("project") appCode;
  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;
  waitInspectionTotal:number=0;
  inspectedTotal:number=0;
  waitInspectionTotalToday:number=0;
  inspectedTotalToday:number=0;

  waitInspectionData:{name:string,value:number}[]=[]

  option:{legend:string[],xAxis:string[],series:{data:number[],color?:string,labelShow?:boolean}[]}={
    legend:[],xAxis:[],series:[]
  }

  grid={
    top:"15%",
    left:20,
    right:20,
  }

  columns:{key:string,align?:"left"|"right"|"center",dataIndex:string,title:string,width?:string|number,
    scopedSlots?:{customRender:string},customRender?:(text:string,record,index:number)=>string}[]=[
      {
        title:"序号",
        dataIndex:"index",
        key:"index",
        align:"center",
        customRender:(text, record, index)=>(this.pagination.current-1)*this.pagination.pageSize+index+1+''
      },
      {
        title:"巡检工单名称",
        dataIndex:"planName",
        key:"planName",
        align:"center",
      },
      {
        title:"工单编号",
        dataIndex:"sequenceNo",
        key:"sequenceNo",
        align:"center",
      },
      {
        title:"巡检人员",
        dataIndex:"checker",
        key:"checker",
        align:"center",
      },
      {
        title:"巡检项数量",
        dataIndex:"checkItemsNum",
        key:"checkItemsNum",
        align:"center",
      },
      {
        title:"巡检结果",
        dataIndex:"inspectCode",
        key:"inspectCode",
        align:"center",
        scopedSlots:{customRender:"inspectCode"}
      },
      {
        title:"关联维修工单",
        dataIndex:"repair.displayName",
        key:"repair.displayName",
        align:"center",
        scopedSlots:{customRender:"repair"}
      },
      {
        title:"操作",
        dataIndex:"id",
        key:"actions",
        align:"center",
        scopedSlots:{customRender:"actions"}
      },
  ];

  pagination={
    // hideOnSinglePage:true,
    showSizeChanger:true,
    showQuickJumper:true,
    pageSizeOptions:['10', '20', '30', '40'],
    pageSize:10,
    total:0,
    current:1,
    onChange:async(page:number, pageSize:number)=>{
      this.pagination.current=page;
      await this.getDeviceInspectTasks();
    },
    onShowSizeChange:async(current:number, size:number)=>{
      this.pagination.pageSize=size;
      this.pagination.current=1;
      await this.getDeviceInspectTasks();
    }
  }

  loading=false;

  dataSource:any[]=[];

  back(){
    //@ts-ignore
    this.$router.back();
  }

  mounted(){
    this.getDeviceInspect();
    this.getDeviceInspectTasks();

  }

  async getDeviceInspect(){
    try {
      const { errcode,errmsg,data}=await deviceInspect({appCode:this.appCode,projectName:this.projectConfig?.projectName??""});
      if(errcode!==0){
        this.$message.error(`获取设备巡检统计数据失败,${errmsg}`);
        return;
      }
      this.inspectedTotal=data?.deviceInspectNum?.monthChecked??0;
      this.inspectedTotalToday=data?.deviceInspectNum?.todayChecked??0;
      this.waitInspectionTotal=data?.deviceInspectNum?.monthUncheked??0;
      this.waitInspectionTotalToday=data?.deviceInspectNum?.todayUncheked??0;
      this.waitInspectionData=data?.todayUncheck?.map(item=>{
        return{
          name:item.deviceType,value:item.num
        }
      })??[];
      data?.deviceInspectCount.date?.forEach((item)=>{
        this.option.xAxis.push(item);
      });
      data?.deviceInspectCount.num?.forEach(item=>{
        if(this.option.series[0]){
          this.option.series[0].data.push(item);
        }else{
          this.option.series[0]={data:[item],color:"#4BA0EA",labelShow:true};
        }
      })
    } catch (error) {
      this.$message.error(`获取设备巡检统计数据异常,${error}`);
    }
  }

  async getDeviceInspectTasks(id?:string,keyWord?:string,planId?:string,checker?:string,result?:string) {
    const {pageSize,current}=this.pagination;
    this.loading=true;
    try {
      const {errcode,errmsg,data}=await deviceInspectTasks({appCode:this.appCode,projectName:this.projectConfig?.projectName??"",
        pageNum:current,pageSize,id,keyWord,planId,checker,result});
      if(errcode!==0){
        this.$message.error(`获取巡检任务列表数据失败,${errmsg}`);
        return;
      }
      this.pagination.total=data?.total??0;
      this.dataSource=data?.records.map((item,index)=>{
        return {...item}
      })??[];
    } catch (error) {
      this.$message.error(`获取巡检任务列表数据异常,${error}`);
    }finally{
      this.loading=false;
    }
  }

  rowClassName(record, index:number){
    return index%2===0?"evenRow":"oddRow"
  }

  async itemView(record:DeviceInspectTaskRecord){
    try {
      const url = await getFormUrl({bizObjectId:record.id,schemaCode:`${this.appCode}_device_inspect_task`});
      //@ts-ignore
      if(this.isDingTalk){
        //@ts-ignore
        this.$router.push(`${url}`);
      }else{
        window.open(`${url}`);
      }
    } catch (error) {
      this.$message.error(`获取跳转地址失败,${error}`);
    }
  }

  async repairItemView(record:DeviceInspectTaskRecord){
    try {
      const url = await getFormUrl({bizObjectId:record.repair.id,schemaCode:record.repair.schemaCode});
      //@ts-ignore
      if(this.isDingTalk){
        //@ts-ignore
        this.$router.push(`${url}`);
      }else{
        window.open(`${url}`);
      }
    } catch (error) {
      this.$message.error(`获取跳转地址失败,${error}`);
    }
  }
}
