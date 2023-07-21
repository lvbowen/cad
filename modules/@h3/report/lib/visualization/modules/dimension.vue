<template>
  <field-mapping
    v-if="module && module.display"
    :class="[prefixCls, comPrefixCls]"
    :comPrefixCls="comPrefixCls"
    :module="module"
    :schemas="getSchemas"
    :data="data"
    :extOptions="true"
    :tipLabelType="tipLabelType"
    @addField="handleDimension"
    @removeField="handleDimension"
    @changeField="handleDimension"
  >
  </field-mapping>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Select } from '@h3/antd-vue';
import FieldMapping from './field-mapping.vue';
@Component({
  name: 'h3-report-easy-dimension-module',
  components: {
    FieldMapping
  }
})
export default class ReportEasyDimensionModule extends Vue {
  prefixCls = 'h3-report-easy-dimension-module';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Dimension;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => ([]) }) data!: Array<H3.Report.FieldColumn>;
  tipLabelType:string = '';

  @Watch('chart.type', {deep: true})
  watchChartType(value) {
    value === 'table' ? this.tipLabelType = 'rowDimension' : this.tipLabelType = 'dimension';
  }

  get getSchemas() {
    return this.schemas.map((schema: any) => {
      let disabled = false;
      if (this.data.findIndex((field: H3.Report.FieldColumn) => field.field === schema.field && field.schemaCode === schema.schemaCode) >= 0) {
        disabled = true;
      }
      return Object.assign({ disabled }, JSON.parse(JSON.stringify(schema)));
    });
  }
  
  /**
   * 处理维度
   */
  handleDimension(data: Array<H3.Report.FieldColumn>) {
    if (this.module.change) {
      this.$emit('changeChartsModules', this.module.change({ dimension: data }));
    }
  }

  created () {
    this.chart.type === 'table' ? this.tipLabelType = 'rowDimension' : this.tipLabelType = 'dimension';
  }

}
</script>
<style lang="less">
</style>
