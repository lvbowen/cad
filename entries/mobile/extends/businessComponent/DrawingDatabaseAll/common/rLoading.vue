<template>
  <div class="r-loading-container">
    <a-spin/>
  </div>
</template>
<script>
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css'
export default {
  components: {
    ASpin: Spin
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/index.less";
.r-loading-container{
  display: inline-block;
  vertical-align: middle;
  .px2rem(margin-right,12px);
}
</style>
