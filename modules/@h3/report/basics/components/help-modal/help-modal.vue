<template>
  <a-modal
    okText="确定"
    cancelText="取消"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :maskClosable="false"
    :title="title"
    :wrapClassName="prefixCls"
    width="800px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div :class="`${prefixCls}__head`" v-if="options.length > 1">
      <a-radio-group
        buttonStyle="solid"
        v-model="activeIndex"
      >
        <a-radio-button
          v-for="(item, index) in options"
          :key="item.value"
          :value="index"
          @click="onChangeRadio(index)"
        > {{ item.label }} </a-radio-button>
      </a-radio-group>
    </div>
    <div
      v-if="options.length > 0"
      :class="[`${prefixCls}__content`, options.length > 1 ? `${prefixCls}__content--multi` : '']"
      v-html="options[activeIndex].contentHtml"
    >
      <!-- <slot></slot> -->
    </div>
    <div
      v-if="options.length > 1 && activeIndex !== 0"
      :class="`${prefixCls}__turn-left`"
      @click="changeStep(0)"
    >
      <i class="h3yun_All left-o"></i>
    </div>
    <div 
      v-if="options.length > 1 && activeIndex !== options.length - 1"
      :class="`${prefixCls}__turn-right`"
      @click="changeStep(1)"
    >
      <i class="h3yun_All right-o"></i>
    </div>
    
  </a-modal>
</template>

<script lang='ts'>
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { Modal, Radio } from '@h3/antd-vue'

@Component({
  name: 'h3-report-help-modal',
  components: {
    AModal: Modal,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group,
  }
})
export default class ReportEasyDetail extends Vue {
  prefixCls = 'h3-report-help-modal';

  @Prop({ default: () => false }) value!: boolean;
  @Prop({ default: () => '功能说明' }) title!: string;
  @Prop({ default: () => [{
    label: '第一个',
    value: 'key1',
    contentHtml: 'hhh'
  },{
    label: '第2个',
    value: 'key2',
    contentHtml: 'hhh'
  }] }) options!: Array<any>;

  activeIndex: number = 0;
  
  /**
   * 点击不同的选项
   */
  onChangeRadio(index) {
    this.activeIndex = index;
  }
  /**
   * 点击确认回调
   */
  handleOk() {
    this.$emit('ok');
    this.$emit('input', false);
  }
  /**
   * 取消回调
   */
  handleCancel() {
    this.$emit('cancel');
    this.$emit('input', false);
  }
  /**
   * 更改
   * @param state 更改步骤状态 0 为上一步 1为下一步
   */
  changeStep(state) {
    if (!state) {
      this.activeIndex -= 1; 
    } else {
      this.activeIndex += 1; 
    }
  }
}
</script>
<style lang="less">
.h3-report-help-modal{
  .ant-modal{
    height: 100%;
    padding: 50px 0;
    user-select:none;
    .ant-modal-content{
      height: 100%;
      overflow: hidden;
      .ant-modal-body{
        height: calc(100% - 108px);
        overflow: scroll;
        user-select:none;
      }
    }
  }
  &__head{
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__content{
    display: flex;
    align-items: center;
    justify-content: center;
    &--multi{
      margin-top: 40px;
    }
  }
  &__turn-left,&__turn-right{
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    width: 32px;
    transform: translateY(-50%);
    height: 32px;
    background: #C9CCD8;
    border-radius: 100%;
    &:hover{
      background: #8893A7;
      cursor: pointer;
    }
    .h3yun_All{
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
  }
  &__turn-right{
    right: 24px;
  }
}
</style>
