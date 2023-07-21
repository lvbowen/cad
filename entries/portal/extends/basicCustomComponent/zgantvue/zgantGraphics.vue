<template>
  <div
    ref="gbody"
    class="zgant-graphices"
  >
    <!--<div ref="gbody" class="zgant-graphices" @click="test">-->
    <div
      ref="zgant-g-title"
      class="zgant-graphices-title"
      @mouseenter="setTitleScroll($event)"
      @mouseleave="delTitleScroll($event)"
    >
      <div
        v-for="(item,index) in calender.top"
        :key="item.id"
        class="zgant-graphices-title-group"
        :style="{'--group-size': calender.bottom[item].length}"
      >
        <div class="zgant-graphices-title-top"><span
          v-text="item"
          :title="item"
        ></span></div>
        <div class="zgant-graphices-title-bottom">
          <div
            v-for="(bo,index) in calender.bottom[item]"
            :key="bo.id"
            class="zgant-graphices-title-cell"
          ><span v-text="bo"></span></div>
        </div>
      </div>
    </div>
    <div
      ref="zgant-g-body"
      class="zgant-graphices-body"
      @mouseenter.stop="setBodyScroll($event)"
      @mouseleave.stop="delBodyScroll($event)"
    >
      <div
        class="zgant-graphices-timeline"
        :style="{'--zgant-max-col':maxColum}"
      >
        <zgant-graphics-row
          v-for="(item,index) in dataList"
          :key="item.id"
          :item="item"
          :data-node-index="`index-${index}`"
          :timelines="timelines"
          :options="options"
          :minTime="minTime"
        >
        </zgant-graphics-row>
        <div class="zgant-graphices-col-group">
          <div
            class="zgant-graphices-col"
            v-for="index of maxColum"
            :key="index"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ZgantGraphicsRow from "./zgantGraphicsRow";

