<template>
  <div class="app-material-manage flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="arrow-left" @click="$router.go(-1)"/>
      <div class="title">物资管理</div>
      <a class="import" @click="download">导出</a>
    </div>
    <van-cell center title="统计时间" class="date">
      <template #default>
        <span v-show="switchDate" class="text" @click="showDatePicker('year')">{{ !condition.year?'年份选择':`${condition.year}年` }}
          <van-icon name="arrow-down" />
        </span>
        <div v-show="!switchDate">
          <span class="text" @click="showDatePicker('month')">{{ !condition.startMonth?'开始月份':`${condition.startMonth.getFullYear()}-${condition.startMonth.getMonth()+1}` }}
            <van-icon name="arrow-down" /></span>至
          <span class="text" @click="showDatePicker('month',true)">{{ !condition.endMonth?'结束月份':`${condition.endMonth.getFullYear()}-${condition.endMonth.getMonth()+1}` }}
            <van-icon name="arrow-down" /></span>
        </div>
      </template>
      <template #right-icon>
        <a-switch
          v-model="switchDate"
          @change="switchDateStatus"
          checkedChildren="年度"
          unCheckedChildren="月度"/>
      </template>
    </van-cell>
    <div class="material-info">
      <div>
        <div class="plan">
          <div class="flex flex-center-align title">
            <img src="../../Img/title@2x.png" alt="">物资采购计划
          </div>
          <template v-if="materialInfo.types.length">
            <van-swipe :autoplay="1000000" indicatorColor="white" class="my-swipe">
              <van-swipe-item v-for="(i,index) in fakeMaterialInfoTypes" :key="index">
                <div
                  :class="activeTypeIndex===3*index + itemIndex?'active-total':'total'"
                  v-for="(item,itemIndex) in i"
                  :key="itemIndex"
                  @click="changeActiveTypeIndex(3*index + itemIndex,item.type)">
                  <div class="num">{{ item.totalDesignValue }}</div>
                  <div class="text">{{ item.type }}</div>
                </div>
              </van-swipe-item>
            </van-swipe>
          </template>
        </div>
        <div class="plan-pie">
          <pie-charts
            :chartData="materialTypePieData"
            :id="'materialTypePieData'"
          ></pie-charts>
        </div>
        <div class="plan-bar">
          <bar-echarts :id="'materialTypeBarData'" :chartData="materialTypeBarData"></bar-echarts>
        </div>
      </div>
    </div>
    <van-action-sheet v-model="showDatePanel">
      <van-picker
        v-show="showYearPanel"
        :defaultIndex="defaultSelectYear"
        :title="datePickerTitle"
        showToolbar
        :columns="yearColumns"
        @confirm="(value)=> onConfirm(value,'year')"
        @cancel="onCancel"
      />
      <van-datetime-picker
        v-show="!showYearPanel"
        v-model="currentDate"
        :type="datePickerType"
        :title="datePickerTitle"
        :minDate="minDate"
        :maxDate="maxDate"
        @confirm="(value)=> onConfirm(value,'month')"
        @cancel="onCancel"
        :formatter="formatter"
      />
    </van-action-sheet>
  </div>
</template>

