<template>
  <div class="gennerl_title">
    <h4>{{ value }}</h4>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
@Component({
  name: "headerTitle",
  components: {},
})
export default class headerTitle extends Vue {
  @Prop() value!: string;
}
</script>
<style lang="less" scoped>
* {
  color: #fff;
  margin:0;
  padding:0
}
.gennerl_title{
  width: 16.9792vw;
  height: 1.4583vw;
  background:url("../AIAnalyse/img/title_bg.png") no-repeat ;
  background-size: 100% 100%;
  h4{
    font-size: 18px;
    font-family: Source Han Sans CN;
    color: #FFFFFF;
    line-height: 0.9896vw;
    padding-left: 1.7708vw;
  }
}

</style>
