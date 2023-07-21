<template>
  <a-modal v-model="flag" @cancel="onCancel" title="" :footer="null">
    <a-carousel>
      <div v-for="(item,index) in imgSrc" :key="index" style="width:100%;height:600px">
        <img :src="item.url" style="width:100%;height:90%">
        <div style="text-align:center">{{ item.name }}</div>
      </div>
    </a-carousel>
  </a-modal>
</template>
<script lang="ts">
import {Component, Prop,Watch,Vue} from "vue-property-decorator";
import {Modal, Carousel} from "@h3/antd-vue"

@Component({
  name: "index",
  components: {
    AModal:Modal,
    ACarousel:Carousel
  },
})
export default class index extends Vue {
  @Prop({required:true})visible!:boolean;
  @Prop({required:true})imgSrc!:Array<any>;

  flag:boolean=false;
  @Watch('visible',{deep:true})
  visibleWatch(val){
    this.flag=val;
  }

  onCancel(e) {
    this.$emit("onCancel",false)
  }

}
</script>
<style lang="less" scoped>
/deep/.anticon{
  color:transparent;
}
/deep/.ant-carousel .slick-prev{
  background-color:red;
}
/deep/.ant-carousel .slick-dots li button{
  background-color:#666;
}
/deep/.ant-carousel .slick-dots li.slick-active button{
  background-color:#999;

}
/deep/.ant-modal-content{
  width:700px;
}
</style>
