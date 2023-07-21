<template>
  <div class="empty">
    <img src="../../../dataHome/safetyManagement/1.png" alt="">
  </div>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  name: "index",
  components: {},
})
export default class index extends Vue {
}
</script>
<style lang="less" scoped>
.empty{
  width:100%;
  height:100%;
  background:#fff;
  position: relative;
  img{
    position: absolute;
    top:0;
    left: 0;
    bottom:0;
    right: 0;
    margin:auto;
  }
}
</style>
