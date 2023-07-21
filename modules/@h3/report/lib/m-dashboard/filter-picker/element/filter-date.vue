<template>
  <div :class="`${prefixCls}`">
    <h3-radio-group
      v-if="showRadio"
      v-model="textValue"
      layout="vertical"
      @change="changeDateType"
    >
      <h3-radio
        class="custom-radio"
        :value="customType.value"
        :label="customType.label"
        :key="customType.value"
      >
        <div>{{ customType.label }}</div>
        <div class="date-input-wrap">
          <date-input
            v-model="dateValue"
            :placeholder="placeholderText"
            @click="showDate"
          >
            <i class="h3yun_All calendar-o icon"></i>
          </date-input>
        </div>
      </h3-radio>
      <h3-radio
        v-for="item in dateTypeList"
        :value="item.value"
        :label="item.label"
        :key="item.value"
      />
    </h3-radio-group>
    <date-input
      v-else
      v-model="dateValue"
      :placeholder="placeholderText"
      @click="showDate"
    >
      <i class="h3yun_All calendar-o icon"></i>
    </date-input>
    <h3-datetime-picker 
      v-model="dateVisible"
      :value="dateValue"
      :format="dateFormat"
      @select = "changeDate"
      maskClosable 
    />
  </div>
</template>
<script lang='ts'>
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import {Mutation, Action, State, namespace} from 'vuex-class';
  import { H3DatetimePicker,H3Radio } from '@h3/thinking-ui';
  import dateInput from './date-input.vue';
  import FilterTypes,{ dateFilterType,DateFilterType,DateType } from '@h3/report/basics/enum/filter-type';

  const ReportPro = namespace('report');
  @Component({
    name: 'h3-report-filter-date',
    components: {
      dateInput,
      H3DatetimePicker,
      H3Radio,
      H3RadioGroup: H3Radio.Group,
    }
  })
  export default class ReportFilterDate extends Vue {
    @Prop({default: () => []}) value!: Array<string | number | any>;
    @Prop({default: () => []}) field!: H3.Report.FieldColumn;
    @Prop({default: ''}) formula!: string;
    @Prop({default: ''}) format!: string;

    prefixCls = 'h3-report-filter-date';
    placeholderText: string = '选择时间';
    dateValue: string | null = null; // 日期格式的值
    textValue: string = ''; // 实际值
    dateVisible: boolean = false; // 是否显示日期组件

    @Watch('value', { immediate: true, deep: true })
    changeValue(value: Array<string | number | any>) {
      if(value.length) {
        const tmpValue: {label:string, value:string} | undefined = dateFilterType.find((item:any) => item.value === value[0]);
        if(!tmpValue) {
          this.dateValue = value[0];
          this.textValue = this.formula === DateType.Equal ? DateFilterType.Custom : value[0];
        } else {
          this.dateValue = null;
          this.textValue = value[0];
        }
      } else {
        this.dateValue = null;
        this.textValue = this.formula === DateType.Equal ? DateFilterType.Custom : '';
      }
    }
    
    /**
     * 展示自定义日期列表
     */
    get showRadio() {
      return this.formula === DateType.Equal;
    }
    /**
     * 自定义日期列表
     */
    get dateTypeList() {
      return dateFilterType.filter(item=> {
         return item.value !== DateFilterType.Custom;
      })
    }
    /**
     * 自定义日期
     */
    get customType() {
      return dateFilterType.find(item=> {
        return item.value === DateFilterType.Custom;
      })
    }
    /**
     * 日期组件格式
     */
    get dateFormat() {
      return this.format === 'Time' ? 'YYYY-MM-DD HH:mm':'YYYY-MM-DD'
    }
    /**
     * 选择日期
     * @param value 日期
     */
    changeDate(value: string) {
      this.dateValue = value;
      this.textValue = this.formula === DateType.Equal ? DateFilterType.Custom : value;
      this.$emit('input',value);
    }
    /**
     * 更改日期
     *  @param value 自定义日期
     */
    changeDateType(value: string) {
      this.textValue = value;
      let tmpValue = value === DateFilterType.Custom ? this.dateValue : value;
      this.$emit('input', tmpValue);
    }
    /**
     * 展示日期
     */
    showDate() {
      this.dateVisible = true;
    }
    created() {}
  }
</script>
<style lang="less">
  .h3-report-filter-date {
    padding: 16px;
     &__input{}
     &__content{}
    .date-input-wrap {
      padding-bottom: 12px;
    }
    .custom-radio{
      height: 88px;
       .h3think-radio__wrap {
         height: 50%;
         display: flex;
         align-self: normal;
      }
    }
  }
</style>
