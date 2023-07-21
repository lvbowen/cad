<template>
  <div class="main">
    <div class="select">
      <p>计划类型：</p>
      <el-button :style="{background: type === 'year'?'#153968':'',color:type === 'year'?'#33ABDA':''}" @click="yearType">年度计划</el-button>
      <el-button :style="{background: type === 'monthrange'?'#153968':'',color:type === 'monthrange'?'#33ABDA':''}" @click="monthType">月度计划</el-button>
      <p>计划时间：</p>
      <div>
        <el-date-picker
          :valueFormat="valueFormat"
          @change="datePick"
          v-model="value1"
          :clearable="false"
          :type="type"
          :startPlaceholder="type==='monthrange'?'开始月份':''"
          :endPlaceholder="type==='monthrange'?'结束月份':''"
          :rangeSeparator="type==='monthrange'?'至':''"
          :placeholder="type==='monthrange'?'选择月范围':'选择年份'"
          :pickerOptions="type==='monthrange'?pickerOptions:{}"
        >
        </el-date-picker>
      </div>
    </div>
    <div class="top">
      <div class="planning">
        <div class="gennerl_title">
          <h4>物资需求计划</h4>
        </div>
        <div class="seletType">
          <div class="lists">
            <el-scrollbar style="height: 100%">
              <div
                class="listData"
                @click="handleClick(item)"
                v-for="(item,index) in List"
                :key="index">
                <img src="./img/imgIcon.png" alt="">
                <p>{{ item.type }}</p>
                <div>
                  <span>{{ item.totalDesignValue }}</span>
                  <span>{{ item.registers[0].unit }}</span>
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div class="piecharts">
            <CircleEchart :chartData="circleData" id="CircleEchart" style="width: 95%; height: 30vh; margin-left: 3%"></CircleEchart>
          </div>
        </div>
      </div>
      <div class="statistics">
        <div class="gennerl_title">
          <h4>物资出入库统计</h4>
        </div>
        <div class="barEchart">
          <BarEcharts id="barEcharts" :chartData="barData" :barWidth="15"></BarEcharts>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="gennerl_title">
        <h4>物资库存明细</h4>
      </div>
      <div class="eltable">
        <div class="search">
          <el-input
            v-model="search"
            suffixIcon="el-icon-search"
            size="mini"
            placeholder="输入关键字搜索" />
          <!-- <el-button slot="append" icon="el-icon-search"></el-button> -->
        </div>
        <el-table height="280px" :data="tableListData" style="width: 100%">
          <el-table-column type="index"> </el-table-column>
          <el-table-column label="项目名称" prop="projectName"></el-table-column>
          <el-table-column label="物资名称" prop="type"> </el-table-column>
          <el-table-column label="物资编号" prop="code"> </el-table-column>
          <el-table-column label="物资类型" prop="materialName"> </el-table-column>
          <el-table-column label="物资规格" prop="specification"> </el-table-column>
          <el-table-column label="物资单位" prop="unit"> </el-table-column>
          <el-table-column label="月度设计量" prop="designValue"> </el-table-column>
          <el-table-column label="月度入库数" prop="saveValue"> </el-table-column>
          <el-table-column label="月度出库数" prop="quitValue"> </el-table-column>
          <el-table-column label="当前库存数" prop="currentValue"> </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import{Component,Vue,Prop,Watch} from "vue-property-decorator";
import env from "@/config/env";
import { getReport } from "./index.js";
import Input from "element-ui/lib/input";
import DatePicker from "element-ui/lib/date-picker";
import CircleEchart from "./circleEcharts.vue";
import BarEcharts from "./BarEcharts.vue";

@Component({
  name:"MateriaManagement",
  components:{
    [Input.name]:Input,
    [DatePicker.name]:DatePicker,
    CircleEchart,
    BarEcharts,
  }
})
export default class MateriaManagement extends Vue{
  @Prop() projectName!: String;
  @Prop() projectLevel!: String;

