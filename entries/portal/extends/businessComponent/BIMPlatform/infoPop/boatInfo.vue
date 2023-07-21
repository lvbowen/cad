<template>
  <article :class="[this.id=='' ? 'hide' : 'boatShow']">
    <i class="closeBtn" @click="closeInfo">x</i>
    <nav>船舶信息</nav>
    <div class="liveCard">
      <span v-for="(val,key) in boatData" :key="key">{{ key + ' :  ' + val }}</span></div>
    <nav>轨迹回放
      <a-button @click="drawTrail" size="small" style="float: right">确认</a-button>
      <a-button @click="clearTail" size="small" style="float: right;margin-right:3px">清除</a-button>
    </nav>
    <a-range-picker
      showTime
      @change="trailTime"
      :disabledDate="disabledDate"
      @calendarChange="calendarChange"
      style="width:320px">
      <template slot="renderExtraFooter">
      </template>
    </a-range-picker>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import axios from "axios";
import env from "@/config/env";
import {DatePicker, Button} from '@h3/antd-vue';
import moment from 'moment';
import {VideoDevice} from "../../../type";

const {RangePicker} = DatePicker;
@Component({
  name: 'boatInfo',
  components: {
    ARangePicker: RangePicker,
    AButton: Button,
  }
})
export default class boatInfo extends Vue {
  @Prop() projectCode!: string;
  @Prop() devicesData!: string;
  BIM_URL: string = `${env.apiHost}/`;
  boatData: object = {};
  id: string = '';
  sn: string = '';
  boatShow: boolean = false;
  selectPriceDate: string = '';
  offsetDays: number = 259200 * 1000 //最多选择范围31天ms;
  endTime: string = '';
  startTime: string = '';

  closeInfo() {
    this.id = '';
    this.boatShow = false;
    this.clearTail();
  }

  initBoatInfo() {
    axios
      .get(this.BIM_URL + `bim/boat/getBoatMsg`, {
        params: {
          deviceId: this.id,
          appCode: this.projectCode,
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.boatData = res.data;
        }
      })
  }

  // 将时间字符串 转换 为 Moment
  momentDateStr(dateStr) {
    return moment(dateStr);
  }

  @Watch('devicesData', {immediate: true})
  devicesIdListener(val: Array<VideoDevice>) {
    if (!val && process.env.NODE_ENV === 'debug') {
      //@ts-ignore
      this.$message.warn('暂无相应数据')
    } else {
      this.boatShow = true;
      //@ts-ignore
      this.id = val[0].id;
      this.sn = val[0].sn;
      this.initBoatInfo();
    }
  }

  trailTime(dates, dateStrings) {
    console.log('dates', dateStrings);
    this.endTime = dateStrings[1];
    this.startTime = dateStrings[0];
  }

  formatDate(value) {
    let date = new Date(value)
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    let D = date.getDate()
    return Y + '-' + M + '-' + D
  }

  disabledDate(current) {
    if (this.selectPriceDate) {
      let selectV = moment(this.selectPriceDate, 'YYYY-MM-DD').valueOf()
      return current > moment(this.formatDate(new Date(selectV + this.offsetDays).getTime()), 'YYYY-MM-DD') ||
        current > moment().endOf('day')
    } else {
      return current > moment().endOf('day')
    }
  }

  //选择开始时间/结束时间
  calendarChange(date) {
    this.selectPriceDate = date[0]
  }

  drawTrail() {
    this.selectPriceDate = '';
    axios
      .post(this.BIM_URL + `bim/boat/getBoatLocus`, {
        deviceSn: this.sn,
        endTime: this.endTime,
        startTime: this.startTime,
        appCode: this.projectCode,
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          //画轨迹
          this.$emit('drawPolyTrail',res.data);
        } else {
          //@ts-ignore
          this.$message.warn(res.errmsg);
        }
      })
  }

  clearTail() {
    this.$emit('clearTail');
  }
}

</script>

<style lang="less" scoped>
@import (reference) "../../../styles/theme.less";

.boatShow {
  .flex;
  .noScrollbar;
  flex-direction: column;
  width: 359px !important;
  min-height: 300px;
  height: auto;
  overflow-y: auto;
  background: rgba(28, 54, 106, 0.8);
  margin-left: auto;
  padding: 20px;

  position: fixed;
  right: 20px;
  top: 100px;

  & > nav {
    font-size: 18px;
    font-weight: 400;
    color: #338FEC;
    margin-bottom: 8px;
  }

  & > span {
    font-size: 14px;
    font-weight: 400;
    color: #FFF;
    margin-bottom: 8px;
  }
}

.liveCard {
  .flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;

  & > nav {
    font-size: 18px;
    font-weight: 400;
    color: #338FEC;
    margin-bottom: 8px;
  }

  & > span {
    font-size: 14px;
    font-weight: 400;
    color: #FFF;
  }

  & > span:last-of-type {
    margin-bottom: 8px;
  }

  & video {
    display: flex;
    width: 100%;
    height: 100%;
  }

}

.show {
  .flex;
}

.hide {
  display: none;
}

.closeBtn {
  .flex;
  cursor: pointer;
  width: 16px;
  height: 16px;
  color: #FFF;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin-left: 309px;
  margin-top: -6px;
  font-size: 18px;
}

/deep/ .ant-calendar-range-picker-input {
  font-size: 15px !important;
}
</style>

