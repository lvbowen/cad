<template>
  <div class="time-line-box">
    <a-timeline mode="alternate" v-if="dataArr.length">
      <a-timeline-item
        v-for="(i,index) in dataArr"
        :key="index"
        class="flex flex-column"
        :position="index%2?'left':'right'">
        <img slot="dot" src="../../../Img/icon_circular.png" class="img-node"/>
        <Row>
          <Col :span="23" :offset="1" >
          <div class="title">{{ i.panoramaTitle }} {{ i.shootingDate.split("T")[0] }}</div>
          <template v-if="i.panoramaCoverList && Array.isArray(i.panoramaCoverList) && i.panoramaCoverList.length">
            <Swipe :autoplay="10 * 1000">
              <SwipeItem v-for="(imgValue,key) in i.panoramaCoverList" :key="key">
                <img
                  :key="key"
                  :src="bimURL+imgValue"
                  class="imgSty"
                />
                <img class="circle" src="../../../Img/720_play.png" @click="clickView(i)"/>
              </SwipeItem>
            </Swipe>
          </template>
          </Col>
        </Row>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script lang="ts">
import { Vue,Component,Prop } from 'vue-property-decorator';
import { Swipe,SwipeItem,Row,Col} from "vant";
import env from "@/config/env";
import { Timeline } from '@h3/antd-vue'

@Component({
  name: 'time-line-box',
  components: {
    Swipe,
    SwipeItem,
    Row,
    Col,
    ATimeline:Timeline,
    ATimelineItem: Timeline.Item
  }
})
export default class TimeLineBox extends Vue{
  @Prop({default: []})
  dataArr: Array<any> | undefined;
  bimURL: string = `${env.apiHost}`;
  clickView(value) {
    window.open(value.panoramaUrl)
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.time-line-box {
  /deep/ .ant-timeline {
    line-height: 1.3 !important;
    .ant-timeline-item-tail {
      border-color: #bed8f6;
    }
    .ant-timeline-item-content {
      top: 0;
      .van-swipe__indicator--active {
        background-color: #5291ff;
      }
    }
    .img-node {
      .px2rem(width,50px);
      .px2rem(height,50px);
    }
  }
  .title {
    font-family: PingFang SC;
    color: #333333;
    .px2rem(font-size, 30px);
    .px2rem(margin-bottom,16px)
  }
  .imgSty {
    width: 100%;
    .px2rem(height,200px);
  }
  .circle{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 35px;
    height: 35px;
  }
}
</style>
