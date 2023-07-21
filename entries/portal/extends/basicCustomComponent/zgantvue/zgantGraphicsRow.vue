<template>
  <div class="zgant-graphices-ul">
    <div
      :class="['zgant-graphices-row',`zgant-row-${dataNodeIndex}`]"
      @mouseover.stop="onMouseOver(dataNodeIndex)"
      @mouseleave.stop="onMouseLeave(dataNodeIndex)"
    >
      <div
        class="zgant-graphices-line"
        v-for="(lin,index) in timelines"
        :key="lin.id"
        :style="test(lin)"
      >
        <div class="zgant-graphices-line-img" :style="{backgroundColor: lin.color}">
        </div>
      </div>
    </div>
    <div
      class="zgant-graphices-ul"
      v-if="item&&item.children&&item.children.length>0"
      v-show="item.zgant_show_child===true"
    >
      <zgant-graphics-row
        v-for="(cItem,index) in item.children"
        :key="cItem.id"
        :item="cItem"
        :data-node-index="`${dataNodeIndex}__${index}`"
        :timelines="timelines"
        :options="options"
        :minTime="minTime"
      >
      </zgant-graphics-row>
    </div>
  </div>
</template>

<script>
const num = {
  1: 1000 * 60 * 60,
  2: 1000 * 60 * 60 * 24
};
export default {
  name: "zgantGraphicsRow",
  props: {
    options: {type: Object},
    item: {type: Object},
    minTime: {type: Number},
    dataNodeIndex: {},
    timelines: {
      type: Array,
      defeult: [{
        start: 'start',
        end: 'end',
        color: '#96aadd'
      }]
    }
  },
  methods: {
    onMouseOver(index) {
      let nodes = document.getElementsByClassName(`zgant-row-${index}`);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].style.backgroundColor = "#edffff"
      }
    },
    onMouseLeave(index) {
      let nodes = document.getElementsByClassName(`zgant-row-${index}`);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].style.backgroundColor = null;
      }
    },
    getTimeLineStyle(lin) {
      let style = {};
      let opWidth = parseInt(this.options.style.rowHeight);
      let one = num[this.options.timeType] / opWidth;
      let start = new Date(this.item[lin.startKey]);
      let end = new Date(this.item[lin.endKey]);

      let startTime = start.getTime() - this.minTime;
      let endTime = end.getTime() - start.getTime();

      style.height = (1 / this.timelines.length * 100) + '%';
      style.width = endTime ? endTime / one + 'px' : 0;
      style.left = startTime ? startTime / one + 'px' : 0;
      return style;
    },
    test(lin) {
      if (!lin) {
        return;
      }
      let style = {};
      let opWidth = parseInt(this.options.style.rowHeight);
      let gStart = new Date(this.minTime);
      let lStart = new Date(this.item[lin.startKey]);
      let lEnd = new Date(this.item[lin.endKey]);

      if (!lStart.getTime() || !lEnd.getTime()) {
        style.width = 0;
        style.left = 0;
        return style;
      }

      let left = 0;
      let width = 0;

      switch (this.options.timeType) {
        case 1:
          left = this.hourOrDayPx(this.minTime, lStart.getTime(), opWidth, 1);
          width = this.hourOrDayPx(lStart.getTime(), lEnd.getTime(), opWidth, 1);
          break;
        case 2:
          left = this.hourOrDayPx(this.minTime, lStart.getTime(), opWidth, 2);
          width = this.hourOrDayPx(lStart.getTime(), lEnd.getTime(), opWidth, 2);

          break;
        case 3:
          left = this.monthPx(gStart, lStart, opWidth);
          width = this.monthPx(lStart, lEnd, opWidth);
          break;
        case 4:
          left = this.yearPx(gStart, lStart, opWidth);
          width = this.yearPx(lStart, lEnd, opWidth);
          break;
        default:
          left = this.hourOrDayPx(this.minTime, lStart.getTime(), opWidth, 2);
          width = this.hourOrDayPx(lStart.getTime(), lEnd.getTime(), opWidth, 2);
      }
      style.height = (1 / this.timelines.length * 100) + '%';
      style.left = left ? `${left}px` : 0;
      style.width = width ? `${width}px` : 0;
      return style;
    },
    hourOrDayPx(s, e, o, t) {
      let glsc = e - s;
      let cone = glsc % num[t];
      let hs = (glsc - cone) / num[t];
      let px = (hs * o) + (cone / num[t]) * o;
      return px
    },
    monthPx(s, e, o) {
      let start = new Date(s);
      let end = new Date(e);

      let cm = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      start.setFullYear(e.getFullYear());
      start.setMonth(e.getMonth());
      let cms = end.getTime() - start.getTime();
      end.setDate(1);
      end.setHours(0);
      end.setMinutes(0);
      end.setSeconds(0);
      end.setMilliseconds(0);
      let monthStart = end.getTime();
      end.setMonth(end.getMonth() + 1);
      let monthEnd = end.getTime();
      let mcms = monthEnd - monthStart;
      let px = cm * o + (cms / mcms) * o;
      return px;
    },
    yearPx(s, e, o) {
      let start = new Date(s);
      let end = new Date(e);
      let cy = end.getFullYear() - start.getFullYear();
      start.setFullYear(end.getFullYear());
      let cms = end.getTime() - start.getTime();
      end.setMonth(1);
      end.setDate(1);
      end.setHours(0);
      end.setMinutes(0);
      end.setSeconds(0);
      end.setMilliseconds(0);
      let yearStart = end.getTime();
      end.setFullYear(end.getFullYear() + 1);
      let yearEnd = end.getTime();

      let ycms = yearEnd - yearStart;

      let px = cy * o + (cms / ycms) * o;
      return px;

    }
  }
}
</script>

<style lang="less" scoped>
.zgant /deep/ {
  .zgant-graphices-row {
    width: 100%;
    height: var(--zgant-row-height);
    border-bottom: 1px solid var(--zgant-border-color);
    position: relative;
  }

  .zgant-graphices-ul {
    min-width: 100%;
    z-index: 1000;
  }

  .zgant-graphices-line {
    position: relative;
    z-index: 1000;
    pointer-events: none;
  }

  .zgant-graphices-line-img {
    width: 100%;
    border-radius: 5px;
    margin: auto;
    height: 80%;
    display: inline-block;
  }
}
</style>
