<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <h3-fields
      :module="module"
      :data="fields"
      :group="'filter'"
      @add-field="addField"
      @sort-field="sortFields"
      @remove-field="removeField"
    >
      <div
        v-for="(filter, index) in data"
        :class="{'h3-report-fields__field': true, 'report-field': true, 'remove-field': filter.field.isRemove }"
        :key="index"
        :data-index="index"
        @click="filter.field.isRemove ? null : updateFilterModal(filter,index)"
      >
        <i class="h3-report-icon down-o"></i>
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ filterFormula(filter) }}</span>
          </template>
          <span :class="[`{prefixCls}__field`]">{{ filterFormula(filter) }} </span>
        </a-tooltip>
        <i class="h3-report-icon h3-close" :data-index="index"></i>
      </div>
    </h3-fields>
    <filter-modal
      v-if = "showModal"
      v-model = "showModal"
      :filter = "activeFilter"
      @filter-data-sure = "handleSureFilter"
      @filter-data-cancel= "handleCancelFilter"
    >
    </filter-modal>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Modal, Tooltip } from '@h3/antd-vue';
import H3Fields from '../fields';
import FilterModal from './filter-modal.vue';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import FilterType, { dateFilterType, DateType, dateFilterTypeList } from '@h3/report/basics/enum/filter-type';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-screen-module',
  components: {
    H3Fields,
    FilterModal,
    AModal: Modal,
    ATooltip: Tooltip,
  }
})

export default class ReportScreenModule extends Vue {
  prefixCls = 'h3-report-screen-module';
  comPrefixCls = 'report-modules';
  @Prop({ default: () => ({}) }) modules!: H3.ReportModules.ChartModules;
  @Prop({ default: () => ({}) }) modulesData!: H3.Report.Global;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Filter;
  @Prop({ default: () => [] }) data!: Array<H3.Report.FilterFieldColumn>;
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: H3.Report.DataSource };
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  // 当前弹窗的过滤条件
  activeFilter!: H3.Report.FilterFieldColumn;
  // 过滤条件的索引
  activeIndex!: number;
  // 过滤弹窗显示/隐藏 true/false
  showModal:boolean = false;
  // 是否新增字段
  isAdd:boolean = false;

  @Watch('data', { immediate: true })
  watchData() {
    if (this.data && this.data.length) {
      this.data.forEach((filter: any) => {
        const dataSource = this.dataSources[this.chart.dataSourceId as any];
        if (dataSource) {
          const fieldIndex = dataSource.properties.findIndex((item: H3.Report.FieldColumn) => filter.field.schemaCode === item.schemaCode && filter.field.field === item.field);
          if (fieldIndex < 0) {
            filter.field.isRemove = true;
          }else {
            filter.field.isRemove = false;
          }
        } else {
          filter.field.isRemove = true;
        }
      });
    }
  }

  // 字段组件所需过滤字段集
  get fields() {
    return this.data.map(item => item.field);
  }
  filterFormula(filter: H3.Report.FilterFieldColumn) {
    let tmpFilterTxt:any;
    const formulaName = FilterType[filter.field.type].find((formula: any) => formula.value === filter.formula).label;
    if (filter.text[0] instanceof Object) {
      tmpFilterTxt = filter.text.map((txt:any) => txt.label);
    } else {
      tmpFilterTxt = filter.text.map((txt: string) =>(filter.field.type === 'date' ? (dateFilterTypeList[txt] ? dateFilterTypeList[txt] : txt) : txt));
    }
    const showFilterLabel = filter.formula === DateType.Range ? tmpFilterTxt.join('到') : tmpFilterTxt.join(',');
    return `${filter.field.name} ${formulaName} ${showFilterLabel}`;
  }
  /**
   * 过滤弹窗确定
   * @param filter 返回的过滤条件
   */
  handleSureFilter(filter:H3.Report.FilterFieldColumn) {
    if (this.isAdd) {
      this.data.splice(this.activeIndex, 0, filter);
    } else {
      this.$set(this.data, this.activeIndex, filter);
    }
    this.isAdd = false;
    this.resizeChartView({ chart: this.chart, type: 'data' });
    
  }
  // 取消设置过滤
  handleCancelFilter() {
    // 如果是新手引导 点击取消不关闭弹窗
    this.showModal = false;
    this.isAdd = false;
  }
  /**
   * 新增过滤字段
   * @param field  字段属性
   * @param index
   */
  addField(field:H3.Report.FieldColumn, index: number) {
    this.activeIndex = index;
    this.isAdd = true;
    this.activeFilter = {
      field,
      formula: 'Equal',
      text: field.type === 'date' ? ['Today'] : []
    };
    this.showModal = true;
  }

  /**
   * 展示过滤弹窗
   * @param filter  过滤条件
   * @param index   过滤字段
   */
  updateFilterModal(filter:H3.Report.FilterFieldColumn, index: number) {
    this.activeIndex = index;
    this.activeFilter = filter;
    this.showModal = true;
  }
  /**
   * 移除字段
   * @param index 索引
   */
  removeField(index: number) {
    this.$delete(this.data, index);
    this.resizeChartView({ chart: this.chart, type: 'data' });
  }

  /**
   * 字段改变
   * @param fields  字段集合
   */
  sortFields(fields:Array<H3.Report.FieldColumn>) {
    const tmpData: any = [];
    fields.forEach((item:H3.Report.FieldColumn) => {
      for (let i = 0; i < this.data.length; i++) {
        if (item.uid === this.data[i].field.uid) {
          tmpData.push(this.data[i]);
          break;
        }
      }
    });
    this.data.splice(0, this.data.length, ...tmpData);
  }
  mounted() {}
}
</script>
<style lang="less">
  @import "../styles/index";
  // .h3-report-modules-filter-model-intro {
  //   .ant-modal-content {
  //     z-index: 9999999 !important;
  //   }
  // }
  .h3-report-screen-module{
    &__btn {
      display: flex;
      align-items: center;
      i {
        transform: translate3d(0, 1px, 0);
        margin-right: 5px;
      }
    }
    .h3-report-fields {
      &__field, &__field-dragging {
        background-color: @report-icon-gray-color;
      }
      &__field-dragging {
        background-color: @report-icon-gray-color !important;
      }
    }
  }
</style>
