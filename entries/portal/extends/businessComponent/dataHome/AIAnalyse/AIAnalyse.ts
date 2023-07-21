import {Component, Vue, Prop, InjectReactive} from "vue-property-decorator";
import{Select,Icon,Modal,Button,Carousel} from "@h3/antd-vue";
// import {} from "./index";
import { getAlarmTypeStatistics,getTodayAlarm,getAlarmTrend } from "../../../service/alarmApi";
// import env from "@/config/env";
import LineChart from "./LineChart.vue";
import PieChart from "./PieChart.vue";
@Component({
  name:"AIAnalyse",
  components:{
    [Select.name]:Select,
    [Select.Option.name]:Select.Option,
    [Icon.name]:Icon,
    [Modal.name]:Modal,
    [Button.name]:Button,
    [Carousel.name]:Carousel,
    LineChart,
    PieChart
  }
})
export default class AIAnalyse extends Vue{
  @InjectReactive("project") projectCode?: string;
  @Prop({required:true})
  projectName!: string;
  @Prop({required:true})
  treeId!: string;

  // projectCode:string="";
  visible=false;
  modalwrapClassName="modalwrapClassName"

  alarmTypes=["全部","区域入侵告警","未穿反光衣告警","未带安全帽告警","玩手机告警","烟火告警"];
  selectAlarmType=this.alarmTypes[0];
  selectAlarmTypeTrend=this.alarmTypes[0];
  timeTypes=[{title:"今天",value:1},{title:"近七天",value:2},{title:"近30天",value:3}];
  selectTimeType=this.timeTypes[0].value;
  todayAlarms:{bigPic:string,captureTime:string,deviceName:string,devicePosition:string,safeRuleName:string,safeRuleTypeName:string,smallPic:string}[]=[];
  selectAlarmItem:{bigPic:string,captureTime:string,deviceName:string,devicePosition:string,safeRuleName:string,safeRuleTypeName:string,smallPic:string}={
    bigPic:"",captureTime:"",deviceName:"",devicePosition:"",safeRuleName:"",safeRuleTypeName:"",smallPic:""
  };
  alarmTypeStatistics:{alarmType:string,number:number,proportion:number}[]=[
    {alarmType:"未带安全帽",number:0,proportion:0},
    {alarmType:"未穿反光衣",number:0,proportion:0},
    {alarmType:"区域入侵",number:0,proportion:0},
    {alarmType:"烟火告警",number:0,proportion:0},
    {alarmType:"玩手机告警",number:0,proportion:0},
    {alarmType:"攀高告警",number:0,proportion:0},
  ]
  carouselSrcs:string[]=[];

  lineChartId="lineChartId";
  lineData={xAxis:[],yAxis:[],yAxisName:"次",name:"",xAxisInterval:0};

  pieChartId="pieChartId";
  pieData: { data: any, isLabelLineShow: boolean, midText: string, unitName: string } = {
    data: [],
    isLabelLineShow: true,
    midText: '',
    unitName: '个'
  }


  async mounted(){
    // this.projectCode = `${env.project}`;
    await this.getAlarmTypeStatistics();
    await this.getTodayAlarm();
    await this.getAlarmTrend();
  }
  async getTodayAlarm() {
    const {data,errcode}=await getTodayAlarm(this.projectCode??"",this.projectName,this.selectAlarmType==="全部"?"":this.selectAlarmType);
    this.todayAlarms=[];
    data?.forEach(item => {
      this.todayAlarms.push({...item})
    });
  }
  async getAlarmTypeStatistics(){
    const {data,errcode}=await getAlarmTypeStatistics(this.projectCode??"",this.projectName);
    this.carouselSrcs=[];
    this.pieData.data=[];
    data?.alarmType.forEach(item=>{
      const index=this.alarmTypeStatistics.findIndex(at=>at.alarmType===item.alarmType);
      if(index>-1){
        this.$set(this.alarmTypeStatistics[index],"number",item.number);
        this.$set(this.alarmTypeStatistics[index],"proportion",item.proportion);
      }
      this.pieData.data.push({
        'name': item?.alarmType as string,
        'value': item?.number as number
      })
    });
    this.carouselSrcs=data?.attachments;
  }
  async getAlarmTrend(){
    this.lineData.xAxis=[];
    this.lineData.yAxis=[];
    const {data,errcode}=await getAlarmTrend(this.projectCode??'',this.projectName,this.selectAlarmTypeTrend==="全部"?"":this.selectAlarmTypeTrend,this.selectTimeType);
    this.lineData.xAxis=data?.times;
    this.lineData.yAxis=data?.numbers;
    this.lineData.xAxisInterval=this.lineData.xAxis.length<=9?0:parseInt((this.lineData.xAxis.length/9).toString());
  }


  async handleAlarmChange(){
    await this.getTodayAlarm();
  }

  async handleAlarmChangeTrend(){
    await this.getAlarmTrend();
  }

  async handleTimeTypeChange(){
    await this.getAlarmTrend();
  }

  messageClick(item:{bigPic:string,captureTime:string,deviceName:string,devicePosition:string,safeRuleName:string,safeRuleTypeName:string,smallPic:string}){
    this.selectAlarmItem=item;
    this.visible=true;
  }
}
