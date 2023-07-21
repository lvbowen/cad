<template>
  <div>
    <div class="header">
      <span @click="back"><Icon type="left"/></span><span>合同总览</span>
    </div>
    <div class="container chart">
      <div class="chart-left">
        <div class="cardChart">
          <div class="card">
            <i>合同总数量</i>
            <em>{{ contractTotalNum }}</em>
          </div>
          <div class="card">
            <i>履约合同数</i>
            <em>{{ contractPerformNum }}</em>
          </div>
          <div class="card">
            <i>履约总金额(万元)</i>
            <em>{{ performAmount }}</em>
          </div>
          <div class="card">
            <i>已付总金额(万元)</i>
            <em>{{ payAmount }}</em>
          </div>
        </div>
        <div class="barChart">
          <div class="title">
            <span>付款统计</span>
            <div>
              <span>日期设置:</span>
              <Select v-model="selectYear" style="width:85px;margin:0 20px" @change="selectYearChange">
                <Option v-for="item in years" :key="item">{{ item }}</Option>
              </Select>
            </div>
          </div>
          <div style="width:100%;height:80%;" ref="barChart"></div>
        </div>
      </div>
      <div class="chart-right">
        <div class="pieChart">
          <span>合同分析</span>
          <div style="width:100%;height:95%;" ref="pieChart"></div>
        </div>
      </div>
    </div>
    <div class="container table">
      <span>最新付款</span>
      <Table 
        bordered
        rowKey="id"
        :dataSource="dataSource"
        :columns="columns"
        :pagination="pagination"
        :rowClassName="rowClassName" 
        style="padding:0 10px"
      ></Table>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch,InjectReactive} from "vue-property-decorator";
import echarts, { EChartOption, ECharts } from "echarts";
import Empty from 'ant-design-vue/lib/empty';
import 'ant-design-vue/lib/empty/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import * as Type from '../../type';
import { getContractOverview,getAllYear,getContractPayDetail } from '../../../extends/service/api';
@Component({
    name:'ContractOverview',
    components:{
      Icon,
      Table,
      Empty,
      Select,
      Option:Select.Option,
    }
})
export default class ContractOverview extends Vue{
  @InjectReactive("project") projectCode;
  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;

  contractTotalNum:string="";
  contractPerformNum:string="";
  performAmount:string="";
  payAmount:string="";

  pieChart!:ECharts;
  pieChartData:{name:string,value:number}[]=[];
  barChart!:ECharts;
  barChartData: {
    legend: string[],
    xAxis:string[],
    series: number[];
  } = { legend: [], series: [] ,xAxis:[]};

  selectYear:string="";
  years:string[]=[];
  columns:{title:string,dataIndex:string,width?:number,align?:string,customRender?:Function|string}[]=[
    {title:'序号',dataIndex:'index',align:"center"},
    {title:'合同类型',dataIndex:'contractClass',align:"center"},
    {title:'合同名称',dataIndex:'contractName',align:"center"},
    {title:'签订日期',dataIndex:'contractDate',align:"center"},
    {title:'合同状态',dataIndex:'contractStatus',align:"center"},
    {title:'合同金额(万元)',dataIndex:'contractMoney',align:"center"},
    {title:'计量金额(万元)',dataIndex:'measureMoney',align:"center"},
    {title:'支付金额(万元)',dataIndex:'payMoney',align:"center"},
  ]
  dataSource:any=[];

  pagination:any={
    defaultPageSize:6,
    hideOnSinglePage:true
  };

  mounted(){
    this.getContractOverview();
    this.getAllYear();
    this.pieChartInit();
    this.barChartInit();
    this.chartReSize();
  }

  chartReSize(){
    const iframe=document.createElement("iframe");
    iframe.style.width="100%";
    iframe.style.height="100%";
    iframe.style.position="absolute";
    iframe.style.top="0";
    iframe.style.left="0";
    iframe.style.zIndex="-11111";
    this.$nextTick(()=>{
      iframe.contentWindow?.addEventListener("resize",()=>{
        this.pieChart.dispose();
        this.barChart.dispose();
        this.pieChartInit();
        this.barChartInit();
      })
    });
    const element = document.querySelector(".chart") as HTMLElement;
    element.style.position="relative";
    element.appendChild(iframe);
  }
  pieChartInit(){
    const option=this.pieChartOption;
    const pieChart=echarts.init(this.$refs.pieChart as HTMLDivElement)
    pieChart.showLoading();
    pieChart.setOption(option);
    pieChart.hideLoading();
    this.pieChart=pieChart;
    window.addEventListener("resize",()=>{
      if(this.pieChart){
        this.pieChart.resize();
      }
    });
  }