const dateFormat = (date, fmt) => {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  if (/(Y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
  for (const k in o) if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
  return fmt;
};

export default {
  name: "zgantGraphics",
  components: { ZgantGraphicsRow },
  data() {
    return {
      hoverData: { data: null },
      calender: {
        top: [],
        bottom: {}
      },
      minTime: 0,
      maxTime: 0,
      maxColum: 0,
    }
  },
  props: {
    options: { type: Object },
    // eslint-disable-next-line vue/require-valid-default-prop
    dataList: { type: Array, default: [] },
    timelines: { type: Array },
    timeType: { type: Number, default: 2 },
  },
  created() {
    this.doInit();
  },
  methods: {
    doInit() {
      this.initGraphics();
      switch (this.timeType) {
        case 1:
          this.jasHours();
          break;
        case 2:
          this.jasDay();
          break;
        case 3:
          this.jasMonth();
          break;
        case 4:
          this.jasYear();
          break;
        default:
          this.jasDay();
      }
    },
    initGraphics() {
      this.minTime = 0;
      this.maxTime = 0;
      this.parsingData(this.dataList);
    },
    parsingData(d) {
      let _this = this;
      d.forEach(function (item) {
        _this.timelines.forEach(function (line) {
          let startDate = new Date(item[line.startKey]);
          let endDate = new Date(item[line.endKey]);
          if (startDate.getTime()) {
            if (_this.minTime === 0 || _this.minTime > startDate.getTime()) {
              _this.minTime = startDate.getTime();
            }
          }
          if (endDate.getTime()) {
            if (_this.maxTime === 0 || _this.maxTime < endDate.getTime()) {
              _this.maxTime = endDate.getTime();
            }
          }
        });

        if (item && item.children && item.children.length > 0) {
          _this.parsingData(item.children)
        }
      })
    },
    jasHours() {
      this.calender.top = [];
      this.calender.bottom = {};
      this.maxColum = 0;
      let minDate = new Date(this.minTime);
      minDate = new Date(dateFormat(minDate, 'YYYY-MM-DD HH:00:00'))
      minDate.setHours(minDate.getHours() - 1);
      this.minTime = minDate.getTime();
      let maxDate = new Date(this.maxTime);
      maxDate.setHours(maxDate.getHours() + 10);
      this.maxTime = maxDate.getTime();
      while (minDate.getTime() < maxDate.getTime()) {
        let m = dateFormat(minDate, "YYYY-MM-DD");
        if (this.calender.top.indexOf(m) === -1) {
          this.calender.top.push(m);
          this.calender.bottom[m] = [];
        }
        this.calender.bottom[m].push(minDate.getHours());
        this.maxColum += 1;
        minDate.setHours(minDate.getHours() + 1);
      }
    },
    jasDay() {
      this.calender.top = [];
      this.calender.bottom = {};
      this.maxColum = 0;
      let minDate = new Date(this.minTime);
      minDate = new Date(dateFormat(minDate, 'YYYY-MM-DD 00:00:00'));
      minDate.setDate(minDate.getDate() - 1);
      this.minTime = minDate.getTime();
      let maxDate = new Date(this.maxTime);
      maxDate.setDate(maxDate.getDate() + 10);
      this.maxTime = maxDate.getTime();
      while (minDate.getTime() < maxDate.getTime()) {
        let m = dateFormat(minDate, "YYYY-MM");
        if (this.calender.top.indexOf(m) === -1) {
          this.calender.top.push(m);
          this.calender.bottom[m] = [];
        }
        this.calender.bottom[m].push(minDate.getDate());
        this.maxColum += 1;
        minDate.setDate(minDate.getDate() + 1);
      }
    },
    jasMonth() {
      this.calender.top = [];
      this.calender.bottom = {};
      this.maxColum = 0;
      let minDate = new Date(this.minTime);
      minDate = new Date(dateFormat(minDate, 'YYYY-MM-01 00:00:00'));
      minDate.setMonth(minDate.getMonth() - 1);
      this.minTime = minDate.getTime();
      let maxDate = new Date(this.maxTime);
      maxDate.setMonth(maxDate.getMonth() + 10);
      this.maxTime = maxDate.getTime();
      while (minDate.getTime() < maxDate.getTime()) {
        let m = dateFormat(minDate, "YYYY");
        if (this.calender.top.indexOf(m) === -1) {
          this.calender.top.push(m);
          this.calender.bottom[m] = [];
        }
        this.calender.bottom[m].push(minDate.getMonth() + 1);
        this.maxColum += 1;
        minDate.setMonth(minDate.getMonth() + 1);
      }
    },
    jasYear() {
      this.calender.top = [];
      this.calender.bottom = {};
      this.maxColum = 0;
      let minDate = new Date(this.minTime);
      minDate = new Date(dateFormat(minDate, 'YYYY-01-01 00:00:00'));
      minDate.setFullYear(minDate.getFullYear() - 1);
      this.minTime = minDate.getTime();
      let maxDate = new Date(this.maxTime);
      maxDate.setFullYear(maxDate.getFullYear() + 10);
      this.maxTime = maxDate.getTime();
      while (minDate.getTime() < maxDate.getTime()) {
        let m = dateFormat(minDate, "YYYY");
        if (this.calender.top.indexOf(m) === -1) {
          this.calender.top.push(m);
          this.calender.bottom[m] = [];
        }
        this.calender.bottom[m].push(minDate.getFullYear());
        this.maxColum += 1;
        minDate.setFullYear(minDate.getFullYear() + 1);
      }
    },
    setBodyScroll(e) {
      e.target.onscroll = this.bodyScroll;
    },
    delBodyScroll(e) {
      e.target.onscroll = null;
    },
    setTitleScroll(e) {
      e.target.onscroll = this.titleScroll;
    },
    delTitleScroll(e) {
      e.target.onscroll = null;
    },
    bodyScroll(e) {
      this.$refs['zgant-g-title'].scrollLeft = e.target.scrollLeft;
      this.$emit('setTableBodyScrollTop', e.target.scrollTop);
    },
    titleScroll(e) {
      this.$refs['zgant-g-body'].scrollLeft = e.target.scrollLeft;
    },
    setGraphicesScrollTop(t) {
      this.$refs['zgant-g-body'].scrollTop = t;
    },
    hoverBoxMove(e) {
      let box = this.$refs.hoverbox;
      let body = this.$refs.gbody;
      let top = e.layerY;
      let left = e.layerX;
      // console.log(`top=${e.offsetX} && left=${e.offsetY}`)
      console.log(body[0]);

    },
    test() {
      console.log(this.$refs)
    }
  },
  watch: {
    timeType(n) {
      this.doInit();
    },
    options() {
      this.doInit();
    },
    dataList() {
      this.doInit();
    },
    timelines() {
      this.doInit();
    }
  }
}
</script>

<style lang="less" scoped>
  .zgant /deep/ {
    .zgant-graphices{
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      position: relative;
      .zgant-graphices-title{
        height: calc(10px + var(--zgant-row-height));
        border-bottom: 1px solid var(--zgant-border-color);
        background-color: var(--zgant-title-background-color);
        width: 100%;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        display: inline-block;
        .zgant-graphices-title-group{
          --group-size: 1;
          height: 100%;
          display: inline-block;
          width: calc(var(--group-size) * var(--zgant-row-height));;
        }
        .zgant-graphices-title-top{
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          height: 50%;
          width: 100%;
          border-right: 1px solid var(--zgant-border-color);
          border-bottom: 1px solid var(--zgant-border-color);
          text-align: center;
        }
        .zgant-graphices-title-bottom{
          height: 50%;
          white-space: nowrap;
        }
        .zgant-graphices-title-cell{
          border-right: 1px solid var(--zgant-border-color);
          width: var(--zgant-row-height);
          display: inline-block;
          text-align: center;
          height: 100%;
        }
      }
      .zgant-graphices-title::-webkit-scrollbar{
        height:0;
      }
      .zgant-graphices-body{
        position: absolute;
        top: calc(10px + var(--zgant-row-height));
        bottom: 0;
        width: 100%;
        overflow: auto;
        .zgant-graphices-timeline{
          --zgant-max-col: 0;
          min-width: 100%;
          position: relative;
          display: inline-block;
          height: auto;
          width: calc(var(--zgant-max-col) * var(--zgant-row-height));
          .zgant-graphices-col-group{
            display: inline-block;
            pointer-events: none;
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            white-space: nowrap;
          }
          .zgant-graphices-col{
            height: 100%;
            display: inline-block;
            width: var(--zgant-row-height);
            border-right: 1px solid var(--zgant-border-color);
          }
        }
      }

    }
    .zgant-graphices-hover-box{
      width: 100px;
      height: 100px;
      position: absolute;
      pointer-events: none;
      background-color: #999999;
      opacity: 0.5;
    }
  }
</style>
