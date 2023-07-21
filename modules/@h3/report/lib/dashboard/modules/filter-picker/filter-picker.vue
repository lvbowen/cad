<template>
  <a-modal
    okText="确定"
    cancelText="取消"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :maskClosable="false"
    :title="title"
    width="900px"
    @ok="handleOk"
    @cancel="handleCancel"
    :wrapClassName = "prefixCls"
  >
    <ul :class="[`${prefixCls}__wrap`]">
      <li :class="[`${prefixCls}__item`]">
        <div :class="[`${prefixCls}__title`]">1.选择图表</div>
        <div v-if="notChart" :class="[`${prefixCls}__item-empty`]">
          <img :src="emptyImg" alt="图表为空">
          仪表盘没有图表，请配置图表
        </div>
        <div v-else :class="[`${prefixCls}__item-wrap`]">
          <h3-set-chart
            :chartIds="tmpFilterPicker.chartIds"
            @change-chart-ids="changeChartIds"
          >
          </h3-set-chart>
        </div>
      </li>
      <li :class="[`${prefixCls}__item`]">
        <div :class="[`${prefixCls}__title`]">2.设置筛选字段</div>
        <div :class="[`${prefixCls}__item-wrap`]">
          <h3-set-field
            v-if="tmpFilterPicker.dataSources.length > 0"
            :dataSourcesList="tmpFilterPicker.dataSources"
            @change-field="changeField"
            @change-field-type="changeFieldType"
          ></h3-set-field>
        </div>
      </li>
      <li :class="[`${prefixCls}__item`]">
        <div :class="[`${prefixCls}__title`]">3.设置筛选逻辑</div>
        <div :class="[`${prefixCls}__item-wrap`]">
          <h3-set-condition
            v-if="tmpFilterPicker.dataSources[0] && tmpFilterPicker.dataSources[0].field"
            :filterPicker = "tmpFilterPicker"
            @change-format="changeFormat"
            @change-title="changeTitle"
          >
            <filter-input
              v-if="filter.field"
              :filter="filter"
              :format ="tmpFilterPicker.format"
              @change-filter="changeFilterField"
            >
            </filter-input>
          </h3-set-condition>
        </div>
       
      </li>
    </ul>
  </a-modal>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Modal, message } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ElementType } from '@h3/report/basics/enum/chart-type';
