<template>
  <div style="overflow: auto; height: 900px">
    <a-card title="全景视图" class="box" style="width: 100%; height: 850px;">
      <!--      <span class="toprev" @click="toprev">-->
      <!--        <img :src="precImg" alt=""/>-->
      <!--      </span>-->
      <div class="panoramicSty">
        <template v-for="(value,index) in viewData">
          <div :key="index" class="containerSty">
            <template v-if="value=='ARRAY'">
              <img :src="arrayIcon" style="margin-top:5px"/>
            </template>
            <template v-if="value!=='ARRAY'&&index%2==0">
              <img :src="iconCircular" class="iconSty"/>
              <img :src="lineIcon" class="lineSty">
              <br style="clear: both">
              <div class="clickDownSty">
                <span>{{ value.shootingDate.slice(0, 10) }}</span>
                <br style="clear: both">
                <div class="titleDownSty">
                  <span>{{ value.panoramaTitle }}</span>
                </div>
                <img
                  :src="lineDown"
                  class="lineDownSty"
                  :key="index"/>
                <a-carousel autoplay class="carouselDown">
                  <template v-for="(imgValue,i) in value.panoramaCoverList">
                    <img
                      :key="i"
                      :src="bimURL+imgValue"
                      class="imgSty"
                      @click="clickView(value)"/>
                  </template>
                </a-carousel>
              </div>
            </template>
            <template v-if="value!=='ARRAY'&&index%2==1">
              <img :src="iconCircular"/>
              <img :src="lineIcon" class="lineSty">
              <br style="clear: both">
              <div class="clickUpSty">
                <span>{{ value.shootingDate.slice(0, 10) }}</span>
                <br style="clear: both"/>
                <div class="titleUpSty">
                  <span>{{ value.panoramaTitle }}</span>
                </div>
                <br style="clear: both"/>
                <img :src="lineUp" :key="index" class="lineUpSty"/>
                <a-carousel autoplay class="carouselUp">
                  <template v-for="(imgValue,i) in value.panoramaCoverList">

                    <img
                      :key="i"
                      :src="bimURL+imgValue"
                      class="imgSty"
                      @click="clickView(value)"/>
                  </template>
                </a-carousel>
              </div>
            </template>
          </div>
        </template>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import axios from "axios";
import * as Type from '../../type';
import * as Constant from '../../constant';
//@ts-ignore
import {
  Card, Steps, Carousel
} from "@h3/antd-vue";
import env from "@/config/env";
import precImg from '../../../src/assets/extends/icon/icon.png'
import iconCircular from '../../../src/assets/extends/panoramic/icon_circular.png'
import lineDown from '../../../src/assets/extends/panoramic/line1.png'
import lineUp from '../../../src/assets/extends/panoramic/line2.png'
import arrayIcon from '../../../src/assets/extends/panoramic/sjx.png'
import lineIcon from '../../../src/assets/extends/panoramic/line4.png'

@Component({
  name: "panoramicView",
  components: {
    ACard: Card,
    ASteps: Steps,
    AStep: Steps.Step,
    ACarousel: Carousel
  }
})
export default class panoramicView extends Vue {

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;

  precImg: any = precImg;
  iconCircular: any = iconCircular;
  lineDown: any = lineDown;
  lineUp: any = lineUp;
  arrayIcon: any = arrayIcon;
  lineIcon: any = lineIcon;

  current: number = 0;
  bimURL: string = `${env.apiHost}`;
  viewData: Array<any> = []

  mounted() {
    this.getData()
  }

  onChange(current) {
    console.log('onChange:', current);
    this.current = current;
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }

  clickView(value) {
    window.open(value.panoramaUrl)
  }

  getData() {
    axios
      .get(this.bimURL + '/api/panoramicManage/panoramic720', {
        params: {
          projectCode: this.projectCode,
          multiProjectFlag:this.projectConfig?.multiProjectFlag??false,
          projectName: this.projectConfig?.projectName??'',
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.viewData = res.data;
          if (this.viewData.length !== 0) {
            this.viewData.push('ARRAY')
          }
        }
      })
  }
}
</script>
<style lang="less" scoped>
.box {
  /deep/ .ant-table {
    height: 700px;
  }
}

.toprev {
  position: absolute;
  top: 15px;
  left: 0.1%;
  z-index: 999;
  cursor: pointer;
  font-size: 19px;
}

.ant-carousel {
  width: 201px;
  height: 111px;
  background: url("../../../src/assets/extends/panoramic/kuang.png");
  background-size: 100% 100%;

}

.panoramicSty {
  width: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  padding-left: 2%;

  .containerSty {
    min-width: 300px;
    height: 740px;
    padding-top: 300px;
    //display: flex;
    //align-items: center;
    float: left;

    .imgSty {
      height: 111px;
      width: 201px;
    }

    .lineSty {
      min-width: 260px;
      height: 1px;
      left: 0;
      padding: 0 10px;
    }

    .clickDownSty {
      margin: -60px 0 0  -15px;

      .titleDownSty {
        margin: 110px 0 0 70px;
      }

      .lineDownSty {
        margin: -95px 0 0 34px;
      }

      .carouselDown {
        margin: -50px 0 0 70px;
      }
    }


    .clickUpSty {
      margin-left: -15px;

      .titleUpSty {
        margin: -280px 0 0 70px;
      }

      .lineUpSty {
        margin: 35px 0 0 32px
      }

      .carouselUp {
        margin: -190px 0 0 67px;
      }
    }
  }
}
</style>

