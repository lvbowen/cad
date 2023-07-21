<template>
  <el-card shadow="hover" class="card">
    <div slot="header" class="clearfix">
      <span class="card_title">质量管理</span>
      <el-button 
        v-if="false"
        style="float: right; margin-right: 20px"
        type="text">操作按钮&nbsp;&gt;</el-button>
    </div>
    <div class="container">
      <div class="left">
        <div class="title"></div>
        <div class="risks">
          <div class="risksCardContainer">
            <div class="risksCard">
              <i>已验收数</i>
              <em>{{ doneCount }}</em>
            </div>
            <div class="risksCard">
              <i>总验收数</i>
              <em>{{ totalCount }}</em>
            </div>
            <div class="risksCard">
              <i>待验收数</i>
              <em>{{ undoCount }}</em>
            </div>
          </div>
          <div class="problemPercentage">
            <em>质量状态统计</em>
            <div style="width: 90%; height:80%;flex:1" ref="pieChart"></div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">
          <span>质量数量统计</span>
          <div>
            <span>日期区间：</span>
            <el-date-picker
              v-model="datePickerValue"
              type="daterange"
              rangeSeparator="~"
              size="mini"
              @change="datePickerValueChange"
              startPlaceholder="开始日期"
              endPlaceholder="结束日期">
            </el-date-picker>
          </div>
        </div>
        <div style="width: 100%; height:100%;" ref="lineChart"></div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive,Watch } from "vue-property-decorator";
import echarts, { EChartOption, ECharts } from "echarts";
import DatePicker from "element-ui/lib/date-picker";
import Card from "element-ui/lib/card";
import env from "@/config/env";
import { getAnalyseLineCharts,getAnalyseProject } from '../../../../extends/service/api';
import * as Type from "../../../../extends/type";
import moment from "moment";
@Component({
  name: "Schedule",
  components: {
    ElCard: Card,
    ElDatePicker:DatePicker
  },
})
export default class Schedule extends Vue {
  @InjectReactive("projectConfig") projectConfig;
  @InjectReactive("project") projectCode;

  doneCount:number=0;
  totalCount:number=0;
  undoCount:number=0;

  pieChart!:ECharts;
  pieChartData:{name:string,value:number}[]=[];
  lineChart!:ECharts;
  lineChartData: {
    legend: string[],
    xAxis:string[],
    series: {
      name: string;
      type: string;
      symbol: string;
      symbolSize: number;
      smooth: boolean;
      data: number[];
    }[];
  } = { legend: [], series: [] ,xAxis:[]};

  datePickerValue:Date[]=[];

  mounted() {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    this.datePickerValue.push(start);
    this.datePickerValue.push(end);
    getAnalyseProject({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName,
    }).then(res=>{
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.doneCount=res.data?.doneCount as number;
      this.totalCount=res.data?.totalCount as number;
      this.undoCount=res.data?.undoCount as number;
    });
    getAnalyseLineCharts({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName,
      startTime: moment( this.datePickerValue[0] ).format( 'YYYY-MM-DD' ),
      endTime: moment( this.datePickerValue[1] ).format( 'YYYY-MM-DD' ),
    }).then(res=>{
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.pieChartData=[];
      this.lineChartData.xAxis=[];
      this.lineChartData.series=[];
      this.pieChartData.push({name:'已归档',value:res.data?.doneCount as number});
      this.pieChartData.push({name:'审核中',value:res.data?.doingCount as number});
      this.pieChartData.push({name:'未填报',value:res.data?.undoCount as number});
      res.data?.timeCount.forEach(item=>{
          this.lineChartData.xAxis.push(item.time);
          if(this.lineChartData.series.length<=0){
              this.lineChartData.series.push({name:item.time,type:'line',symbol:'circle',symbolSize:5,smooth:true,data:[item.num]})
          }
          else{
              this.lineChartData.series[0].data.push(item.num);
          }
      })
    });
  }

