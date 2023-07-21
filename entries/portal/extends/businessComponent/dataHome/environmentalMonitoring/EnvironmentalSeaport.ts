import{Component,Vue,Prop,Watch} from "vue-property-decorator";
import {Spin} from "@h3/antd-vue";
import env from "@/config/env";
import OAuthApi from "../../../../src/apis/oauth";
import LineCharts from "./LineChartNew.vue";
import PieCharts from "./PieChartNew.vue";
import {DatePicker,Table} from "@h3/antd-vue";
import moment from "moment";
import {getEnvironmentAndAir,getEnvironmentDataTrend,getProjectCityWeather,getEnvironmentDataPageSeaPort} from "./index";
@Component({
  name:"EnvironmentalSeaport",
  components:{
    [Spin.name]:Spin,
    PieCharts,
    LineCharts,
    [DatePicker.name]:DatePicker,
    [Table.name]:Table
  },
  filters:{
    numFixed(value:number|string,fractionDigits:number):string{
      return typeof(value)==="number"?value.toFixed(fractionDigits):value;
    }
  }
})
export default class EnvironmentalSeaport extends Vue{
  @Prop({required:true})
  projectName!: string;
  @Prop({required:true})
  treeId!: string;

  isShowEmpty=false;
  iframeUrl="";
  isLoad=true;
  pieChart="pieChart";
  airQuality= {
    value: 0,
    color: "#f88c54",
    name: "",
  };
  lineChart="lineChart";
  lineData={
    xAxis: [] as string[],
    yAxis: [] as string[],
    yAxisName:"",
    name:"",
    xAxisInterval:0
  }
  projectCode="";

  defaultDateValue = moment();
  selectDataValue= moment().format("YYYY-MM-DD");

  paginationOption={
    defaultPageSize:10,
    defaultCurrent:1,
    hideOnSinglePage:true,
    total:0,
    current:1
  };

  loading=true;
  tableData:any=[];
  type!:number;
  unit!:string;
  title!:string
  tableKey=0;
  pageSize=10;

  tableColumns:{key:string,dataIndex:string,title:string,align?:string,width?: number,scopedSlots?: object,customRender?:Function}[]=[]

  array:{title:string,unit:string,type:number,value:string}[]=[]

  mounted(){
    this.projectCode = `${env.project}`;
    Promise.allSettled([getProjectCityWeather(this.projectCode, this.projectName),getEnvironmentAndAir(this.projectCode, this.projectName)
    ,getEnvironmentDataPageSeaPort(this.projectCode, this.projectName,1,this.pageSize,this.selectDataValue)]).then(values=>{
      this.isLoad=false;
      this.getProjectCityWeather(values[0]);
      this.getEnvironmentDataAndAirQuality(values[1]);
      this.getEnvironmentDataPage(values[2]);
    }).catch(reason=>{
      this.isShowEmpty=true;
    });
  }

  getProjectCityWeather(res:any) {
    if(res.status==="fulfilled"){
      if(res.value.errcode===0){
        this.iframeUrl=res.value.data;
      }
    }
  }

  getEnvironmentDataAndAirQuality(res:any) {
    if(res.status==="fulfilled"){
      if(res.value.errcode===0){
        this.airQuality.value = res.value.data?.airQuality.airPollutionIndex ?? 0;
        this.airQuality.color = res.value.data?.airQuality.color;
        this.airQuality.name = res.value.data?.airQuality.airPollutionRank;
      }
      this.array=[];
      res.value.data?.environmentItemDTOList.forEach(item => {
        this.array.push({title:item.name,unit:item.unit,value:item.value,type:item.elementType})
      });
      this.type = this.array?.[0].type;
      this.unit = this.array?.[0].unit;
      this.title = this.array?.[0].title;
      this.getEnvironmentDataTrend();
    }
  }

  getEnvironmentDataPage(res:any){
    if(res.status==="fulfilled"){
      if(res.value.errcode===0){
        if(this.tableColumns.length<=0){
          res.value.data?.headerList.forEach(item=>{
            this.tableColumns.push({
              key:item.headerCode,
              dataIndex:item.headerCode,
              title:item.headerName,
              align:"center",
              customRender:text=>this.formatData(text)
            })
          })
        }
        if(res.value.data?.data&&res.value.data?.data.records.length>0){
          this.tableData=res.value.data?.data.records;
          this.paginationOption.total=res.value.data?.data.total;
          this.paginationOption.current=res.value.data?.data.current;
        }
        this.tableKey++;
      }
    }
  }

  getEnvironmentDataTrend(){
    this.lineData={xAxis: [],yAxis: [],yAxisName:"",name:"",xAxisInterval:0};
    getEnvironmentDataTrend(this.projectCode, this.projectName , this.type, this.selectDataValue).then(res=>{
      if(res.errcode===0){
        this.lineData.xAxisInterval=res?.data[0]?.hnum;
        res?.data?.map((item)=>{
          this.lineData.xAxis.push(item.time);
          this.lineData.yAxis.push(this.formatData(item.number));
        });
      }
    });
    this.lineData.name=this.title;
    this.lineData.yAxisName=this.htmlDecode(this.unit) as string;
  }


  environmentalItemClick(type:number,unit:string,title:string){
    this.type=type;
    this.unit=unit;
    this.title=title;
    this.getEnvironmentDataTrend();
  }


  handleTableChange(pagination, filters, sorter){
    Promise.allSettled([getEnvironmentDataPageSeaPort(this.projectCode, this.projectName,pagination.current,this.pageSize,this.selectDataValue)]).then(values=>{
        this.getEnvironmentDataPage(values[0]);
      })
  }

  onDateChange(date: moment.Moment | string, dateString: string){
    this.selectDataValue=dateString;
    Promise.allSettled([getEnvironmentDataPageSeaPort(this.projectCode, this.projectName,1,this.pageSize,this.selectDataValue)]).then(values=>{
      this.getEnvironmentDataPage(values[0]);
    })
    this.getEnvironmentDataTrend();
  }

  getenvironmentalBackground(index:number){
    if(index%3===0){
      return "backgroundY";
    }else if(index%3===1){
      return "backgroundG";
    }else{
      return "backgroundB";
    }
  }
  htmlDecode(text){
    const temp = document.createElement("div");
    temp.innerHTML = text;
    const output = temp.innerText || temp.textContent;
    return output;
  }
  setRowClassName(record, index) {
    const rowColor = Number(index) % 2 === 1 ? "evenRowStyl" : "";
    return rowColor;
  }

  formatDate(dataString:string):string{
    return moment(dataString).format("YYYY-MM-DD HH:mm:ss")
  }

  formatData(dataString:string):string{
    const re = /([0-9]+.[0-9]{2})[0-9]*/;
    if(dataString!==null){
      return dataString.toString().replace(re,"$1");
    }else{
      return "";
    }
  }

  calcVwToPx(fontSizeVw:number){
    return fontSizeVw*(window.screen.width/100)
  }

  disabledDate(current){
    return current && current > moment().endOf('day');
  }

}