  projectCode= '';
  List= [];
  tableData= [];
  barData= {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    legendData: ["入库", "出库"],
    unitName: "个",
    minInterval: 1,
  };
  circleData= {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: [],
    legendType: 'scroll',
    unitName: "",
    xlegend: "center",
    center: ["50%", "50%"],
    radius: [120, 80],
  };
  search= '';
  value1= '';
  valueFormat= 'yyyy';
  type= 'year';
  dateType= '年度';
  pickerOptions:any = {
    shortcuts: [
      {
        text: '本月',
        onClick(picker) {
          picker.$emit('pick', [new Date(), new Date()]);
        }
      },
      {
        text: '今年至今',
        onClick(picker) {
          const end = new Date();
          const start = new Date(new Date().getFullYear(), 0);
          picker.$emit('pick', [start, end]);
        }
        },
      {
        text: '最近六个月',
        onClick(picker) {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 6);
          picker.$emit('pick', [start, end]);
          },
      }]
  }

  get isProjectLevel() {
    return this.projectLevel==='项目'
  }

  get tableListData() {
    //@ts-ignore
    return this.tableData.filter((data) =>!this.search || data.materialName.toLowerCase().includes(this.search.toLowerCase()))
  }

  handleClick(val) {
    this.barData.xAxis = []
    this.barData.yAxis1 = []
    this.barData.yAxis2 = []
    this.circleData.data = []
    val?.registers.forEach(e => {
      //@ts-ignore
      this.barData.xAxis.push(e.specification)
      //@ts-ignore
      this.barData.yAxis1.push(e.totalSave)
      //@ts-ignore
      this.barData.yAxis2.push(e.totalQuit)
      //@ts-ignore
      // this.circleData.legend.push(e.specification)
    });
    this.circleData.data = val?.registers.map((item => {
      return {
        name: item.specification, value: item.designValue
      }
    }))
  };
  yearType() {
    this.type = "year"
    this.valueFormat = "yyyy"
    this.value1 = ""
    this.dateType = "年度"
  };
  monthType() {
    this.type = "monthrange"
    this.valueFormat = "yyyy-MM"
    this.dateType = "月度"
    this.value1 = ""
  };
  datePick() {
    if (!this.value1) return this.$message.error("请选择日期！")
    this.getinit(this.dateType, this.value1)
  };
  getinit(dateType, date) {
    this.barData.xAxis = []
    this.barData.yAxis1 = []
    this.barData.yAxis2 = []
    this.circleData.data = []
    let year: string = '';
    let startMonth: string = '';
    let endMonth: string = '';
    if(dateType==='年度') {
      year = date;
    }else if(dateType==='月度') {
      startMonth = date[0]
      endMonth = date[1]
    }
    getReport(this.projectCode, this.projectName, dateType, year,this.isProjectLevel,startMonth,endMonth).then(res=> {
      //@ts-ignore
      if(res.errcode!==0) {
        //@ts-ignore
        return this.$message.error(res.errmsg as string)
      }
      this.tableData = res.data.datas
      this.List = res.data.types
      res.data?.types[0]?.registers.forEach(e => {
        //@ts-ignore
        this.barData.xAxis.push(e.specification)
        //@ts-ignore
        this.barData.yAxis1.push(e.totalSave)
        //@ts-ignore
        this.barData.yAxis2.push(e.totalQuit)
        //@ts-ignore
        // this.circleData.legend.push(e.specification)
      });
      this.circleData.data = res.data?.types[0]?.registers.map((item => {
        return {
          name: item.specification, value: item.designValue
        }
      }))
    })
  };

  mounted(){
    //@ts-ignore
    this.value1 = new Date();
    this.projectCode = `${env.project}`;
    //@ts-ignore
    this.getinit(this.dateType, this.value1.getFullYear())
    //动态获取季度
    let mappingMonth:number = Math.ceil((new Date().getMonth()+1)/3);
    const arr = [];
    const timer = setInterval(()=> {
      // console.log(mappingMonth,'11',arr,'arr')
      if(mappingMonth===0) {
        clearInterval(timer)
        arr.map((item) => {
          this.pickerOptions.shortcuts.push({
            text: `第${item===1?'一':item===2?'二':item===3?'三':'四'}季度`,
            onClick(picker) {
              const start = new Date(new Date().getFullYear(),(item-1)*3);
              const end = new Date(new Date().getFullYear(),(item-1)*3+2);
              picker.$emit('pick',[start,end])
            }
          })
        })
      }else {
        //@ts-ignore
        arr.unshift(mappingMonth);
        mappingMonth--
      }
    },0)
  }
}
</script>

<style lang="less" scoped>
@import url("./MateriaManagement.less");
</style>
