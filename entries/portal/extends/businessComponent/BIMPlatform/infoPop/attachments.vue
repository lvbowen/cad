<template>
  <div class="main full-width">
    <a-radio-group :value="buttonValue" @change="changeButton" class="radio_group full-width flex flex-space-between">
      <div v-for="(v,k) in attachData" :key="k" style="width:25%">
        <a-radio-button :value="k">{{ k }}</a-radio-button>
      </div>
    </a-radio-group>
    <div v-if="buttonValue==='图片'" class="carousel_cotainer">
      <a-carousel :afterChange="carouselChange" class="carousel" autoplay>
        <img
          :src="v.refId"
          v-for="(v,i) in attachData[buttonValue]"
          :key="i"
          class="imgOrVideo"/>
      </a-carousel>
    </div>
    <div v-if="buttonValue==='视频'" class="carousel_cotainer">
      <a-carousel :afterChange="carouselChange" class="carousel" autoplay>
        <video
          :src="v.refId"
          ref="streamElement"
          v-for="(v,i) in attachData[buttonValue]"
          :key="i"
          controls
          muted
          autoplay
          class="imgOrVideo"/>
      </a-carousel>
    </div>
    <div v-if="buttonValue==='文档'||buttonValue==='图纸'" class="other_cotainer">
      <div v-for="(v,i) in attachData[buttonValue]" :key="i" class="file flex-space-between">
        <a @click="openClick(v.fileExtension)">{{ v.name }}</a>
        <a-button
          style="float: right"
          type="primary"
          shape="circle"
          icon="download"
          size="small"
          @click="openClick(v.refId)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Radio, Carousel, Button} from "@h3/antd-vue";

@Component({
  name: "investmentProject",
  components: {
    ARadioGroup: Radio.Group,
    ARadioButton: Radio.Button,
    ACarousel: Carousel,
    AButton: Button
  }
})
export default class allProtect extends Vue {
  @Prop() attachData!: any;

  buttonValue: string = '';

  mounted() {
    if (Object.keys(this.attachData).length = 0) return;
    this.buttonValue = Object.keys(this.attachData)[0];
  }

  changeButton(a) {
    if(this.$refs.streamElement){
      //@ts-ignore
      for(let i=0; i<this.$refs.streamElement.length; i++){
        this.$refs.streamElement[i].src='';
      }
    }
    this.buttonValue = a.target.value;
  }

  carouselChange(a, b, c) {
    console.log(a, b, c);
  }

  openClick(v) {
    window.open(v);
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
.main {
  //width: 350px;
  height: 251px;
}

.radio_group {
  //width: 350px;
  //margin: 10px 0;
  padding: @spacing-base 0;

  .ant-radio-button-wrapper {
    //padding: 0 28.5px;
    .full-width;
    .text-center;
    color: #FFFFFF;
    background-color: transparent;
    //border: 0;
  }
  .ant-radio-button-wrapper-checked {
    //color: #2970ff;
    background: #2970ff;
    border-color: #2970ff;
}}

.carousel_cotainer {
  //width: 350px;
  height: 200px;

  .carousel {
    width: 100%;
    height: 100%;

    .imgOrVideo {
      width: 100%;
      height: 100%;
    }
  }
}

.other_cotainer {
  //width: 350px;
  height: 200px;
  overflow: auto;

  .file {
    width: 100%;
    margin-bottom: @spacing-base;
    //height: 25px;
  }
}
</style>
