<template>
  <div :class="prefixCls">
    <!-- 左边 -->
    <div
      title="上一个"
      :class="`${prefixCls}__left`"
      @click="$emit('last')"
    >
      <i class="iconfont iconleft"></i>
    </div>
    <slot></slot>
    <!-- 右边 -->
    <div
      title="下一个"
      :class="`${prefixCls}__right`"
      @click="$emit('next')"
    >
      <i class="iconfont iconright"></i>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';

@Component({
  name: 'h3-analysis-swiper',
  components: {
  }
})

export default class Swiper extends Vue {
  prefixCls: string = 'h3-analysis-swiper';
}
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
