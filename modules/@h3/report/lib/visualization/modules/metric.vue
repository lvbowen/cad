<template>
  <field-mapping
    v-if="module && module.display"
    :class="[prefixCls, comPrefixCls]"
    :comPrefixCls="comPrefixCls"
    :module="module"
    :schemas="getSchemas"
    :data="data"
    :tipLabelType="'metric'"
    :aggregateOptions="true"
    @addField="addMetric"
    @changeField="changeMetric"
    @removeField="removeMetric"
  >
  </field-mapping>
</template>
<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Select } from '@h3/antd-vue';
import FieldMapping from './field-mapping.vue';
@Component({
  name: 'h3-report-easy-metric-module',
  components: {
    FieldMapping
  }
})
export default class ReportEasyMetricModule extends Vue {
  prefixCls = 'h3-report-easy-metric-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Metric;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => ([{}]) }) data!: Array<H3.Report.FieldColumn>;

  get getSchemas() {
    return this.schemas;
  }
  changeMetric(data: Array<H3.Report.FieldColumn>) {
    if (this.module.change) {
      this.$emit('changeChartsModules', this.module.change({ metric: data }));
    }
  }
  /**
   * 新增指标
   * @param data
   */
  addMetric(data: Array<H3.Report.FieldColumn>) {
    if (this.module.change) {
      this.$emit('changeChartsModules', this.module.change({ metric: data }));
    }
  }

  /**
   * 删除指标
   * @param data
   */
  removeMetric(data: Array<H3.Report.FieldColumn>) {
    if (this.module.change) {
      this.$emit('changeChartsModules', this.module.change({ metric: data }));
    }
  }
}
</script>
<style lang="less">
  .h3-report-easy-metric-module{
    &__field{
      display: flex;
    }
    &__select{
      flex: 1;
    }
    &__remove{
      flex: 0 0 30px;
      text-align: center;
      line-height: 32px;
    }
    &__field + &__field{
      margin-top: 8px;
    }
    &__add{
      i {
        margin-right: 5px;
      }
      margin-top: 12px;
      text-align: center;
    }
  }
</style>
