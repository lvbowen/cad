<template>
  <div :class="`${prefixCls}`">
    <a-select 
      v-show="formula === 'Equal'"
      :class="[`${prefixCls}-select`,agileValue === 'Custom'? `${prefixCls}-custom`:'']"
      :options = "selectList"
      :value= "agileValue"
      placeholder="自定义"
      @change="agileTimeChange"
    >
    </a-select>
    <a-date-picker
      v-if="agileValue === 'Custom'"
      :format = "dateFormat"
      :value = "dateValue"
      :dropdownClassName = "`${prefixCls}-picker`"
      :getCalendarContainer="getCurrentNode"
      :open= "isOpen"
      :showTime = "timeParams"
      @openChange = "handleOpenDateChange"
      @change="changeValue"
      :showToday= "false"
    >
      <template slot="renderExtraFooter">
        <a :class="`${comPrefixCls}__clear-btn`" @click="clearDate"> 清除 </a>
      </template>
    </a-date-picker>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch,Mixins } from 'vue-property-decorator';
import FilterMixins from '@h3/report/basics/mixins/filter-mixins';
import { Select, DatePicker } from '@h3/antd-vue';
import { dateFilterType,DateFilterType } from '@h3/report/basics/enum/filter-type';
import moment, { Moment } from 'moment';
@Component({
  name: 'h3-report-element-filter-single-date',
  components: {
    ADatePicker: DatePicker,
    ASelect: Select,
    ASelectOptGroup: Select.OptGroup,
    ASelectOption: Select.Option,
  }
})
export default class ReportElementFilterSingleDate extends Mixins<FilterMixins>(FilterMixins) {
    prefixCls = `${this.comPrefixCls}__date-wrap`;
    @Prop({ default: '' }) format!: string; // 格式
    @Prop() tiling!: boolean;  // 是否平铺
    selectList:Array<{value:string,label:string}> = dateFilterType;
    // 日期按钮是否能对日历做操作
    isOpenDate:boolean = false;
    // 日期的展示值 moment
    dateValue: Moment | Array<Moment | null> | null | any = null;
    // 自定义日期实际值-默认Today
    agileValue:string = '';
    
    /**
     *  监听值改变
     */
    @Watch('value', { immediate: true, deep: true })
    changeField(value: any) {
      if(value instanceof Array) {
        const tmpTimeValue: {label:string, value:string} | undefined = dateFilterType.find((item:any) => item.value === value[0]);
        if (tmpTimeValue) {
          this.agileValue = tmpTimeValue.value;
        } else {
          this.agileValue = 'Custom';
          if(value[0]){
            this.dateValue = this.showTimeFlag ? moment(value[0], 'YYYY-MM-DD HH:mm'): moment(value[0], 'YYYY-MM-DD');
          } else {
            this.dateValue = null;
          }
        }
      }
    }
    
   
    
    /**
     *  时间选择参数
     */
    get timeParams () {
      return this.format === "Time" ? {
        format: 'HH:mm',
        defaultValue: moment('00:00', 'HH:mm'),
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
      this.emitValue(null);
    }
    /**
     *  自定义日期改变
     * @param value
     */
    agileTimeChange(value:string) {
      this.agileValue = value;
      this.dateValue = null;
      let tmpValue: string = value !== DateFilterType.Custom ? value : this.dateValue;
      this.emitValue(tmpValue);
    }
   
}
</script>



