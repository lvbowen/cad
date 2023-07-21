<template>
  <el-card shadow="hover" class="card">
    <div slot="header" class="clearfix">
      <span class="card_title">计量管理</span>
      <el-button 
        v-if="false"
        style="float: right; margin-right: 20px"
        type="text">操作按钮&nbsp;&gt;</el-button>
    </div>
    <div class="container">
      <div class="left">
        <div class="title">施工投资完成情况</div>
        <div class="risks">
          <div class="risksCardContainer">
            <div class="risksCard">
              <i>项目总资产</i>
              <em>{{ totalNum }}<i>万元</i></em>
            </div>
            <div class="risksCard">
              <i>已完成产值</i>
              <em>{{ doneNum }}<i>万元</i></em>
            </div>
          </div>
          <div class="problemPercentage">
            <!-- <em>质量状态统计</em> -->
            <div style="width: 90%; height:80%;flex:1" ref="pieChart"></div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">每期计量金额</div>
        <div style="width: 100%; height:100%;" ref="lineChart"></div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive,Watch } from "vue-property-decorator";
import echarts, { EChartOption, ECharts } from "echarts";
import Card from "element-ui/lib/card";
import env from "@/config/env";
import * as Type from "../../../../extends/type";
import { getLatestCBSV3,getCbsByProjectName } from '../../../../extends/service/api';
@Component({
  name: "Schedule",
  components: {
    ElCard:Card,
  },
})
export default class Schedule extends Vue {
    @InjectReactive("projectConfig") projectConfig;
    @InjectReactive("project") projectCode;

    totalNum=0;
    doneNum=0;

    pieChart!:ECharts;
    pieChartData:{name:string,value:number}[]=[];
    lineChart!:ECharts;
    lineChartData: {
      legend: string[],
      xAxis:string[],
      series: {
        name: string;
        type: string;
        barWidth:string,
        symbol: string;
        symbolSize: number;
        smooth: boolean;
        data: number[];
      }[];
    } = { legend: [], series: [] ,xAxis:[]};


    mounted(){
      getLatestCBSV3({      
        appCode: this.projectCode,
        projectName: this.projectConfig?.projectName
      }).then(res=>{
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.totalNum = res.data.textData.项目总产值;
        this.doneNum=res.data?.textData.已完成产值;
        this.pieChartData=[];
        for (const key in res.data?.pieData) {
          if (Object.prototype.hasOwnProperty.call(res.data?.pieData, key)) {
            this.pieChartData.push({name:key,value:res.data?.pieData[key]});
          }
        }
      });
      getCbsByProjectName({      
        appCode: this.projectCode,
        projectName: this.projectConfig?.projectName
      }).then(res=>{
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.lineChartData.xAxis=[];
        this.lineChartData.series=[];
        res.data?.forEach(item=>{
          this.lineChartData.xAxis.push(item.period);
          if(this.lineChartData.series.length<=0){
              this.lineChartData.series.push({name:'计量金额(万元)',type:'bar',barWidth: '60%',symbol:'circle',symbolSize:5,smooth:true,data:[item.money]})
          }
          else{
              this.lineChartData.series[0].data.push(item.money);
          }
        })
      })
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
    lineChartInit(){
      const lineChart = echarts.init(this.$refs.lineChart as HTMLDivElement);
      const option: EChartOption<EChartOption.SeriesLine> = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow',
            label: {
              backgroundColor: "#6a7985",
            },
          },
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
            axisTick: {
              alignWithLabel: true
            },
            data: this.lineChartData.xAxis,
          },
        ],
        yAxis: [
          {
            type: "value",
            name:"万元",
            // minInterval:1,
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
    @Watch("lineChartData",{deep:true})
    lineChartDataChange(newVal,oldVal){
      if(this.lineChart){
        const option: EChartOption<EChartOption.SeriesLine> = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow',
            label: {
              backgroundColor: "#6a7985",
            },
          },
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
            axisTick: {
              alignWithLabel: true
            },
            data: this.lineChartData.xAxis,
          },
        ],
        yAxis: [
          {
            type: "value",
            name:"万元",
            // minInterval:1,
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
        this.lineChart.setOption(option);
      }else{
          this.lineChartInit();
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
        width: 200px;
        height: 100px;
        border: 1px solid #618bbd;
        border-radius: 10px;
        & > i,
        & > em {
          padding: 0 10px;
        }
        & > em {
          align-self: flex-end;
          font-size: 36px;
          color: #ffa800;
          font-weight: 700;
          i{
            color: rgba(0,0,0,.65);
            font-size: 14px;
          }
        }
        &:nth-child(2)>em{
          color: #3fcf2c;
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