  barChartInit(){
    const option=this.barCharOption;
    const barChart=echarts.init(this.$refs.barChart as HTMLDivElement)
    barChart.showLoading();
    barChart.setOption(option);
    barChart.hideLoading();
    this.barChart=barChart;
    window.addEventListener("resize",()=>{
      if(this.barChart){
        this.barChart.resize();
      }
    });
  }

  getContractPayDetail(year:string):void{
    getContractPayDetail({        
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName as string,
      year : year
      }).then(res=>{
        if ( res.errcode !== 0 ){
          this.$message.error( res.errmsg as string );
          return;
        }
        this.barChartData.xAxis=[];
        this.barChartData.series=[];
        res.data.forEach(item=>{
          this.barChartData.xAxis.push(item.period);
          this.barChartData.series.push(item.money);
        })
    })
  }

  getAllYear():void{
    getAllYear({        
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName as string
      }).then(res=>{
        if ( res.errcode !== 0 ) {
          this.$message.error( res.errmsg as string );
          return;
        }
        this.years=[];
        res.data.forEach(item=>{
          this.years.push(item);
        })
        if(this.years.length>0){
          this.selectYear = this.years[0];
          this.getContractPayDetail(this.selectYear);
        }
      })
  }

  getContractOverview(){
    getContractOverview({        
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName as string
    }).then(res=>{
        if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        this.contractTotalNum = res.data.overAllData.合同总数量;
        this.contractPerformNum = res.data.overAllData.履约合同数;
        this.performAmount = res.data.overAllData.履约总金额;
        this.payAmount = res.data.overAllData.已付总金额;
        for (const key in res.data.contractClassStatisMap) {
          if (Object.prototype.hasOwnProperty.call(res.data.contractClassStatisMap, key)) {
            this.pieChartData.push({name:key,value:res.data.contractClassStatisMap[key]});
          }
        }
        this.dataSource=[];
        res.data.contractMeasureDTOList.forEach(item=>{
            this.dataSource.push(item);
        })
    });
  }

  get pieChartOption():EChartOption{
    const option: EChartOption = {
      title: {
        text: '合同阶段数量占比',
        left: 'center',
        top: '5%',
        textStyle:{
          fontSize:15,
          fontWeight:500,
        }
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: "10%",
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
            formatter:"{d}%"
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
            text: "暂无数据",
            font: "20px Microsoft YaHei",
          },
        },
      ],
    };
    return option;
  }

  get barCharOption():EChartOption{
    const option: EChartOption<EChartOption.SeriesBar> = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'shadow',
            label: {
              backgroundColor: "#6a7985",
            },
          },
          formatter: function (params) {
            return `<span class="spc">${params[0].axisValue}&nbsp;:&nbsp;${params[0].data}万元</span>
                    <style>
                        .spc{
                            display: inline-block;
                            height: 25px;
                            line-height: 25px;
                            border-radius: 10px;
                            font-size: 15px;
                            padding-right: 8px;
                            color:#fff;
                        }
                        .spc::before{
                            content: '';
                            display: inline-block;
                            height: 9px;
                            width:9px;
                            border-radius: 3px;
                            background-color: ${params[0].color};
                            margin: 0 8px;
                        }
                    </style>`;
          }

        },
        legend: {
          top: "10",
          data: this.barChartData.legend,
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
            axisLine:{
              show:false,
            },
            axisTick: {
              show:false,
              // alignWithLabel: true
            },
            axisLabel:{
              margin:20,
            },
            data: this.barChartData.xAxis,
          },
        ],
        yAxis: [
          {
            type: "value",
            name:this.barChartData.series.length > 0?"(万元)":"",
            axisLine:{
              show:false,
            },
            axisTick: {
              show:false,
            },
            splitLine:{
              show:false,
            },
            nameTextStyle:{
              align:"right",
              verticalAlign: "bottom",
            },
            minInterval:1,
          },
        ],
        series: [
          {
            type:"bar",
            data:this.barChartData.series,
            itemStyle:{
              borderWidth:1,
              borderType:"solid",
              borderRadius: 10,
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.2)",
              shadowOffsetX: 5,
              shadowOffsetY: 5,
              opacity:1
            },
            barWidth:"20%",
            
          }
        ],
        graphic: [
          {
            type: "text",
            z: 100,
            left: "center",
            top: "middle",
            invisible: this.barChartData.series.length > 0,
            style: {
              fill: "#333",
              width: 220,
              overflow: "break",
              text: "暂无数据",
              font: "20px Microsoft YaHei",
            },
          },
        ],
      };
    return option;
  }

  back(){
    this.$router.back();
  }

  selectYearChange(){
    this.getContractPayDetail(this.selectYear);
  }

  rowClassName(record, index){
    if(index%2!==0){
      return "rowClass"
    }
  }

  @Watch("pieChartData",{deep:true})
  pieChartDataChange(){
    if(this.pieChart){
      const option=this.pieChartOption;
      this.pieChart.setOption(option);
    }else{
      this.pieChartInit();
    }
  }
  @Watch("barChartData",{deep:true})
  barChartDataChange(){
    if(this.barChart){
      const option=this.barCharOption;
      this.barChart.setOption(option);
    }else{
      this.barChartInit();
    }
  }
}
</script>

