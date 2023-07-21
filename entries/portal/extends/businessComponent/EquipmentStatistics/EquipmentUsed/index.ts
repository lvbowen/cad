import { Component, Vue, InjectReactive } from 'vue-property-decorator';
import {PieEchart,MyBarChart} from "../Components";
import { Table,Icon,Button } from "@h3/antd-vue"
import { deviceUse,deviceApply,DeviceApplyRecord } from "../../../service/equipmentStatistics";
import * as Type from '../../../type';
import moment from 'moment';
import {getFormUrl} from "../../../service/api";
@Component({
  name:"EquipmentUsed",
  components:{
    [Table.name]:Table,
    [Icon.name]:Icon,
    [Button.name]:Button,
    PieEchart,
    MyBarChart,
  }
})
export default class EquipmentUsed extends Vue {
  @InjectReactive("project") appCode;
  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;
  buttonIndex=0;
  /* PieChart */
  colorList:Array<string>=['#577df2','#29a1fc','#66cdff','#36a353','#62bd7a','#f8cb7f','#f89588','#529c66'];
  pieChartData:{value:number,name:string,color?:string}[]=[];
  radius=['50%','65%'];
  center=['40%','50%'];
  pieChartLegend={
    top: 'middle',
    right: "5%",
    orient:"vertical",
  }
  title:{name?:string,itemStyle?:{show:true,position:"center",color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number,
  formatter?: Function | string,rich?:{[userStyle: string]:{
    color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number
  }}}}={
    itemStyle:{
      show:true,
      position:"center",
      formatter:()=>`{text|总数}\n{subText|${this.titleSum}}`,
      rich:{
        "text":{
          fontSize:14,
          fontFamily:"Source Han Sans CN",
          color:"#666",
        },
        "subText":{
          fontSize:26,
          fontFamily:"Arial",
          color:"#000",
          fontWeight:700,
        }
      }
    }
  }
  titleSum=0;
  pieChartLabel:{show?:boolean,position?:"outside"|"inside"|"inner"|"center",formatter?:(params:any)=>string,[key:string]:any}={
    show:false,
  }
  /* BarChart */
  barChartOption:
  {legend:string[],xAxis:string[],series:((number[])|({data:(number|{value:number,itemStyle?:{color?:string,[key:string]:any}})[],color?:string,label?:{[key:string]:any}}))[]}={
    legend:[],
    xAxis:[],
    series:[],
  }
  /* Table */
  columns:{key:string,align?:"left"|"right"|"center",dataIndex:string,title:string,width?:string|number,
    scopedSlots?:{customRender:string},customRender?:(text:string,record,index:number)=>string}[]=[
    {
      title:"序号",
      dataIndex:"index",
      key:"index",
      align:"center",
      // width:50,
      customRender:(text, record, index)=>(this.pagination.current-1)*this.pagination.pageSize+index+1+''
    },
    {
      title:"工单编号",
      dataIndex:"sequenceNo",
      key:"sequenceNo",
      align:"center",
      // width:120,
    },
    {
      title:"发起人",
      dataIndex:"creater",
      key:"creater",
      align:"center",
      // width:100,
    },
    {
      title:"发起日期",
      dataIndex:"createdTime",
      key:"createdTime",
      align:"center",
      // width:120,
      customRender:(text, record, index)=> moment(text).isValid()?moment(text).format("YYYY-MM-DD"):"",
    },
    {
      title:"起使用时间",
      dataIndex:"startDate",
      key:"startDate",
      align:"center",
      // width:120,
      customRender:(text, record, index)=> moment(text).isValid()?moment(text).format("YYYY-MM-DD"):"",
    },
    {
      title:"预计归还时间",
      dataIndex:"endDate",
      key:"endDate",
      align:"center",
      // width:120,
      customRender:(text, record, index)=> moment(text).isValid()?moment(text).format("YYYY-MM-DD"):"",
    },
    {
      title:"使用用途",
      dataIndex:"purpose",
      key:"purpose",
      align:"center",
    },
    {
      title:"审批人",
      dataIndex:"manager",
      key:"manager",
      align:"center",
    },
    {
      title:"审批结果",
      dataIndex:"auditResult",
      key:"auditResult",
      align:"center",
      scopedSlots:{customRender:"auditResult"}
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
      await this.getDeviceApply();
    },
    onShowSizeChange:async(current:number, size:number)=>{
      this.pagination.pageSize=size;
      this.pagination.current=1;
      await this.getDeviceApply();
    }
  }

  loading=false;

  dataSource:any[]=[];

  back(){
    //@ts-ignore
    this.$router.back();
  }

  mounted(){
    this.getDeviceUse(0);
    this.getDeviceApply();
  }

  async getDeviceUse(periodType:0|1|3){
    this.barChartOption={legend:[],xAxis:[],series:[],}
    try {
      const { errcode,errmsg,data}=await deviceUse({appCode:this.appCode,projectName:this.projectConfig?.projectName??"",periodType});
      if(errcode!==0){
        this.$message.error(`获取设备使用分析数据失败,${errmsg}`);
        return;
      }
      this.titleSum=data?.deviceUseProportion?.reduce((previousValue,currentValue)=>previousValue+currentValue.num,0)??0;
      this.title.itemStyle!.formatter=()=>`{text|总数}\n{subText|${this.titleSum}}`;
      this.pieChartData=data?.deviceUseProportion?.map((item,index)=>{
        return {
          value:item.num,
          name:item.deviceType,
          color:this.colorList[index]
        }
      })??[];
      data?.deviceUseNum?.deviceNames.forEach((item,index)=>{
        const color = index%2===0?"#BBD4FA":"#68A1FF";
        this.barChartOption.xAxis.push(item);
        if(this.barChartOption.series[0]){
          const series=this.barChartOption.series[0] as {data:(number|{value:number,itemStyle?:{color?:string,[key:string]:any}})[],color?:string,label?:{[key:string]:any}}
          series.data.push({value:data.deviceUseNum.num[index],itemStyle:{color}});
        }else{
          this.barChartOption.series[0]={
            data:[{value:data.deviceUseNum.num[index],itemStyle:{color}}]
          }
        }
      });

    } catch (error) {
      this.$message.error(`获取设备使用分析数据异常,${error}`);
    }
  }

  titleExtraButtonClick(periodType:0|1|3){
    this.buttonIndex=periodType;
    this.getDeviceUse(periodType);
  }

  async getDeviceApply(id?:string,keyWord?:string,creater?:string,manager?:string,state?:string,auditResult?:string) {
    const {pageSize,current}=this.pagination;
    this.loading=true;
    try {
      const {errcode,errmsg,data}=await deviceApply({appCode:this.appCode,projectName:this.projectConfig?.projectName??"",
        pageNum:current,pageSize,id,keyWord,creater,state,manager,auditResult});
      if(errcode!==0){
        this.$message.error(`获取设备使用工单数据失败,${errmsg}`);
        return;
      }
      this.pagination.total=data?.total??0;
      this.dataSource=data?.records.map((item,index)=>{
        return {...item}
      })??[];
    } catch (error) {
      this.$message.error(`获取设备使用工单数据异常,${error}`);
    }finally{
      this.loading=false;
    }
  }

  rowClassName(record, index:number){
    return index%2===0?"evenRow":"oddRow"
  }

  async itemView(record:DeviceApplyRecord){
    try {
      const url = await getFormUrl({bizObjectId:record.id,schemaCode:`${this.appCode}_device_apply`});
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
