<!-- 数据显示设置 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <a-checkbox
        :class="[`${prefixCls}__checkbox`]"
        :checked="data"
        @change="change"
      ></a-checkbox>
      <label class="label-value">显示数值</label>
    </div>
  </div>
</template>

<script lang=ts>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Checkbox } from '@h3/antd-vue';

@Component({
  name: 'h3-report-easy-data-label-module',
  components: {
    ACheckbox: Checkbox,
  }
})

export default class Home extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.DataLabel;
  @Prop({ default: false }) data!: boolean;
  prefixCls = 'h3-report-easy-data-label-module';

  /**
   * onchange事件
   * @param e
   */
  change (e) {
    this.$set(this.chart.styles, 'dataLabel', e.target.checked);
  }
}
</script>

<style lang='less'>
.h3-report-easy-data-label-module{
  &__body{
    display: flex;
    align-items: center;
    &__checkbox {
      margin-bottom: 2px;
    }
    label {
      font-weight: normal !important;
    }
    .label-value {
      margin-left: 8px;
    }
  }
}
</style>
