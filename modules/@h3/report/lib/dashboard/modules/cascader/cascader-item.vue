<!-- 级联选择器item -->
<template>
  <div
    v-if="treeNode.isShow"
    :class="prefixCls"
  >
    <span>{{ treeNode.displayName }}</span>
    <i class="h3yun_All right-o" v-if="treeNode.children.length"></i>
    <i class="h3yun_All check" v-if="treeNode.checked"></i>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator';

@Component({
  name: 'h3-report-cascader-item',
})

export default class CascaderItem extends Vue {
  @Prop({ default: () => ({}) }) treeNode!: any;
  prefixCls = 'h3-report-cascader-item';
}
</script>

<style lang='less'>
  .h3-report-cascader-item {
    display: block;
    position: relative;
    color: #000;
    height: 32px;
    line-height: 32px;
    padding: 0 30px 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      color: #000000;
      background: #F4F8FC;
      cursor: pointer;
    }
    i {
      display: inline-block;
      position: absolute;
      right: 10px;
      font-size: 12px;
      color: #C9CCD8;
    }
    .check {
      top: 0;
      color: #107FFF;
    }
  }
</style>
