<template>
  <div class="device-info-summary">
    <div v-for="(item,index) in deviceInfoSummary" :key="index" class="flex flex-column">
      <h2>{{ item.year }}</h2>
      <div class="flex">
        <a-timeline mode="right" class="date-timeline">
          <a-timeline-item v-for="(d,dKey) in item.records" :key="dKey" position="left">
            <div>
              <div>{{ d.dateTime.substring(5,10) }}</div>
              <div class="time">{{ d.dateTime.substring(11,d.dateTime.length) }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
        <a-timeline class="record-timeline">
          <a-timeline-item
            v-for="(i,iKey) in item.records"
            :key="iKey"
            :class="iKey===heightLightIndex && currentIndex===index?'timeline-content':''"
            @mouseenter="mouseenterFn(iKey,index)"
            @mouseleave="mouseleaveFn">
            <div
              class="flex flex-space-between card">
              <span class="in-out">{{ i.schemaModelName }}</span>
              <div class="go">
                <a @click="toForm(i.url)">跳转查看</a>
                <img src="../../../src/assets/extends/next-active.png" v-if="iKey===heightLightIndex && currentIndex===index" @click="toForm(i.url)"/>
                <img src="../../../src/assets/extends/next-default.png" v-else @click="toForm(i.url)"/>
              </div>
            </div>
            <div class="state">
              <span>{{ i.userName }}</span>
              <span class="name">{{ i.name }}</span>
              <span>{{ i.deviceState }}</span>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop, Watch} from 'vue-property-decorator';
import {ProjectConfig, DeviceInfoSummaryInfo, UrlDetail} from "../../type";
import {getDeviceInfoSummaryById} from "../../service/deviceInfo";
import { exampleData } from "../engineeringArchives/mock";
import Timeline from 'ant-design-vue/lib/timeline';
import 'ant-design-vue/lib/timeline/style/index.css';
import Utils from '../../utils';
import Utils2 from "@/utils";
@Component({
  name: 'DeviceInfoSummary',
  components: {
    ATimeline: Timeline,
    ATimelineItem: Timeline.Item
  }
})
export default class DeviceInfoSummary extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig;
  @Prop() selectDeviceId!:string;
  deviceInfoSummary:DeviceInfoSummaryInfo[] = [];
  heightLightIndex: number | null = null;
  currentIndex:number |null = null;
  mouseenterFn(index: number,currentIndex: number) {
    this.heightLightIndex = index;
    this.currentIndex = currentIndex
  }

  mouseleaveFn() {
    this.heightLightIndex = null;
    this.currentIndex = null;
  }

  mounted() {
    this.getDeviceInfoSummaryById();
  }
  getDeviceInfoSummaryById() {
    // this.deviceInfoSummary = exampleData.response.data.deviceInfoSummary as DeviceInfoSummaryInfo[];
    // console.log(this.deviceInfoSummary,'11')
    getDeviceInfoSummaryById({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.deviceInfoSummary = res.data;
    })
  }
  toForm(url:string) {
    const urlDetail:UrlDetail = Utils2.parseQueryString(`?${url}`)
    urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
    const page = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      //@ts-ignore
      query: urlDetail
    })
    console.log(page.href,'href')
    this.isDingTalk?this.$router.push(page.route.fullPath):window.open(page.href, "_blank");

  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.device-info-summary {
  @date-width: 60px;
  @date-margin-right: 2 * @spacing-medium;
  h2 {
    margin: @spacing-base 0 @spacing-base @date-width+@date-margin-right;
  }
  .date-timeline {
    margin-right: @date-margin-right;
    /deep/ .ant-timeline-item-head,/deep/ .ant-timeline-item-tail {
      display: none;
    }
    /deep/ .ant-timeline-item-content {
      height: 61px;
      width: @date-width;
      font-weight: bold;
      //line-height: 61px;
    }
    /deep/ .ant-timeline-item {
      padding: 0;
    }
    .time {
      font-size: 12px;

    }
  }
  .timeline-content {
    background: rgba(41, 112, 255, 0.1) !important;
  }
  .record-timeline {
    .ant-timeline-item {
      padding: @spacing-base @spacing-base 0 0;
    }
    .flex-auto;
    .in-out {
      color: @base-color;
      font-weight: bold;
      font-size: 14px;
    }
    .go {
      img {
        margin-left: @spacing-base;
      }
    }
    .name {
      margin: 1/2 * @spacing-base @spacing-large;
    }
    /deep/ .ant-timeline-item-content {
      height: 53px;
      .state {
        width: 1000px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
