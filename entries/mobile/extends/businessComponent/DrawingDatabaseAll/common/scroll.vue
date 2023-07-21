<template>
  <div ref="scroll" class="r-scroll">
    <div class="r-scroll-wrap">
      <slot></slot>
    </div>
    <slot name="loading">
      <div v-show="isLoading" class="r-scroll-loading">
        <r-loading></r-loading>
        <span class="r-scroll-loading-text">{{ loadingText }}</span>
      </div>
    </slot>
    <slot name="complate">
      <div v-show="isComplate" class="r-scroll-loading">{{ complateText }}</div>
    </slot>
  </div>
</template>

<script>
import rLoading from './rLoading'
export default{
  components: {rLoading},
  props: {
    // 距离底部数值，小于或等于该数值触发自定义事件loadmore
    bottomDistance: {
      type: [Number, String],
      default: 70
    },
    // 加载中的文字
    loadingText: {
      type: String,
      default: '加载中...'
    },
    // 数据加载完成的文字
    complateText: {
      type: String,
      default: '-- 我是个有底线的列表 --'
    }
  },
  data () {
    return {
      // 用来判定数据是否加载完成
      isComplate: false,
      // 用来判定是否正在加载数据
      isLoading: false,
      // 组件容器
      scroll: null,
      // 正文容器
      scrollWrap: null
    }
  },
  watch: {
    // 监听isLoading，如果isLoading的值为true则代表触发了loadmore事件
    isLoading (val) {
      if (val) {
        this.$emit('loadmore')
      }
    }
  },
  methods: {
    // 初始化组件，获取组件容器、正文容器节点，并给组件容器节点绑定滚动事件
    init () {
      this.scroll = this.$refs.scroll
      this.scrollWrap = this.scroll.childNodes[0]
      this.scroll.addEventListener('scroll', this.scrollEvent)
      this.$emit('init', this.scroll)
    },
    scrollEvent (e) {
      // 如果数据全部加载完成了，则再也不触发loadmore事件
      if (this.isComplate) return
      let scrollTop = this.scroll.scrollTop
      let scrollH = this.scroll.offsetHeight
      let scrollWrapH = this.scrollWrap.offsetHeight
      // 组件容器滚的距离 + 组件容器本身距离大于或者等于正文容器高度 - 指定数值 则触发loadmore事件
      if (scrollTop + scrollH >= scrollWrapH - this.bottomDistance) {
        this.isLoading = true
      }
    },
    // 当前数据加载完成后调用该函数
    loaded () {
      this.isLoading = false
    },
    // 所有数据加载完成后调用该函数
    compleate () {
      this.isLoading = false
      this.isComplate = true
      this.scroll.removeEventListener('scroll', this.scrollEvent)
    }
  },
  mounted () {
    this.$nextTick(this.init)
  }
}
</script>

<style lang="less">
.one-screen {
  position: relative;
  left:0;
  width:100%;
  height: calc(100% - 27vw);
  //height: 20%;
  overflow: hidden;
}
.overflow-scroll {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}

.r-scroll{
  .one-screen;
  .overflow-scroll;
  &-loading{
    text-align: center;
    padding-top: 3vw;
    padding-bottom: 3vw;
    font-size: 14px;
    color: #656565;
    line-height: 20px;
    &-text{
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>
