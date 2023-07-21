import { Component, Vue, InjectReactive,Watch } from 'vue-property-decorator';
import {Select,Icon} from "@h3/antd-vue";
import LineChart from "./components/lineChart.vue";
import PieChart from "./components/pieChart.vue";
import BarChart from "./components/barChart.vue";
import {projectTargetInfo,years,projectInfoByLineChar,projectInfoByPieChart,projectInfoByHistogram}
  from "../../../service/CoordinateDesign/ProjectStatics"
@Component({
  name:"ProjectStatics",
  filters:{
    formatNum:function(value:string|number){
      if(typeof(value)==="string" && !value)return "";
      const valueString = value.toString().split(".");
      valueString[0] = valueString[0].replace(/(\d)(?=(\d{4})+$)/g,"$1,");
      return valueString.join(".");
    }
  },
  components:{
    [Select.name]:Select,
    [Icon.name]:Icon,
    LineChart,
    PieChart,
    BarChart
  }
})
export default class ProjectStatics extends Vue {
  @InjectReactive("project") appCode!: string;

  statics=[
    {name:"项目总数量",value:0,className:"total",propertyName:"totalAmount"},
    {name:"项目运行数量",value:0,className:"running",propertyName:"runAmount"},
    {name:"项目暂停数量",value:0,className:"paused",propertyName:"pauseAmount"},
    {name:"项目归档数量",value:0,className:"archive",propertyName:"archiveAmount"},
    {name:"项目终止数量",value:0,className:"aborted",propertyName:"terminatedAmount"},
  ];

  year="0";
  yearOptions=[
    {label:"年度",value:"0",disabled:true},
  ];

  department="0";
  departmentOptions=[
    {label:"部门",value:"0",disabled:true},
  ];

  lineChartOption:{legend:string[],legendShow:boolean,xAxis:string[],series:(number[][])|({data:number[],color?:string,labelShow?:boolean}[])}={
    legend:[],
    legendShow:false,
    xAxis:[],
    series:[],
  };

  pieChartData:{value:number,name:string,color?:string}[]=[];

  barChartData:{value:number,name:string,color?:string}[]=[];

  created(){
    this.queryProjectTargetInfo();
    this,this.queryYears();
    this.queryProjectInfoByPieChart();
    this.queryProjectInfoByHistogram();
  }

  /* 查询数据指标 */
  async queryProjectTargetInfo(){
    const { appCode } = this;
    try {
      const {errcode,errmsg,data} = await projectTargetInfo({appCode});
      if(errcode) return this.$message.error(`获取项目指标数据失败,${errcode}`);
      for (const key in data) {
        const item = this.statics.find(st=>st.propertyName===key);
        item&&(item.value=data[key]);
      }
    } catch (error) {
      return this.$message.error(`获取项目指标数据异常,${error}`);
    }
  }

  /* 查询可用年份 */
  async queryYears(){
    const { appCode } = this;
    try {
      const {errcode,errmsg,data} = await years({appCode});
      if(errcode) return this.$message.error(`获取可用年份数据失败,${errcode}`);
      data?.forEach(item=>{
        this.yearOptions.push({
          label:item,
          value:item,
          disabled:false
        })
      });
      if(data && data?.length>0){
        this.year=data[0];
      }
    } catch (error) {
      return this.$message.error(`获取可用年份数据异常,${error}`);
    }
  }

  /* 查询数据分析数据 */
  async queryProjectInfoByLineChar(){
    const { appCode,year } = this;
    this.lineChartOption={
      legend:[],
      legendShow:false,
      xAxis:[],
      series:[],
    };
    try {
      const {errcode,errmsg,data} = await projectInfoByLineChar({appCode,year});
      if(errcode) return this.$message.error(`获取数据分析数据失败,${errmsg}`);
      let index=0;
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const element = data[key];
          this.lineChartOption.legend.push(key);
          if(!element)continue;
          const values:number[]=[];
          for (const elementKey in element) {
            if (Object.prototype.hasOwnProperty.call(element, elementKey)) {
              const value = element[elementKey];
              if(index===0){
                this.lineChartOption.xAxis.push(elementKey);
              }
              values.push(value);
            }
          }
          this.lineChartOption.series[index]=values;
          index++;
        }
      }

    } catch (error) {
      return this.$message.error(`获取数据分析数据异常,${error}`);
    }
  }

  /* 查询数据汇总数据(pieChart) */
  async queryProjectInfoByPieChart(){
    const { appCode } = this;
    try {
      const {errcode,errmsg,data} = await projectInfoByPieChart({appCode});
      if(errcode) return this.$message.error(`获取数据汇总数据(pieChart)失败,${errmsg}`);
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          this.pieChartData.push({
            value:data[key],
            name:key,
          })
        }
      }
      this.pieChartData.length>1&&this.pieChartData.sort((a, b) => a.value - b.value);
    } catch (error) {
      return this.$message.error(`获取数据汇总数据(pieChart)异常,${error}`);
    }
  }

  /* 查询数据汇总数据(barChart) */
  async queryProjectInfoByHistogram(){
    const { appCode } = this;
    try {
      const {errcode,errmsg,data} = await projectInfoByHistogram({appCode});
      if(errcode) return this.$message.error(`获取数据汇总数据(barChart)失败,${errmsg}`);
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          this.barChartData.push({
            value:data[key],
            name:key,
          })
        }
      }
    } catch (error) {
      return this.$message.error(`获取数据汇总数据(barChart)异常,${error}`);
    }
  }

  @Watch("year")
  yearValueChanged(){
    if(this.year){
      this.queryProjectInfoByLineChar();
    }
  }
}
