<template>
  <div class="resource-container">
    <vue-drag-resize :isResizable="false">
      <div
        class="resource-container-detail"
        :class="this.resourceChoose.indexOf('video') !== -1?'video-container':''">
        <h4 v-if="this.resourceChoose.indexOf('video') !== -1">关联视频</h4>
        <h4 v-else>关联资源</h4>
        <div v-if="this.resourceChoose.indexOf('video') !== -1">
          <LivePlayer
            v-if="videoParam.videoUrl"
            class="live_player"
            :videoUrl="videoParam.videoUrl"
            autoplay
            live
            controls
            stretch
            :fluent="false"
            :showCustomButton="true"
            :hideSnapshotButton="true"
            :hideFluentButton="false"
          ></LivePlayer>
        </div>
        <div v-else class="media-container">
          <div><span>模型名称:</span>
            <p>{{ symbolName }}</p></div>
          <div><span>描述:</span><strong v-html="content"></strong></div>
          <div>
            <span>附件:</span>
            <div>
              <a-tooltip>
                <template slot="title">
                  点击下载,右键预览
                </template>
                <a
                  v-for="(v,i) in defaultFileList"
                  :key="i"
                  @click="dealFile(v,'download')"
                  @contextmenu.prevent="dealFile(v,'preview')">{{ v.name }}</a>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
      <p
        class="close-png"
        :class="this.resourceChoose.indexOf('video') !== -1?'close-video':''"
        @click="closePop">X</p>
    </vue-drag-resize>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import * as ModelInterface from "../../../service/modelInterface";
// import Input from "ant-design-vue/lib/input";
// import "ant-design-vue/lib/input/style/index.css";
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style/index.css";
import LivePlayer from '@liveqing/liveplayer';

@Component({
  name: "RelatedResources",
  components: {VueDragResize, ATooltip: Tooltip, LivePlayer},
})
export default class RelatedResources extends Vue {
  @InjectReactive('project') projectCode!: string;

  @Prop() private projectName!: string;
  @Prop() private relatedResources!: any;

  resourceChoose: string = 'resource_media';
  videoParam: { [propsName: string]: string | number | null } = {
    appKey: '',//设备账号
    deviceChannel: '',//通道号
    deviceSn: '',//序列号
    secret: '',//秘钥
    videoUrl: null,//视频链接
    videoType: 1,
    id: '',
    symbolId: '',
    symbolName: '',
    symbolType: 'video_monitor'
  };
  defaultFileList: Array<{ [propsName: string]: string }> = [];
  content: string = '';
  symbolName: string = '';

  mounted() {
    this.getSymbolListSelfMsg();
  }

  closePop() {
    this.$emit('closePop', 'relatedResources')
  }

  dealFile(v, name) {
    if (name === 'download') {
      window.open(v.downloadUrl)
    } else {
      window.open(v.onlineViewUrl)
    }
  }

  getSymbolListSelfMsg() {
    ModelInterface.getSymbolListSelfMsg({
      appCode: this.projectCode,
      symbolId: this.relatedResources.id
    }).then(res => {
      if (!res.data) return;
      if (res.data?.symbolType) {
        this.resourceChoose = res.data?.symbolType.indexOf('video') !== -1 ? 'resource_video' : 'resource_media';
      }
      if (this.resourceChoose === 'resource_video') {
        this.videoParam = {
          appKey: res.data?.appKey ?? '',//设备账号
          deviceChannel: res.data?.deviceChannel ?? '',//通道号
          deviceSn: res.data?.deviceSn ?? '',//序列号
          secret: res.data?.secret ?? '',//秘钥
          videoUrl: res.data?.videoUrl ?? '',//视频链接
          videoType: res.data?.videoType ?? 1,
          id: res.data?.id ?? this.relatedResources.id,
          symbolId: res.data?.symbolId ?? this.relatedResources.id,
          symbolName: res.data?.symbolName ?? this.relatedResources.sybolName,
          symbolType: 'video_monitor'
        };
      }
      this.symbolName = this.relatedResources.modelName ?? '';
      this.defaultFileList = res.data?.allAttachments?.file ?? [];
      this.content = res.data?.symbolDescribe ?? '';
      this.defaultFileList.forEach((item, i) => {
        this.defaultFileList[i].uid = item.fileId;
        this.defaultFileList[i].url = item.downloadUrl
        this.defaultFileList[i].status = 'done';
      })
    })
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';

* {
  color: #fff;
  box-sizing: border-box;
}

.resource-container {
  position: absolute;
  top: 150px;
  left: 586px;
  z-index: 99;

  .resource-container-detail {
    width: 410px;
    height: 330px;
    padding: 20px 40px;
    background: url("../../../../src/assets/extends/cim/bg_pop.png");
    background-size: 100% 100%;

    h4 {
      font-size: 18px;
      width: 49%;
      font-weight: 500;
      height: 35px;
      line-height: 35px;
      margin: 10px auto;
      text-align: center;
      color: #01ffff;
      background: url("../../../../src/assets/extends/cim/kuang_shuizhi_title.png");
      background-size: 100% 100%;
    }

    .media-container {
      .flex-column;

      & > div {
        .flex;
        font-size: 15px;
        margin-top: 10px;

        & > span {
          color: #c9d5d7;
          width: 80px;
        }

        & > strong {
          width: calc(100% - 80px);
          max-height: 100px;
          overflow-y: auto;
        }

        & > div {
          width: calc(100% - 80px);
          .flex-column;

          & > a {
            color: #0b8ef5;
            max-height: 60px;
            overflow-y: auto;
          }
        }
      }
    }
  }

  .video-container {
    width: 610px;
    height: 430px;
    padding: 20px 40px;
  }

  .vdr.active:before {
    display: none;
  }

  .close-png {
    position: absolute;
    top: 20px;
    right: -180px;
    cursor: pointer;
  }

  .close-video {
    position: absolute;
    top: 20px;
    right: -350px;
    cursor: pointer;
    font-size: 20px;
  }
}

.scrollbar-default;

</style>