<style lang="less" scoped>
.header{
  font-size: 16px;
  font-weight: 400;
  i{
    color: #568dfe;
    font-weight: 700;
    &:hover{
      cursor:pointer;
    }
  }
  span{
    margin-left: 6px;
  }
}
.container{
  min-width: 1645px;
  width: 100%;
  background: #f3f6fc;
}
.chart{
  display: flex;
  flex-flow: row nowrap;
  margin: 0 auto;
  margin-top: 10px;
  height: 440px;
  justify-content: space-evenly;
  .chart-left{
    flex: 2;
    display: flex;
    flex-flow: column nowrap;
    .cardChart{
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      .card {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-around;
        width: 250px;
        height: 100px;
        background-color: #fff;
        // border: 1px solid #618bbd;
        border-radius: 10px;
        box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
        & > i,
        & > em {
          padding: 0 10px;
          font-weight: 700;
        }
        &>i{
          margin-top: 10px;
          &::before{
            display: inline-block;
            content: '';
            background: #064897;
            width: 3px;
            height: 16px;
            margin-right: 10px;
            vertical-align:text-bottom;
          }
        }
        & > em {
          align-self:flex-end;
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 15px;
          padding-right: 40px;
        }
        &:hover{
          box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.2);
        }
      }
    }
    .barChart{
      margin-top: 12px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
      height: 100%;
      .title{
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        margin-top: 10px;
        &>Span{
          font-weight: 700;
          &::before{
            display: inline-block;
            content: '';
            background: #064897;
            width: 3px;
            height: 16px;
            margin-left: 10px;
            margin-right: 10px;
            vertical-align:text-bottom;
          }
        }
      }
      &:hover{
        box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .chart-right{
    flex: 1;
    margin-left: 32px;
    .pieChart{
      height: 100%;
      padding-top: 15px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
      &>span{
        font-weight: 700;
        &::before{
          display: inline-block;
          content: '';
          background: #064897;
          width: 3px;
          height: 16px;
          margin: 0 15px;
          vertical-align:text-bottom;
        }
      }
    }
    &:hover{
      box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.2);
    }
  }
}
.table{
  margin: 0 auto;
  margin-top: 20px;
  height: 420px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  &>span{
    display: inline-block;
    padding-top: 10px;
    padding-bottom: 10px;
    font-weight: 700;
    &::before{
      display: inline-block;
      content: '';
      background: #064897;
      width: 3px;
      height: 16px;
      margin: 0 10px;
      vertical-align:text-bottom;
    }
  }
  &:hover{
    box-shadow: 2px 2px 15px 1px rgba(0, 0, 0, 0.2);
  }
  /deep/.ant-table-tbody > tr > td{
    padding-top: 10px;
    padding-bottom: 10px;
  }

  /deep/.rowClass{
    background-color: #f8f9fe;
  }
}
</style>