<template>
  <a-modal
    v-if="step === 6"
    okText="确定"
    cancelText="取消"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :mask="false"
    title="设置过滤条件"
    :wrapClassName="prefixCls"
    width="520px"
    :class="`${prefixCls}-body`"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div :class="[`${filterPrefixCls}`]">
      <div :class="[`${filterPrefixCls}__mask`]"></div>
      <div :class="[`${filterPrefixCls}__title`]">季度</div>
      <a-select defaultValue="jack" style="margin:8px 0; width: 100%">
        <a-select-option value="jack">
          等于
        </a-select-option>
      </a-select>
      <a-input value="第三季度"></a-input>
    </div>
  </a-modal>
</template>

<script lang='ts'>
import { Component, Prop, Provide, Vue, Watch, Inject } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Modal, Input, Tooltip, Icon, Select } from '@h3/antd-vue';
const ReportPro = namespace('report');

@Component({
  name: 'h3-yun-guide-step-4',
  components: {
    AModal:Modal,
    AInput:Input,
    AIcon:Icon,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class ReportStep extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  @Prop({ default: false })  visible!: boolean;
  @Prop({ default: 0 })  step!: number;
  @Inject({ default: () => {} }) setStep!: Function;

  prefixCls = 'h3-yun-guide-step-4';

  filterPrefixCls = 'h3-report-filter-modal';

  value: boolean = true;

  parent: Element | null = null;

  @Watch('step')
  onVisibleChange(val) {
    if (val === 6) {
      const res = document.getElementsByClassName('h3-report-guide');
      if (res && res[0]) {
        this.parent = res[0];
        this.parent.className += '  h3-report-introjs-parentIndex  '
      }
    }
  }

  handleOk() {
    if (this.parent) {
      this.parent.classList.remove("h3-report-introjs-parentIndex");
    }
    this.value = false;
    // 关闭第二步新手引导 弹出第一部弹窗 聚焦第三步
    this.setStep(7);
  }
  handleCancel() {}

  mounted() {
  }

  destroyed() {
  }
}
</script>
<style lang="less">
.h3-yun-guide-step-4{
  .ant-modal{
    z-index: 999999999 !important;
  }
}
</style>
