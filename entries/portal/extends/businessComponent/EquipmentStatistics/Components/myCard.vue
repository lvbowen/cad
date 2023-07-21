<template>
  <div class="myCardContainer">
    <ul class="cardContent">
      <li class="cardItem line total clearfix">
        <span class="cardItemName">计数</span>
        <div class="cardItemValue totalValue"><span>{{ total }}</span></div>
      </li>
      <li
        v-for="(item,index) in dataSource"
        :key="index"
        class="cardItem clearfix"
        :class="[index%2===0?'evenRow':'oddRow']">
        <span class="cardItemName">{{ item.name }}</span>
        <div class="cardItemValue"><span class="circle">{{ item.value }}</span></div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';

  @Component
  export default class MyCard extends Vue {
    @Prop({required:true,type:String}) title!:string;
    @Prop({required:true}) dataSource!:{name:string,value:number}[];
    @Prop({required:true,type:Number}) total!:number;
  }
</script>

<style lang="less" scoped>
.myCardContainer{
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px 10px 10px 10px;
}
.cardContent{
  position: absolute;
  top: 20px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  overflow-y: auto;
}
.cardItem{
  height: 38px;
  line-height: 37px;
  margin-right: 5px;
  font-size: 12px;
  font-family: "Microsoft YaHei";
  color: #666;
  .cardItemName{
    float: left;
    padding-left: 10px;
  }
  .cardItemValue{
    float: right;
    padding-right: 30px;
    span{
      display: inline-block;
      height: 26px;
      width: 26px;
      line-height: 26px;
      text-align: center;
    }
  }
}
.line{
  border: 1px dotted #CCCCCC;
}
.total{
  font-size: 16px;
}
.totalValue{
  color: #29A1FC;
}
.evenRow{
  background-color: #F8F9FE;
}
.oddRow{
  background-color: #fff;
}
.circle{
  border-radius: 13px;
  background-color: #eaf5ff;
}
.clearfix:before, .clearfix:after {
  content:"";
  display:table;
}
.clearfix:after{
  clear:both;
  overflow:hidden;
}
.clearfix{
  *zoom:1;
}
</style>
