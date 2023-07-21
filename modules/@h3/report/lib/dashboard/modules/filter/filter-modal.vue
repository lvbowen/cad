<template>
  <a-modal
    okText="确定"
    cancelText="取消"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :maskClosable="false"
    :mask="mask"
    :wrapClassName="wrapClassName"
    title="设置过滤条件"
    @ok="filterModalHandleOk"
    @cancel="filterModalHandleCancel"
  >
    <div :class="[`${prefixCls}`]">
      <div v-if="!mask" :class="[`${prefixCls}__mask`]"></div>
      <div :class="[`${prefixCls}__title`]">{{ tmpFilter.field.name }}</div>
      <filter-input
        v-if="tmpFilter"
        :filter="tmpFilter"
        format="Time"
        @change-filter="changeFilter"
        :class="{[`${prefixCls}__check-empty`]:checkEmpty}"
      ></filter-input>
      <div v-if="checkEmpty" :class="[`${prefixCls}__text-error`]">值不能为空</div>
    </div>
  </a-modal>
</template>
<script lang='ts'>
import 'moment/locale/zh-cn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { message, Modal } from '@h3/antd-vue';
import FilterInput from '@h3/report/basics/components/filter';

  @Component({
    name: 'h3-report-filter-modal',
    components: {
      AModal: Modal,
      FilterInput
    }
  })
export default class ReportFilterSelect extends Vue {
    prefixCls = 'h3-report-filter-modal';
    @Prop({ default: false }) value!: boolean;
    @Prop({ default: true }) mask!: boolean; // 新手引导的时候关闭弹窗遮罩层，开启点击区域遮罩层
    @Prop({ default: '' }) wrapClassName!: '';
    @Prop({ default: {} }) filter!: H3.Report.FilterFieldColumn;
    // 当前弹窗的过滤条件
    tmpFilter: H3.Report.FilterFieldColumn = JSON.parse(JSON.stringify(this.filter));
    // 是否校验失败 true/false
    checkEmpty:boolean=false;
    /**
     *  初始化弹窗
     */
    initFilterModalData() {}
    changeFilter(filter: H3.Report.FilterFieldColumn) {
      this.checkEmpty = false;
      Object.assign(this.tmpFilter, filter);
    }
    /*
    * 点击过滤弹窗确定按钮，校验必填
    * */
    filterModalHandleOk() {
      this.checkEmpty = false;
      // 对各种类型做处理
      if (!(['None', 'NotNone'].includes(this.tmpFilter.formula))) {
        switch (this.tmpFilter.field.type) {
          case 'date':
          case 'string':
            this.checkEmpty = !this.tmpFilter.text[0];
            break;
          case 'number':
            if (this.tmpFilter.formula === 'Range') {
              if (!this.tmpFilter.text[0] || !this.tmpFilter.text[1]) {
                this.checkEmpty = true;
              } else {
                this.tmpFilter.text.sort((a, b) => Number(a) - Number(b));
                this.tmpFilter.text = this.tmpFilter.text.map(item => parseFloat(item).toString());
              }
            } else {
              if (this.tmpFilter.text[0]) this.$set(this.tmpFilter.text, 0, parseFloat(this.tmpFilter.text[0]).toString());
              this.checkEmpty = !this.tmpFilter.text[0];
            }
            break;
          default:
            break;
        }
        if (this.checkEmpty) {
          message.error('过滤条件不可为空');
          return;
        }
      }
      this.$emit('filter-data-sure', this.tmpFilter);
      this.$emit('input', false);
    }
    // 点击弹窗取消按钮
    filterModalHandleCancel() {
      this.$emit('filter-data-cancel', this.tmpFilter);
      // this.$emit('input', false);
    }
    created() {
      this.initFilterModalData();
    }
}
</script>
<style lang="less">
  .h3-report-filter-modal {
    position: relative;
    &__mask{
      position: absolute;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 99999999;
    }
    &__check-empty{
      .h3-report-filter-element__input-wrap-item{
        border: 1px solid #FF4384;
      }
      .h3-report-filter-element__date-wrap{
        .ant-calendar-picker-input{
          border: 1px solid #FF4384;
        }
      }
      .h3-report-filter-element__multi-input{
        .h3-report-multi-input{
          border: 1px solid #FF4384;
        }
      }
    }
    &__text-error{
      padding-top: 10px;
      color: #FF4384;
      font-size:12px;
    }
  }
</style>
