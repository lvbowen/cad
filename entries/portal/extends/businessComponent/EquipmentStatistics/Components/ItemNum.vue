<template>
  <div class="box">
    <div class="left" :style="{backgroundColor:valueColor}"></div>
    <div class="right">
      {{ title }}
      <span class="box-content">{{ value }}</span>
      个
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  name: "bigNum",
  components: {},
})
export default class bigNum extends Vue {
  @Prop ({required:true}) title!: string;
  @Prop ({required:true}) value!: number;
  @Prop ({required:false}) valueColor!: string;
}
</script>
<style lang="less" scoped>
.box{
  width: 100%;
  height: 100%;
  padding:0.521vw;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 4px;
  position: relative;
  .left{
    width: 1%;
    height: 100%;
    position:absolute;
    left: 0;
    top: 0;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .right{
    width: 99%;
    height: 100%;
    font-size: 18px;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #666666;
    padding:14px 10px;
    display:flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    .box-content{
      font-size: 46px;
      font-family: Arial;
      font-weight: 400;
      color: #000000;
      margin:0 10px;
    }
  }

}
</style>