<script lang="ts">
import {Vue, Component,InjectReactive} from 'vue-property-decorator';
import {utils} from "@cloudpivot/common";
import { getMaterialInfo } from "../../service/api";
import { MaterialInfo,ProjectConfig,GetMaterialInfoParams } from "../../type";
import {Icon, Cell, DatetimePicker, ActionSheet, Picker, Toast,Swipe,SwipeItem} from 'vant'
import Switch from 'ant-design-vue/lib/switch'
import 'ant-design-vue/lib/switch/style/index.css';
import moment from "moment";
import PieCharts from "../../basicCustomComponent/echarts/PieCharts.vue";
import BarEcharts from "../components/BarEcharts.vue";
import Utils from "@/utils";
@Component({
  name: 'AppMaterialManage',
  components: {
    vanIcon: Icon,
    ASwitch: Switch,
    vanCell: Cell,
    vanDatetimePicker: DatetimePicker,
    vanActionSheet: ActionSheet,
    vanPicker: Picker,
    PieCharts,
    BarEcharts,
    vanSwipe: Swipe,
    vanSwipeItem: SwipeItem,
  }
})
export default class AppMaterialManage extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig!: ProjectConfig;
  condition:GetMaterialInfoParams = {
    appCode: '',
    projectName: '',
    singleProject: true,
    payType:'',
    dateType: '',
    year: '',
    startMonth: '',
    endMonth: ''
  }
  materialInfo: MaterialInfo = {
    types: []
  };
  switchDate: boolean = true;
  activeTypeIndex: number = 0;
  //date-pick
  showDatePanel: boolean = false;
  showYearPanel: boolean = true;
  datePickerTitle: string = '选择年';
  datePickerType: string = 'year-month';
  currentDate: Date = new Date();
  minDate: Date =  new Date(2010, 0, 1);
  maxDate: Date = new Date(2025, 10, 1);
  endMonthFlag: boolean = false;
  //year
  yearColumns: number[] = [];
  defaultSelectYear: number = 0;
  //pie
  materialTypePieData: any = {
    orient: "horizontal",
    tileTexts: "",
    textStyle: "#0A0A0A",
    fontWeight: "700",
    right: 'auto',
    color: [
      "#00C567",
      "#0096FF",
      "#FFA943",
      "#E271DE",
      "#F8456B",
      "#00FFFF",
      "#4AEAB0",
    ],
    radius: ["40%", "60%"],
    center: ["50%", "40%"],
    series: [
      {
        name: "未填报",
        value: 0,
      },
      {
        name: "审核中",
        value: 0,
      },
      {
        name: "已归档",
        value: 0,
      },
    ],
    // midText:0,
    legendScroll: 'scroll',
    legendItemGap: 20
  };
  materialTypeBarData: any = {
    payMoneyList: [],
    unpayMoneyList: [],
    contractNameList: [],
    legendArr: ['出库','入库'],
    legendName1: "出库",
    legendName2: "入库",
    showDataZoom: true,
    girdBottom: '50'
  }
  init() {
    //初始化
    this.materialTypePieData.series = [];
    this.materialTypePieData.legend = [];
    if(this.materialTypePieData.color.length>7) {
     this.materialTypePieData.color = this.materialTypePieData.color.slice(0,7)
    }
    this.materialTypeBarData.payMoneyList = [];
    this.materialTypeBarData.unpayMoneyList = [];
    this.materialTypeBarData.contractNameList = [];
    getMaterialInfo({
      appCode: this.condition.appCode,
      projectName: this.condition.projectName,
      singleProject: this.condition.singleProject,
      payType: this.condition.payType,
      dateType: this.condition.dateType,
      year: this.condition.year,
      startMonth: !this.condition.startMonth?'':moment(this.condition.startMonth).format('YYYY-MM'),
      endMonth: !this.condition.endMonth?'':moment(this.condition.endMonth).format('YYYY-MM')
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.materialInfo.types = res.data?.types??[];
      this.showDatePanel = false;
      this.endMonthFlag = false;
      if(!this.materialInfo.types.length) return
      if(this.materialInfo.types[this.activeTypeIndex].registers && this.materialInfo.types[this.activeTypeIndex].registers.length) {
        this.materialInfo.types[this.activeTypeIndex].registers.map((value) => {
          this.materialTypeBarData.payMoneyList.push(value.totalQuit);
          this.materialTypeBarData.unpayMoneyList.push(value.totalSave);
          this.materialTypeBarData.contractNameList.push(value.specification);
          this.materialTypePieData.series.push({
            name: value.specification,
            value: value.designValue
          })
          this.materialTypePieData.legend.push({
            name: value.specification
          })
        })
        if(this.materialTypePieData.legend.length>7) {
          for (let i = 0; i < this.materialTypePieData.legend.length - 7; i++) {
            this.materialTypePieData.color.push(Utils.colorHex(`rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`))
          }
        }
        // this.materialTypePieData.midText = (this.materialInfo.types[this.activeTypeIndex].registers.reduce((preTotal,cur)=> preTotal+cur.designValue,0)).toString()
      }
    })
  }

  get isProjectLevel() {
    return !this.projectConfig?.projectLevel?false:this.projectConfig?.projectLevel === 2
  }

  get fakeMaterialInfoTypes() {
    return Utils.fakePagination(this.materialInfo.types,3)
  }

  changeActiveTypeIndex(index:number,type:string) {
    this.activeTypeIndex = index;
    this.init();
  }
  //date-pick
  switchDateStatus(val:any) {
    this.switchDate = val;
    if(val) { //年度
      this.condition.startMonth = '';
      this.condition.endMonth = '';
      this.condition.dateType = '年度';
      this.condition.year = new Date().getFullYear().toString();
      this.init();
    }else { //月度
      this.condition.year = '';
      this.condition.dateType = '月度';
      this.condition.startMonth = new Date();
      this.condition.endMonth = new Date();
      this.init();
    }
  }
  showDatePicker(flag:'year'|'month',endMonthFlag?:boolean) {
    switch (flag) {
      case 'year':
        this.endMonthFlag = false;
        this.datePickerTitle = '选择年';
        this.showDatePanel = true;
        this.showYearPanel = true;
        this.yearColumns.map((item,index) => {
          if(item===new Date().getFullYear()) {
            this.defaultSelectYear = index
          }
        })
        break;
      case 'month':
        this.endMonthFlag = endMonthFlag??false;
        this.datePickerTitle = '选择年月';
        this.minDate = new Date(2010, 0);
        this.maxDate = new Date(new Date().getFullYear() + 20, 10)
        this.showDatePanel = true;
        this.showYearPanel = false;
        break;
    }
  }
  formatter(type, val) {
    if (type === 'year') {
      return `${val}年`;
    } else if (type === 'month') {
      return `${val}月`;
    }
    return val;
  }
  onConfirm(value:string|number|Date, flag:'year'|'month') {
    console.log(value,flag,'11')
    switch (flag) {
      case 'year':
        this.condition.startMonth = '';
        this.condition.endMonth = '';
        this.condition.year = value as string;
        this.condition.dateType = '年度';
        this.init();
       break;
      case 'month':
        this.condition.year = '';
        this.condition.dateType = '月度';
        if(!this.endMonthFlag){
          //startMonth<=endMonth
          if(this.condition.endMonth) {
            if(moment(this.condition.endMonth).valueOf()<moment(value).valueOf()) {
              Toast('开始时间不得大于结束时间！')
            }else {
              this.condition.startMonth = value as Date;
              this.init();
            }
          }else {
            this.condition.startMonth = value as Date;
          }
        }else {
          //startMonth<=endMonth
          if(this.condition.startMonth) {
            if(moment(this.condition.startMonth).valueOf()>moment(value).valueOf()) {
              Toast('开始时间不得大于结束时间！')
            }else {
              this.condition.endMonth = value as Date;
              this.init();
            }
          }else {
            this.condition.endMonth = value as Date;
          }
        }
        this.showDatePanel = false;
       break;
    }
  }
  onCancel() {
    this.showDatePanel = false;
  }
  download() {
    let url = `/api/api/materialManage/exportAnalyse?appCode=${this.projectCode}&projectName=${this.projectConfig?.projectName??''}&singleProject=${this.isProjectLevel}&dateType=${this.condition.dateType}&payType=${this.condition.payType}`;
    if(this.condition.dateType==='年度') {
      url = `${url}&year=${this.condition.year}`
    }else{
      url = `${url}&startMonth=${!this.condition.startMonth?'':moment(this.condition.startMonth).format('YYYY-MM')}&endMonth=${!this.condition.endMonth?'':moment(this.condition.endMonth).format('YYYY-MM')}`
    }
    window.open(url)
  }
  mounted() {
    utils.Bus.$emit('toggleNavbar',false);
    this.condition.appCode = this.projectCode??'';
    this.condition.projectName = this.projectConfig?.projectName??'';
    this.condition.singleProject = this.isProjectLevel;
    this.condition.year = new Date().getFullYear().toString();
    this.condition.dateType = '年度';
    this.init();
    //year
    for (let i = 2010; i < (new Date).getFullYear() + 20; i++) {
      this.yearColumns.push(i)
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.app-material-manage {
  background-color: #F6F7FB;
  text-align: left;
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #004898;
    .px2rem(height, 88);
    display: flex;
    justify-content: space-between;
    .title {
      position: absolute;
      transform: translateX(-50%);
      left: 50%;
      font-weight: bold;
    }
    >a {
      &:active {
        opacity: 0.8;
      }
    }
  }
  .van-cell {
    .van-cell__title {
      flex: inherit;
    }
    .van-cell__value {
      text-align: left;
      font: inherit;
      .px2rem(margin-left,20);
      .text {
        display: inline-flex;
        align-items: center;
        border: 1px solid #969799;
        .px2rem(border-radius,10);
        .px2rem(padding,5);
        .px2rem(padding-left,15);
        .px2rem(padding-right,15);
        .px2rem(margin-right,10);
        .px2rem(margin-left,10);
        .van-icon {
          .px2rem(margin-left,5)
        }
      }
    }
  }
  .material-info {
    flex: 1;
    overflow: auto;
    .px2rem(padding,30);
    overflow: auto;
    >div {
      height: 100%;
      background-color: #FFFFFF;
      .px2rem(padding,20);
      .plan {
        .my-swipe {
          /deep/ .van-swipe__indicator {
            display: none;
          }
        }
        .title {
          .px2rem(font-size,30);
          font-weight: bold;
          img {
            .px2rem(width,40);
            .px2rem(height,40);
            .px2rem(margin-right,15)
          }
          .px2rem(margin-bottom,40);
        }
        .total {
          width: calc(33% - 0.4rem);
          display: inline-block;
          text-align: center;
          .px2rem(font-size,25);
          font-weight: bold;
          .px2rem(margin-bottom,20);
          margin-left: 0.2rem;
          margin-right: 0.2rem;
          .num {
            .px2rem(margin-bottom,20);
            color: #1F1D41;
          }
          .text {
            color: #9392A3;
          }
        }
        .active-total {
          .total;
          border: 1px solid #42bb06;
          .px2rem(padding,2);
          .px2rem(border-radius,10);
          @active-color:#42bb06;
          .num {
            color:@active-color;
          }
          .text {
            color:@active-color;
          }
        }
      }
      .plan-pie {
        .px2rem(height,500);
        .px2rem(margin-top,40);
        .px2rem(margin-bottom,40);
      }
      .plan-bar {
        .px2rem(height,500)
      }
    }
  }
}
</style>