  lineChartInit(){
    const lineChart = echarts.init(this.$refs.lineChart as HTMLDivElement);
    const option: EChartOption<EChartOption.SeriesLine> = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          label: {
            backgroundColor: "#6a7985",
          },
        },
        formatter:'{c}'
      },
      legend: {
        top: "10",
        data: this.lineChartData.legend,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: this.lineChartData.xAxis,
        },
      ],
      yAxis: [
        {
          type: "value",
          name:"个数",
          minInterval:1,
        },
      ],
      series: this.lineChartData.series,
      graphic: [
        {
          type: "text",
          z: 100,
          left: "center",
          top: "middle",
          invisible: this.lineChartData.series.length > 0,
          style: {
            fill: "#333",
            width: 220,
            overflow: "break",
            text: "无数据",
            font: "20px Microsoft YaHei",
          },
        },
      ],
    };
    lineChart.setOption(option);
    this.lineChart = lineChart;
    window.addEventListener("resize", () => {
      if (this.lineChart) {
        this.lineChart.resize();
      }
    });
  }
  pieChartInit(){
    const pieChart = echarts.init(this.$refs.pieChart as HTMLDivElement);
    const option: EChartOption = {
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: "10",
      },
      series: [
        {
          type: "pie",
          radius: ["20%", "50%"],
          center: ["50%", "40%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{c}个",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 15,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: true,
          },
          data: this.pieChartData,
        },
      ],
      graphic: [
        {
          type: "text",
          z: 100,
          left: "center",
          top: "middle",
          invisible: this.pieChartData.length > 0,
          style: {
            fill: "#333",
            width: 220,
            overflow: "break",
            text: "无数据",
            font: "20px Microsoft YaHei",
          },
        },
      ],
    };
    pieChart.setOption(option);
    this.pieChart = pieChart;
    window.addEventListener("resize", () => {
      if (this.pieChart) {
        this.pieChart.resize();
      }
    });
  }
  beforeDestroy(){
    if(this.pieChart){
        this.pieChart.dispose();
    }
    if(this.lineChart){
          this.lineChart.dispose();
      }
  }
  datePickerValueChange(){
    this.pieChartData=[];
    this.lineChartData.xAxis=[];
    this.lineChartData.series=[];
    getAnalyseLineCharts({
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName,
      startTime: moment( this.datePickerValue[0] ).format( 'YYYY-MM-DD' ),
      endTime: moment( this.datePickerValue[1] ).format( 'YYYY-MM-DD' ),
    }).then(res=>{
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.pieChartData.push({name:'已归档',value:res.data?.doneCount as number});
      this.pieChartData.push({name:'审核中',value:res.data?.doingCount as number});
      this.pieChartData.push({name:'未填报',value:res.data?.undoCount as number});
      res.data?.timeCount.forEach(item=>{
          this.lineChartData.xAxis.push(item.time);
          if(this.lineChartData.series.length<=0){
              this.lineChartData.series.push({name:item.time,type:'line',symbol:'circle',symbolSize:5,smooth:true,data:[item.num]})
          }
          else{
              this.lineChartData.series[0].data.push(item.num);
          }
      })
    });
  }
  @Watch("lineChartData",{deep:true})
  lineChartDataChange(newVal,oldVal){
    if(this.lineChart){
      const option: EChartOption<EChartOption.SeriesLine> = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line",
                    label: {
                        backgroundColor: "#6a7985",
                    },
                },
                formatter:'{c}'
            },
            legend: {
                top: "10",
                data: newVal.legend,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: [
                {
                type: "category",
                boundaryGap: false,
                data: newVal.xAxis,
                },
            ],
            yAxis: [
                {
                    type: "value",
                    name:"个数",
                    minInterval:1,
                },
            ],
            series: newVal.series,
            graphic: [
                {
                type: "text",
                z: 100,
                left: "center",
                top: "middle",
                invisible: newVal.series.length > 0,
                style: {
                    fill: "#333",
                    width: 220,
                    overflow: "break",
                    text: "无数据",
                    font: "20px Microsoft YaHei",
                },
                },
            ],
        };
      this.lineChart.setOption(option);
    }else{
        this.lineChartInit();
    }
  }
  @Watch("pieChartData",{deep:true})
  pieChartInitDataChange(newVal,oldVal){
    if(this.pieChart){
      const option: EChartOption = {
        tooltip: {
            trigger: "item",
        },
        legend: {
            bottom: "10",
        },
        series: [
            {
            type: "pie",
            radius: ["20%", "50%"],
            center: ["50%", "40%"],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
            },
            label: {
                show: true,
                formatter: "{c}个",
            },
            emphasis: {
                label: {
                show: true,
                fontSize: 15,
                fontWeight: "bold",
                },
            },
            labelLine: {
                show: true,
            },
            data: newVal,
            },
        ],
        graphic: [
            {
            type: "text",
            z: 100,
            left: "center",
            top: "middle",
            invisible: newVal.length > 0,
            style: {
                fill: "#333",
                width: 220,
                overflow: "break",
                text: "无数据",
                font: "20px Microsoft YaHei",
            },
            },
        ],
        };
      this.pieChart.setOption(option);
    }else{
        this.pieChartInit();
    }
  }
}
</script>

<style lang="less" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.card {
  margin: 10px;
  background: #f2f2f2;
  /deep/.el-card__header {
    font-size: 17px;
    font-weight: 700;
    padding: 0;
    height: 40px;
    border-bottom: 0;
    .card_title {
      display: inline-block;
      padding-left: 20px;
      line-height: 40px;
      border-bottom: 1px solid #ebeef5;
    }
  }
}
.container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: flex-start;
  width: 100%;
  height: 362px;
  .left,
  .right {
    flex: 1;
    margin: 10px;
    height: 100%;
    border: 1px solid #fff;
    border-radius: 5px;
    background: #fff;
  }
  .right{
    flex: 2;
      display: flex;
      flex-flow: column nowrap;
  }
  .title {
      display: flex;
      flex-flow: rwo nowrap;
      justify-content: space-between;
      margin: 0 10px;
      height: 40px;
      font-size: 15px;
      font-weight: 700;
      line-height: 40px;
      border-bottom: 1px solid #ebeef5;
    }
  .risks {
    display: flex;
    flex-flow: row nowrap;
    height: 322px;
    .risksCardContainer {
      height: 100%;
      display: flex;
      flex-flow: column nowrap;
      justify-content: space-evenly;
      padding: 0 10px;
      .risksCard {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-around;
        width: 160px;
        height: 60px;
        border: 1px solid #618bbd;
        border-radius: 10px;
        & > i,
        & > em {
          padding: 0 10px;
        }
        & > em {
          align-self: flex-end;
          color: #429d8a;
          font-size: 15px;
          font-weight: 700;
        }
      }
    }
    .problemPercentage {
        flex: 1;
      & > em {
        font-size: 15px;
        font-weight: 700;
        &::before {
          display: inline-block;
          content: " ";
          width: 4px;
          height: 15px;
          background: #064897;
          margin-right: 10px;
          vertical-align: middle;
        }
      }
    }
  }
}
</style>