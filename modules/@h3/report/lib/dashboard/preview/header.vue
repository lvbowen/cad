<template>
  <report-header :class="prefixCls">
    <!--<a-radio-group-->
    <!--:value="status"-->
    <!--buttonStyle="solid"-->
    <!--@change="change"-->
    <!--&gt;-->
    <!--<a-radio-button value="pc">电脑端</a-radio-button>-->
    <!--<a-radio-button value="mobile">移动端</a-radio-button>-->
    <!--</a-radio-group>-->
    <a
      :class="[, `${prefixCls}__close`]"
      @click="reportOutPreview"
    >
      <i class="h3yun_All close"></i>
    </a>
  </report-header>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Radio } from '@h3/antd-vue';
import ReportHeader from '../header/header.vue';
import ReportContainer from '../container';
@Component({
  name: 'h3-report-preview-header',
  components: {
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
    ReportHeader,
    ReportContainer
  }
})
export default class ReportPreviewHeader extends Vue {
  @Prop({ default: 'pc' }) status!: string;
  prefixCls = 'h3-report-preview-header';
  /**
   * 退出预览事件
   */
  reportOutPreview() {
    this.$emit('close');
  }
  /**
   * 修改预览类型
   * @param e
   */
  change(e: any) {
    this.$emit('change-type', e.target.value);
  }
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";
  .h3-report-preview-header{
    position: relative;
    display: flex;
    justify-content: center;
    &__close {
      position: absolute;
      right: 20px;
      top: 10px;
      color: @report-icon-gray-color;
    }
  }
</style>
