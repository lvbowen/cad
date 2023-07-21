<template>
  <div class="redirect-pc">
    请移步到PC端交建通处理！
  </div>
</template>

<script lang='ts'>
import { Vue,Component,Prop } from 'vue-property-decorator';
import {utils} from "@cloudpivot/common";
@Component({
  name: 'RedirectPc',
  components: {

  }
})
export default class RedirectPc extends Vue {
  mounted() {
    utils.Bus.$emit('toggleNavbar', false)
  }
}
</script>

<style lang='less' scoped>
.redirect-pc{
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-top: 16px;
}
</style>
