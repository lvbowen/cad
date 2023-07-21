<template>
  <div :class="prefixCls">
    <!-- 0维1指标 -->
    <div v-if="!options.dimension" :class="[`${prefixCls}__metric`]">
      <label :style="{color: options.fontColor}">
        {{ options.metric.alias || options.metric.name }}
      </label>
      <span :style="{color: `${options.fontColor} !important`}">
        {{ convertNumber(options.data[0][options.metric.uid], options.metric.options.numberFormat) }}
      </span>
    </div>
    <!-- 1维1指标 -->
    <div
      v-else
      :class="[`${prefixCls}__metric--list`]"
    >
      <div
        v-show="showTotal"
        :class="[`${prefixCls}__item`, `${prefixCls}__header`]"
      >
        <label :style="{color: options.fontColor}">总计</label>
        <span :style="{color: `${options.fontColor} !important`}">{{ convertNumber(options.metric.options.percent === 'PERCENT' ? 1 : summary, options.metric.options.numberFormat) }}</span>
      </div>
      <h3-scroll ref="scroll" :buttonColor="'rgba(0,0,0,0.45)'">
        <div
          v-for="(metric, i) in getMetricData"
          :class="[`${prefixCls}__item`]"
          :key="i"
        >
          <label :style="{color: options.fontColor}">{{ metric[options.dimension.uid] }}</label>
          <span :style="{color: options.fontColor}">{{ convertNumber(options.metric.options.percent === 'PERCENT' ? parseFloat(metric[options.metric.uid] / summary) : metric[options.metric.uid], options.metric.options.numberFormat) }}</span>
        </div>
      </h3-scroll>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import H3Scroll from '../../components/scroll';
import { convertNumber } from '../../utils/number';
import getAliaValue from '../../utils/alias';
@Component({
  name: 'h3-report-card',
  components: {
    H3Scroll
  }
})
export default class ReportCard extends Vue {
  @Prop({ default: () => ({}) }) options!: H3.Chart.Card;
  @Prop({ default: () => true }) refresh!: boolean;
  prefixCls = 'h3-report-card';
  summary: number = 0;
  innerSummary:any;
  showTotal: boolean = false;

  @Watch('options.limit')
  watchLimit() {
    // 总计在编辑状态也需要响应
    this.showTotal = this.options.limit === 0 || this.options.limit === null;
    this.$nextTick(() => {
      if (this.$refs.scroll) {
        (this.$refs.scroll as any).setScrollBar();
      }
    });
  }
  get getMetricData() {
     const data = this.options.limit ? this.options.data.slice(0, this.options.limit) : this.options.data;

     return data.map(d => {
       if (this.options.dimension && this.options.dimension.needAlias) {
         return Object.assign({}, d, {
           [this.options.dimension.uid]: getAliaValue(this.options.dimension.uid, d[this.options.dimension.uid], this.options.dataAlias)
         });
       }
       return d
     })
  }
  initCard() {
    // 判断总计是否显示
    if (this.options.limit === 0 || this.options.limit === null) {
      this.showTotal = true;
    }
    const metric = this.options.metric as H3.Report.FieldColumn;
    let summary = 0;
    this.options.data.forEach((item: any) => {
      if (item[metric.uid] === null || item[metric.uid] === undefined) return;
      switch (metric.options.aggregateType) {
        case 'SUM':
        case 'AVG':
          summary += parseFloat(item[metric.uid]);
          break;
        case 'MAX':
          summary = Math.max(summary, parseFloat(item[metric.uid]));
          break;
        case 'MIN':
          summary = Math.min(summary, parseFloat(item[metric.uid]));
          break;
        default:
          summary += parseFloat(item[metric.uid]);
          break;
      }
    });
    if (metric.options.aggregateType === 'AVG') {
      this.summary = parseFloat((summary / this.options.data.length) as any);
    } else {
      this.summary = summary;
    }
    this.$forceUpdate();
  }
  convertNumber(value: any, numberFormat: H3.Report.NumberFormat) {
    return numberFormat ? convertNumber(value, numberFormat) : value;
  }
  mounted() {
    this.initCard();
  }
}
</script>
<style lang="less">
.h3-report-card{
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  &__metric {
    display: inline-block;
    label{
      display: block;
      color: #304265;
      font-size:18px;
      margin-bottom: 0;
      font-weight: inherit;
    }
    span {
      font-size:56px;
      font-weight:400;
      color:rgba(16,127,255,1);
      line-height:78px;
    }
  }
  &__metric--list{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    .h3-scroll {
      flex: 1;
    }
  }
  &__header {
    flex: 0 0 48px;
    label {
      color: #107FFF;
    }
    span {
      color: #FFFFFF !important;
      background:rgba(16,127,255,0.8) !important;
    }
  }
  &__item {
    margin-left: 16px;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    border-bottom: 1px solid #EBEDF2;
    label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
    span {
      margin-left: 10px;
      height:24px;
      line-height: 24px;
      padding: 0 7px;
      color: #107FFF;
      background:rgba(16,127,255,0.1);
      border-radius:12px;
    }
  }
}
</style>
