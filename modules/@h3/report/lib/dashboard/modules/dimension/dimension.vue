<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
      <a-tooltip
        v-if="chart.type !== 'list'"
        placement="bottomLeft"
        :class="[`${prefixCls}__icon`]"
        :arrowPointAtCenter="true"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span v-html="tooltipLabel"></span>
        </template>
        <i class="h3yun_All question-circle-o"></i>
      </a-tooltip>
      <div
        v-if="module.batch"
        :class="`${prefixCls}__header-extra`"
        @click="batchAdd"
      >
        批量添加
      </div>

    </div>
    <h3-fields
      :module="module"
      :data="data"
      :isRepeat="false"
      :group="'dimension'"
      @add-field="addDimension"
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
        :source="'dimension'"
        :data="renameData"
        :domElement="domElement"
        :cascaderIndex="cascaderIndex"
        :chart= "chart"
        @hide-cascader="hideCascader"
      >
      </h3-Cascader>
    </h3-fields>

    <add-fields-modal
      v-if="module.batch && showAddFields"
      :show="showAddFields"
      :list="fieldsList"
      :value="data"
      :max="module.max"
      @update="updateDimension"
      @close="showAddFields= false"
    ></add-fields-modal>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Tooltip } from '@h3/antd-vue';
import H3Fields from '../fields';
import Cascader from '../cascader';
import enumType from '@h3/report/basics/enum/aggregate-type';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import AddFieldsModal from "../../models/batch-add-fields";

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-dimension-module',
  components: {
    H3Fields,
    H3Cascader: Cascader,
    ATooltip: Tooltip,
    AddFieldsModal
  }
})
export default class ReportDimensionModule extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Dimension;
  @Prop({ default: () => ([]) }) data!: Array<H3.Report.FieldColumn>;
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: H3.Report.DataSource };
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-dimension-module';
  // 是否显示级联选择器
  showCascader = false;
  // 重命名 - 数据
  renameData = {};
  // domElement
  domElement: any = null;
  // 点击维度的index
  cascaderIndex: number = 0;
  // tipLabel
  tipLabel: any = {
    dimension: '【维度】是对数据<br>做分类的依据',
    rowDimension: '【行维度】是对透视表<br>行数据做分类的依据',
  };

  // 是否显示批量添加字段
  showAddFields: boolean = false;
  
  // 字段列表
  get fieldsList() {
    let list = this.chart.dataSourceId ? this.dataSources[this.chart.dataSourceId].properties : [];
    return list.filter(field => field.visible && field.type !== 'other');
  }

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
   * 维度tooltip文案
   */
  get tooltipLabel() {
    if (this.chart.type === 'table') {
      return this.tipLabel.rowDimension;
    } else {
      return this.tipLabel.dimension;
    }
  }

  /**
   * 字段类型映射
   * @param field
   */
  fieldTypeMapping(field: H3.Report.FieldColumn) {
    let typeMapping: string = '';
    enumType[field.type].forEach((item) => {
      // 维度 - 日期才需要添加label
      if (item.value === field.options.format) {
        typeMapping = `（${item.label}）`;
      }
    });
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
   
  }

  addDimension(field: H3.Report.FieldColumn, index: number) {
    switch (field.type) {
      case 'date':
        field.options.format = this.chart.type === 'list' ? "YMDHMS" : 'Y';
        break;
      default:
        break;
    }
  }

  changeFields() {
    if (this.module.change) {
      this.module.change({ dimension: this.data });
    }
    this.resizeChartView({ chart: this.chart, type: 'data' });
  }

  getPopupContainer() {
    return this.$el;
  }

  /**
   * 批量添加
   */
  batchAdd() {
    // 打开弹窗
    this.showAddFields= true;
  }

  /**
   * 点击确定后
   */
  updateDimension(data) {
    data.forEach((element,index) => {
      this.addDimension(element, index);
    });
    this.data.splice(0, this.data.length, ...data);
    this.changeFields();
  }
}
</script>
<style lang="less">
  @import "../styles/index";
  .h3-report-dimension-module {
    &__header{
      &-extra{
        color: #107FFF;
        cursor: pointer;
        right: 16px;
        flex: 1;
        text-align: right;
      }
    }
  }
</style>
