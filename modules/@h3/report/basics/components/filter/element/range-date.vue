<template>
  <div :class="`${prefixCls}`">
    <a-range-picker
      :format = "dateFormat"
      :getCalendarContainer="getCurrentNode"
      :dropdownClassName = "`${prefixCls}-picker`"
      :showTime = "timeParams"
      :open= "isOpen"
      :value = "dateValue"
      @openChange = "handleOpenDateChange"
      @change="changeValue"
    >
      <template slot="renderExtraFooter">
        <a :class="`${comPrefixCls}__clear-btn`" @click="clearDate"> 清除 </a>
      </template>
    </a-range-picker>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch,Mixins } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import FilterMixins from '@h3/report/basics/mixins/filter-mixins';
import {  DatePicker } from '@h3/antd-vue';
import FilterTypes, { dateFilterType,DateFilterType, DateType, dateFilterTypeList } from '@h3/report/basics/enum/filter-type';
import moment, { Moment } from 'moment';
  @Component({
    name: 'h3-report-element-filter-range-date',
    components: {
      ARangePicker: DatePicker.RangePicker,
    }
  })
export default class ReportElementFilterDate extends Mixins<FilterMixins>(FilterMixins) {
    prefixCls = `${this.comPrefixCls}__date-wrap`;
    @Prop({ default: '' }) format!: string; // 格式
    @Prop() tiling!: boolean;  // 是否平铺
    // 日期按钮是否能对日历做操作
    isOpenDate:boolean = false;
    // 日期的展示值 moment
    dateValue: Moment | Array<Moment | null> | null | any = null;
    
    /**
     *  监听值改变
     */
    @Watch('value', { immediate: true, deep: true })
    changeField(value: any) {
      if(value instanceof Array) {
        if (this.formula === DateType.Range && (value[0] || value[1])) {
          this.dateValue = this.showTimeFlag ? [(value[0] ? moment(value[0], 'YYYY-MM-DD HH:mm') : null), (value[1] ? moment(value[1], 'YYYY-MM-DD HH:mm') : null)] : [(value[0] ? moment(value[0], 'YYYY-MM-DD') : null), (value[1] ? moment(value[1], 'YYYY-MM-DD') : null)];
        } else {
          this.dateValue = null;
        }
      }
    }
    /**
     *  时间选择参数
     */
    get timeParams () {
      return this.showTimeFlag ? {
        format: 'HH:mm',
        defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]
      } : false
    }
    
    
    /**
     *  组件是否打开
     */
    get isOpen() {
       return this.tiling ? true : this.isOpenDate;
    }
    /**
     *  弹窗组件当前挂载节点
     */
    getCurrentNode() {
      return this.tiling ? this.$el.parentNode : document.body;
    }
    
   get showTimeFlag() {
     return this.format === "Time"
   }
    /**
     *  日期格式
     */
    get dateFormat() {
       return this.showTimeFlag ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
    }
    /**
     *  处理日期展开关闭
     */
    handleOpenDateChange(open: boolean) {
      this.isOpenDate = open;
    }
    
    /**
     *  改变日期的值处理
     * @param date
     * @param dateString
     */
    changeValue(date: Moment, dateString: string) {
      this.dateValue = date;
      this.emitValue(dateString);
    }
    /* 
     * 清除时间 
     * */
    clearDate(){
      this.emitValue([]);
    }
}
</script>
<style lang="less">
</style>


