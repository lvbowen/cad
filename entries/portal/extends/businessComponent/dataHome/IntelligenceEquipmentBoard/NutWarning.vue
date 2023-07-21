<template>
  <div class="nut-warning full-height">
    <div class="edge-protect full-height">
      <CardHeader title="螺母预警" @changeTime="changeTime" @closeModal="closeModal"/>
      <div class="medium">
        <div class="full-height flex flex-column">
          <CardTitle title="实时运行数据"/>
          <div class="flex flex-auto">
            <div v-for="(item,index) in edgeProtectData.deviceTotal" :key="index" class="total-view flex flex-center-align">
              <img :src="require(`./img/lbfh/${item.img}.png`)" alt="">
              <div class="flex flex-column flex-center-align">
                <div class="text"> {{ item.text }}</div>
                <div><span class="value">{{ item.value }}</span>{{ item.dw }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom flex">
        <div class="bottom-left flex flex-column">
          <CardTitle title="报警类型占比"/>
          <CircleEchart
            id="warningPieConfig"
            :chartData="warningPieConfig"
            class="flex flex-center-align flex-1"
          ></CircleEchart>
        </div>
        <div class="bottom-right card-lists flex flex-column">
          <CardTitle title="设备报警数据"/>
          <div class="flex-auto scrollbar-default lists">
            <template v-if="edgeProtectData.details.length">
              <div
                v-for="(item,index) in edgeProtectData.details"
                :key="index"
                :class="index%2?'list-item-odd':'list-item-double'"
                class="list-item">
                <div class="inner">
                  <div>{{ item.deviceName }}</div>
                  <div class="flex">
                    <span class="time">报警时间：{{ item.time }}</span>
                    <span class="time">报警类型：{{ item.type }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import CardTitle from './CardTitle.vue';
import CardHeader from './CardHeader.vue';
import { overviewConfig } from "./EquipmentBoardConfig";
import {EdgeProtectData,DefineTypes} from "../../../type";
import {getNutRisk} from "../../../service/api";
import * as Type from "../../../type";
import moment from 'moment';
import CircleEchart from "../deviceManagement/circleEcharts.vue";
@Component({
  name: 'NutWarring',
  components: {
    CardHeader,
    CardTitle,
    CircleEchart
  }
})
export default class NutWarning extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  selectTime: string = '';
  edgeProtectData: EdgeProtectData = {
    deviceTotal:[],
    types: [],
    details: []
  };
  warningPieConfig:any = {
    data: [],
    isLabelLineShow: true,
    midText: "",
    legend: [],
    unitName: "",
    xlegend: "center",
    center: ["50%", "50%"],
    radius: [120, 80],
  };
  timer: any = null;
  closeModal() {
    clearInterval( this.timer );
    this.$emit('closeModal')
  }
  init() {
    // this.edgeProtectData.deviceTotal = [];
    this.edgeProtectData.types = [];
    this.edgeProtectData.details = [];
    this.warningPieConfig.data = [];
    this.warningPieConfig.legend = [];
    getNutRisk({appCode:this.projectCode??'',projectName:this.projectName??'',date:this.selectTime}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.edgeProtectData.deviceTotal?.map((item)=> {
        for (const dataKey in res.data) {
          if(item.field===dataKey) {
            item.value = res.data[dataKey]
          }
        }
      })
      this.edgeProtectData.types = res.data.types;
      if(this.edgeProtectData.types.length) {
        this.edgeProtectData.types.forEach((item) => {
          this.warningPieConfig.data.push({ name: item.type, value: item.num }); //饼图
        });
        this.edgeProtectData.types.forEach((item) => {
          this.warningPieConfig.legend.push(item.type);
        });
      }
      this.edgeProtectData.details = res.data.details;
      // for(let i=0;i<5;i++) {
      //   this.edgeProtectData.details = this.edgeProtectData.details.concat(this.edgeProtectData.details)
      // }
    })
    console.log(this.edgeProtectData,'11')
  }
  changeTime(t) {
    this.selectTime = t;
    this.init();
  }
  mounted() {
    this.selectTime = moment(new Date()).format('YYYY-MM-DD');
    //ts-ignore
    this.edgeProtectData.deviceTotal = overviewConfig.deviceTotal as Array<DefineTypes>;
    this.init();
    this.timer = setInterval(()=> {
      this.init();
    },2* 60 * 1000)
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import './board-public.less';
.nut-warning {
  color: white;
  .medium {
    background-image: url("./img/medium-1.png");
    .bg-full;
    .card-medium;
    padding: @spacing-base;
    .total-view {
      margin-right: 2 * @spacing-large;
      &:first-child {
        margin-left: @spacing-large;
      }
      color: #B4BCBF;
      >img {
        width: 102px;
        height: 102px;
        margin-right: @spacing-base;
      }
      .value {
        color: #32EDFD;
        font-size: 18px;
        padding-top: @spacing-base;
        margin-right: @spacing-base;
        font-family: fantasy;
      }
    }
  }
  .bottom {
    height: 48.43568%;
    .bottom-left {
      .card-pie;
      margin-left: 0;
    }
  }
}
</style>