import { ReportAction } from '@h3/report/basics/store/dashboard/types';
import H3Scroll from '@h3/report/basics/components/scroll';
import FilterInput from '@h3/report/basics/components/filter';
import H3SetChart from './set-chart.vue';
import H3SetCondition from './set-condition.vue';
import H3SetField from './set-field.vue';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-filter-picker',
  components: {
    AModal: Modal,
    H3Scroll,
    H3SetChart,
    H3SetCondition,
    H3SetField,
    FilterInput
  }
})
export default class FilterPicker extends Vue {
  @Prop({ default: () => false }) value!: boolean;
  @Prop({ default: () => {} }) filterPicker!: H3.Report.FilterPicker;
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: any};
  @ReportPro.State('charts') charts!: Array<H3.Report.Chart>;
  @ReportPro.Action(ReportAction.SETFILTERPICKER) setFilterPicker!: Function;
  @ReportPro.Action(ReportAction.REMOVEFILTERPICKER) removeFilterPicker!: Function;
  emptyImg  = require('@h3/report/basics/assets/pro/bg-filter.png');
  prefixCls:string = 'h3-report-filter-picker';
  // 当前筛选器选择数据类型
  activeType?:string;
  title:string = '筛选器设置';
  tmpFilterPicker: H3.Report.FilterPicker = JSON.parse(JSON.stringify(this.filterPicker));
  // 仪表盘是否存在图表
  get notChart() {
    return !this.charts.filter((item:H3.Report.Chart | H3.Report.FilterPicker | H3.Report.LongText) => !(item.type === ElementType.FILTERPICKER || item.type === ElementType.LONGTEXT)).length;
  }
  get filter() {
    return {
      field: (this.tmpFilterPicker.dataSources.length && this.tmpFilterPicker.dataSources[0].field) ? this.tmpFilterPicker.dataSources[0].field : this.tmpFilterPicker.field,
      formula: this.tmpFilterPicker.formula,
      text: this.tmpFilterPicker.text
    };
  }
  // 数据初始化
  initFilterPicker() {
    this.tmpFilterPicker.formula = this.tmpFilterPicker.formula ? this.tmpFilterPicker.formula : 'Equal';
    if (this.tmpFilterPicker.dataSources.length > 0 && this.tmpFilterPicker.dataSources[0].field) {
      this.activeType = this.tmpFilterPicker.dataSources[0].field.type;
    }
  }
  /**
   * 筛选条件或值 变更
   * @param filter 筛选字段
   */
  changeFilterField(filter:H3.Report.FilterFieldColumn) {
    this.tmpFilterPicker.text = filter.text;
    this.tmpFilterPicker.formula = filter.formula;
  }
  /**
   *  选择图表变化
   * @param chartIds Array<dataSourceId>
   */
  changeChartIds(chartIds:Array<string>) {
    const dataSourceIds: Set<string> = new Set();
    const fieldDataSourceIds: Set<string> = new Set(this.tmpFilterPicker.dataSources.map((item: H3.Report.FilterDataSource) => item.dataSourceId));
    let difSourceIds:any = '';
    const tmpDataSource = {
      dataSourceId: '',
      field: null
    };
    this.tmpFilterPicker.chartIds.splice(0, this.tmpFilterPicker.chartIds.length, ...chartIds);
    const curChart = this.tmpFilterPicker.chartIds.map((chartId: string) => this.charts.find((chart: H3.Report.Chart) => chart.uid === chartId));
    if (curChart) {
      curChart.forEach((item: H3.Report.Chart) => {
        if (item.dataSourceId) dataSourceIds.add(item.dataSourceId);
      });
    }
    if (dataSourceIds.size > fieldDataSourceIds.size) {
      difSourceIds = Array.from(dataSourceIds).find((item: string) => !fieldDataSourceIds.has(item));
      tmpDataSource.dataSourceId = difSourceIds;
      this.tmpFilterPicker.dataSources.push(tmpDataSource);
    } else if (dataSourceIds.size < fieldDataSourceIds.size) {
      difSourceIds = Array.from(fieldDataSourceIds).find((item: string) => !dataSourceIds.has(item));
      this.tmpFilterPicker.dataSources.splice(this.tmpFilterPicker.dataSources.findIndex(item => item.dataSourceId === difSourceIds), 1);
    }
  }
  /**
   *  获取需要移除的筛选条件
   */
  handleFilterPicker() {
    let chartIds: Array<string> = [];
    this.filterPicker.chartIds.forEach((id: string)=> {
       let tmpId = (this.tmpFilterPicker.chartIds.find((item: string) => id === item));
       if(!tmpId) {
         chartIds.push(id);
       }
     });
    let tmpFilterPicker = Object.assign({},this.filterPicker,{ chartIds });
    this.removeFilterPicker(tmpFilterPicker);
    this.setFilter(this.tmpFilterPicker);
  } 
  /**
   *  筛选字段改变
   * @param FilterDataSource  筛选数据源集
   */
  changeField(FilterDataSource:Array<H3.Report.FilterDataSource>) {
    if (FilterDataSource[0] && FilterDataSource[0].field) {
      this.tmpFilterPicker.field = FilterDataSource[0].field;
      this.tmpFilterPicker.title = FilterDataSource[0].field.name;
    }
    this.tmpFilterPicker.dataSources.splice(0, this.tmpFilterPicker.dataSources.length, ...FilterDataSource);
  }
  /**
   *  title改变
   * @param value  title
   */
  changeTitle(value:string) {
    this.$set(this.tmpFilterPicker, 'title', value);
  }
  /**
   *  筛选方式
   * @param value format
   */
  changeFormat(value:string) {
    this.$set(this.tmpFilterPicker, 'format', value);
  }
  /**
   *  改变筛选逻辑
   * @param value
   */
  changeFilterPicker(value: H3.Report.FilterPicker) {
    Object.assign(this.tmpFilterPicker, value);
  }
  /**
   *  改变数据类型
   * @param type string 数据类型
   */
  changeFieldType(type: string) {
    this.activeType = type;
    if (type === 'date') {
      this.tmpFilterPicker.text.splice(0, this.tmpFilterPicker.text.length, 'Today');
      this.tmpFilterPicker.formula = 'Equal';
      this.tmpFilterPicker.format = 'Date';
    } else {
      this.tmpFilterPicker.text.splice(0, this.tmpFilterPicker.text.length, '');
      this.tmpFilterPicker.formula = 'Equal';
      this.tmpFilterPicker.format = '';
    }
  }
  /**
   * 变更筛选器时做筛选
   */
  setFilter(filter: H3.Report.FilterPicker) {
    // 公式 为空不为空去筛选，范围时都有值去筛选，其他的公式都是有值去筛选
    if (['None', 'NotNone'].includes(filter.formula) || (filter.formula === 'Range' && filter.text[0] && filter.text[1]) || (filter.formula !== 'Range' && filter.text[0])) {
      this.setFilterPicker({ filterPicker: filter });
    } else {
      this.removeFilterPicker(filter);
    }
  }
  // 筛选器确认
  handleOk() {
    if (this.notChart) {
      message.error('仪表盘图表为空，请配置图表');
      return;
    }
    if (!this.tmpFilterPicker.dataSources.length) {
      message.error('请选择图表');
      return;
    }
    const hasAllField = this.tmpFilterPicker.dataSources.find(item => item.field === null);
    if (hasAllField) {
      message.error('每个数据源须选择一个字段');
      return;
    }
    // 对各种类型做处理
    switch (this.activeType) {
      case 'date':
        break;
      case 'string':
        this.tmpFilterPicker.format = '';
        break;
      case 'number':
        this.tmpFilterPicker.format = '';
        if (this.tmpFilterPicker.text[0]) {
          if (this.tmpFilterPicker.text[1]) {
            this.tmpFilterPicker.text.sort((a, b) => Number(a) - Number(b));
          }
          this.tmpFilterPicker.text = this.tmpFilterPicker.text.map((item:string) => parseFloat(item).toString());
        }
        break;
      default:
        break;
    }
    this.handleFilterPicker();    
    this.$emit('filter-sure', this.tmpFilterPicker);
    this.$emit('input', false);
  }
  handleCancel() {
    this.$emit('filter-cancel');
    this.$emit('input', false);
  }
  created() {
    this.initFilterPicker();
  }
  destroyed() {}
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-filter-picker {
    &__wrap{
      width: 100%;
      display: flex;
      margin: 0;
    }
    &__title{
      color:@report-font-color-base;
      font-size:14px;
      font-weight:600;
      line-height: 40px;
      border-bottom: 1px solid #EFEFEF;
      margin-right: 15px;
    }
    
    &__item{
      width: 33.3%;
      display: flex;
      flex-direction: column;
      &-empty{
        display: flex;
        flex-direction:column;
        align-items: center;
        padding-top: 43px;
        color: @report-font-color-dark;
        > img{
          height: 104px;
          width: 114px;
          padding-bottom: 10px;
        }
      }
      &-wrap{
        flex:1;
        padding-right: 14px;
        .vertical-scrollbar()
      }
    }
    &__item:not(:first-child){
      padding-left: 24px;
    }
    &__item:not(:last-child){
      border-right: 1px solid #EFEFEF;
    }
    .h3-report-filter-element {
      &__date-wrap-select {
        width: 100%;
        margin: 0 0 10px 0;
      }
      &__date-wrap{
        display: block;
        .ant-calendar-picker{
          width: 100% !important;
        }
      }
    }
    .ant-modal-content{
      max-height: 560px;
    }
    .ant-modal-body{
      display: flex;
      height: 452px;
      padding-right: 0;
    }
    .ant-modal-title {
      font-weight: 600;
    }
  }
</style>
