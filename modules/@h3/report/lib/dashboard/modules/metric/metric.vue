<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="bottomLeft"
        :class="[`${prefixCls}__icon`]"
        :arrowPointAtCenter="true"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span v-html="tipLabel"></span>
        </template>
        <i class="h3yun_All question-circle-o"></i>
      </a-tooltip>
    </div>
    <h3-fields
      :module="module"
      :data="data"
      :group="'metric'"
      @add-field="addMetric"
      @remove-field="removeField"
      @change-field="changeFields"
      @hide-cascader="hideCascader"
    >
      <div
        v-for="(field, i) in data"
        :class="{'h3-report-fields__field': true, 'report-field': true, 'remove-field': field.isRemove }"
        :key="i"
        :data-index="i"
        @click="field.isRemove ? null : clickField(field, i, $event)"
      >
        <i class="h3-report-icon down-o"></i>
        <span>{{ field.alias || field.name }}{{ fieldTypeMapping(field) }}</span>
        <i class="h3-report-icon h3-close" :data-index="i"></i>
      </div>
      <!-- 级联选择器 -->
      <h3-Cascader
        v-if="showCascader"
        :parentSource="data"
        :source="sourceName"
        :data="renameData"
        :domElement="domElement"
        :cascaderIndex="cascaderIndex"
        :chart="chart"
        @hide-cascader="hideCascader"
      >
      </h3-Cascader>
    </h3-fields>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch, Mixins } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Tooltip } from '@h3/antd-vue';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import H3Fields from '../fields';
import Cascader from '../cascader';
import enumType from '@h3/report/basics/enum/aggregate-type';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-metric-module',
  components: {
    H3Fields,
    H3Cascader: Cascader,
    ATooltip: Tooltip
  }
})
export default class ReportMetricModule extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => 'metric' }) sourceName!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Metric;
  @Prop({ default: () => ([]) }) data!: Array<H3.Report.FieldColumn>;
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: H3.Report.DataSource };
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  @ReportPro.Mutation(ReportMutation.DELETEMETRIC) deleteMetric!: Function;
  prefixCls = 'h3-report-metric-module';
  // 是否显示级联选择器
  showCascader = false;
  // 重命名 - 数据
  renameData = {};
  // domElement
  domElement: any = null;
  // 点击指标的index
  cascaderIndex: number = 0;
  // tipLabel
  tipLabel: string = '【指标】是要统计的数据，<br>会根据【维度】中设置的<br>分组方式进行汇总计算';

  @Watch('data', { immediate: true })
  watchData() {
    if (this.data && this.data.length) {
      this.data.forEach((field: H3.Report.FieldColumn) => {
        const dataSource = this.dataSources[this.chart.dataSourceId as any];
        if (dataSource) {
          const fieldIndex = dataSource.properties.findIndex((item: H3.Report.FieldColumn) => field.schemaCode === item.schemaCode && field.field === item.field);
          if (fieldIndex < 0) {
            field.isRemove = true;
          }else {
            field.isRemove = false;
          }
        } else {
          field.isRemove = true;
        }
      });
    }
  }

  /**
   * 字段类型映射
   * @param field
   */
  fieldTypeMapping(field: H3.Report.FieldColumn) {
    let typeMapping: string = '';
    // 指标 - 日期类型也需要添加（计数）label
    if (field.type === 'date') {
      enumType['string'].forEach((item) => {
        typeMapping = `（${item.label}）`;
      })
    } else {
      enumType[field.type].forEach((item) => {
        if (item.value === field.options.aggregateType) {
          typeMapping = `（${item.label}）`;
        }
      })
    }
    return typeMapping;
  }

  /**
   * 点击下拉事件
   * @param data
   * @param index
   */
  clickField(data: object, index: number, e: Event) {
    this.showCascader = true;
    this.renameData = data;
    (this.domElement as any) = e.currentTarget;
    this.cascaderIndex = index;
  }

  /**
   * 隐藏级联选择器
   */
  hideCascader() {
    this.showCascader = false;
  }

  /**
   * 删除
   * @param index
   */
  removeField(index: number) {
    // 隐藏级联选择器
    this.hideCascader();
    this.$nextTick(() => {
      // 删除指标触发方式
      this.deleteMetric(this.chart);
    });
  }

  /**
   * 新增指标
   * @param field
   * @param index
   */
  addMetric(field: H3.Report.FieldColumn, index: number) {
    switch (field.type) {
      case 'string':
      case 'date':
        field.options.aggregateType = 'COUNT';
        field.options.percent = 'DEFAULT';
        field.options.numberFormat = {
          comma: false,
          percent: false,
          fraction: false
        };
        break;
      case 'number':
        field.options.aggregateType = 'SUM';
        field.options.percent = 'DEFAULT';
        field.options.numberFormat = {
          comma: false,
          percent: false,
          fraction: false
        };
        break;
      default:
        break;
    }
  }

  changeFields() {
    if (this.module.change) {
      this.module.change({ metric: this.data });
    }
    this.$emit('change', this.data);
      this.resizeChartView({ chart: this.chart, type: 'data' });
  }

  getPopupContainer() {
    return this.$el;
  }
}
</script>
<style lang="less">
@import "../styles/index";
.h3-report-metric-module {
  &__header label{
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 0;
    color: #304265;
  }
  .h3-report-fields {
    &__field, &__field-dragging {
      background-color: @report-icon-green-color;
    }

    &__field-dragging {
      background-color: @report-icon-green-color !important;
    }
  }
}
</style>
