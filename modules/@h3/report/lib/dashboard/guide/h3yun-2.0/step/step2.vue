<template>
  <a-modal
    v-if="visible"
    okText="确定"
    cancelText="取消"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :mask="false"
    title="数据源选择"
    :wrapClassName="prefixCls"
    width="482px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-input
      placeholder="搜索"
    >
      <a-icon slot="prefix" type="search"/>
    </a-input>
    <div class="h3-menu-tree">
      <div class="h3-menu-tree-item">
        <i class="h3yun_All folder-open-fill"></i>
        <div class="h3-menu-tree-item__word">示例应用</div> 
      </div>
      <div class="h3-menu-tree__list h3-menu-tree__list-open">
        <div class="h3-menu-tree">
          <div class="h3-menu-tree-item">
            <div class="h3-menu-tree-item__word">深圳奥力给营业报表</div> 
          </div>
        </div>
      </div>
    </div>
    
  </a-modal>
</template>

<script lang='ts'>
import { Component, Prop, Provide, Vue, Watch, Inject } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Modal, Input, Tooltip, Icon } from '@h3/antd-vue';
const ReportPro = namespace('report');

@Component({
  name: 'h3-yun-guide-step-2',
  components: {
    AModal:Modal,
    AInput:Input,
    AIcon:Icon,
  },
})
export default class ReportStep extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  @Prop({ default: false })  visible!: boolean;
  @Inject({ default: () => {} }) setStep!: Function;

  prefixCls = 'h3-yun-guide-step-2';

  value: boolean = true;

  parent: Element | null = null;

  @Watch('visible')
  onVisibleChange(val) {
    if (val) {
      const res = document.getElementsByClassName('h3-report-guide');
      if (res && res[0]) {
        this.parent = res[0];
        this.parent.className += '  h3-report-introjs-parentIndex  '
      }
    }
    this.value = val
  }


  handleOk() {
    if (this.parent) {
      this.parent.classList.remove("h3-report-introjs-parentIndex");
    }
    this.value = false;
    // 关闭第二步新手引导 弹出第一部弹窗 聚焦第三步
    this.setStep(3);
  }
  handleCancel() {}

  mounted() {
  }

  destroyed() {
  }
}
</script>
<style lang="less">
.h3-yun-guide-step-2{
  z-index: 10000000000;
  .ant-modal-body{
    height: 300px;
  }
  .ant-btn-primary{
    z-index: 999999999;
  }
  .h3-menu-tree-item:hover{
    background: none;
  }
}
</style>
