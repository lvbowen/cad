<template>
  <div :class="[`${comPrefixCls}__tools`]">
    <div 
      :class="[`${comPrefixCls}__tools__group`]" 
      :key="index"
      v-for="(value, key, index) of list"
    >
      <div
        v-for="item in value"
        :key="item.type"
        @click="onClick(item)"
        :class="[`${comPrefixCls}__tools__group-item`]"
      >
        <i :class="`h3yun_All ${item.icon}`"></i>
        <span v-if="item.text" :class="[`${comPrefixCls}__tools__group-title`]">{{ item.text }}</span>
      </div>
    </div>

    <a-button
      type="primary"
      :class="[`${comPrefixCls}__tools__save`]"
      @click="save"
    >
      <i class="h3yun_All save-o"></i>
      保存
    </a-button>
  </div>
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import { CanvasAction } from '@h3/report/lib/data-source/enum/node'
import { Button } from '@h3/antd-vue'

@Component({
  name: 'h3-flow-tools',
  components: {
    AButton: Button,
  },
})
export default class H3FlowTools extends Vue {
  @Prop({
    default: 'h3-flow-designer'
  }) comPrefixCls!: string;

  step: Array<H3.Falls.DragNode> = [
    {
      text: '',
      icon: 'back',
      type: CanvasAction.UNDO,
    },
    {
      text: '',
      icon: 'Redo',
      type: CanvasAction.REDO,
    }
  ]
  processing: Array<H3.Falls.DragNode> = [
    {
      text: '等大小',
      icon: 'same-size',
      type: CanvasAction.SAMESIZE,
    },
  ]
  align: Array<H3.Falls.DragNode> = [
    {
      text: '水平对齐',
      icon: 'align-horizontal-cen',
      type: CanvasAction.HORIZONTAL,
    },
    {
      text: '垂直对齐',
      icon: 'align-vertical-cente',
      type: CanvasAction.VERTICAL,
    },
  ]
  justify: Array<H3.Falls.DragNode> = [
    {
      text: '水平等距',
      icon: 'same-high',
      type: CanvasAction.HORIZONTALALIGN,
    },
    {
      text: '垂直等距',
      icon: 'same-width',
      type: CanvasAction.VERTICALALIGN,
    }
  ]
  delete: Array<any> = [
    {
      text: '',
      icon: 'delete-o',
      type: CanvasAction.DELETE, 
    }
  ]

  list: any = {
    step: this.step,
    // processing: this.processing,
    align: this.align,
    justify: this.justify,
    delete: this.delete,
  }

  /**
   * 按钮点击事件
   */
  onClick(item) {
    this.$emit('toolAction', item);
  }

  /**
   * 保存
   */
  save() {
    this.$emit('save');
  }
}
</script>


