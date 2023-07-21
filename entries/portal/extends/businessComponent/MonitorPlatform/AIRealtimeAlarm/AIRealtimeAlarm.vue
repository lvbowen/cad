<template>
  <div class="alarm_container">
    <div class="alarm_title">
      <span>实时告警</span>
    </div>
    <div class="alarm_content">
      <a-popover title="详情图" trigger="click">
        <template slot="content">
          <img
            :src="signBigAvatar"
            alt=""
            style="width: 600px;height: 400px"/>
        </template>
        <a-tooltip>
          <template slot="title">
            点击查看大图
          </template>
          <img
            :src="realData.signAvatar"
            alt=""
            v-show="JSON.stringify(realData)!=='{}'"
            @click="getBigSignAvatar(realData.id)"
            class="alarm_small_pic"/></a-tooltip>
      </a-popover>
      <main v-show="JSON.stringify(realData)!=='{}'">
        <article class="alarm_detail">
          <span>聚集 : </span>
          <strong>{{ realData.gatherStatus === 1 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>闯入 : </span>
          <strong>{{ realData.tooling === 0 ? '未知' : realData.tooling === 2 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>人数 : </span>
          <strong>{{ realData.personCount }}</strong>
        </article>
        <article class="alarm_detail">
          <span>记录时间 : </span>
          <strong>{{ realData.realTime }}</strong>
        </article>
        <article class="alarm_detail">
          <span>打电话 : </span>
          <strong>{{ realData.calling === 0 ? '未知' : realData.calling === 1 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>安全帽 : </span>
          <strong>{{
            realData.safetyhat === 0 ? '未知' : realData.safetyhat === 1 ? '未带' : '已戴'
          }}</strong>
        </article>
        <article class="alarm_detail">
          <span>抽烟 : </span>
          <strong>{{ realData.smoking === 0 ? '未知' : realData.smoking === 1 ? '是' : '否' }}</strong>
        </article>
      </main>
    </div>
    <div class="alarm_title">
      <span>历史告警</span>
    </div>
    <div class="alarm_content" v-for="(v,i) in historyData" :key="i">
      <a-popover title="详情图" trigger="click">
        <template slot="content">
          <img
            :src="signBigAvatar"
            alt=""
            style="width: 600px;height: 400px"/>
        </template>
        <a-tooltip>
          <template slot="title">
            点击查看大图
          </template>
          <img
            :src="v.signAvatar"
            alt=""
            @click="getBigSignAvatar(v.id)"
            class="alarm_small_pic"/></a-tooltip>
      </a-popover>
      <main>
        <article class="alarm_detail">
          <span>聚集 : </span>
          <strong>{{ v.gatherStatus === 1 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>闯入 : </span>
          <strong>{{ v.tooling === 0 ? '未知' : v.tooling === 2 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>人数 : </span>
          <strong>{{ v.personCount }}</strong>
        </article>
        <article class="alarm_detail">
          <span>记录时间 : </span>
          <strong>{{ v.signTime }}</strong>
        </article>
        <article class="alarm_detail">
          <span>打电话 : </span>
          <strong>{{ v.calling === 0 ? '未知' : v.calling === 1 ? '是' : '否' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>安全帽 : </span>
          <strong>{{ v.safetyhat === 0 ? '未知' : v.safetyhat === 1 ? '未带' : '已戴' }}</strong>
        </article>
        <article class="alarm_detail">
          <span>抽烟 : </span>
          <strong>{{ v.smoking === 0 ? '未知' : v.smoking === 1 ? '是' : '否' }}</strong>
        </article>
      </main>
    </div>
    <div class="alarm_pagination" v-if="historyData.length !== 0">
      <a-pagination
        size="small"
        :hideOnSinglePage="true"
        :showLessItems="true"
        v-model="pagPage"
        :total="historyTotal"
        :pageSize="pagSize"
        @change="pagChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Component, InjectReactive, Prop} from "vue-property-decorator";
import {Socket} from '../../../service/webSocket';
import * as Api from "../../../service/api";
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';

@Component({
  name: "AIRealtimeAlarm",
  components: {APagination: Pagination, APopover: Popover,ATooltip:Tooltip}
})
export default class AIRealtimeAlarm extends Vue {
  @Prop() deviceSn!: string;
  @Prop() channelNo!: string;

  @InjectReactive("project") projectCode?: string;

  websocket: any = null;
  pagPage: number = 1;
  pagSize: number = 4;
  realData: any = {};
  historyData: Array<any> = [];
  historyTotal: number = 0;
  signBigAvatar: string = '';

  created() {
    this.websocket = new Socket({
      url: 'wss://standard.wisdombim.com.cn/api/websocket/'+this.projectCode+'/videoAi',
    });
    this.websocket.onmessage((data) => {
      if (typeof data === 'object' && data.deviceSn === this.deviceSn && JSON.stringify(this.realData) !== JSON.stringify(data)) {
        this.realData = data;
        this.realData.realTime = this.realData.signTime.date.year + '-' + this.realData.signTime.date.month + '-' +
          this.realData.signTime.date.day + ' ' + this.realData.signTime.time.hour + ':'
          + this.realData.signTime.time.minute + ':' + this.realData.signTime.time.second;
        this.pagPage = 1;
        this.videoGetAiHistory();
      }
    })
  }

  mounted() {
    this.videoGetAiHistory();
  }

  getBigSignAvatar(id) {
    this.signBigAvatar = '';
    Api.videoGetAiMessageById({appCode: this.projectCode ?? '', id: id as string}).then(res => {
      if (res.errcode === 0) {
        this.signBigAvatar = res.data?.['signBigAvatar'] as string ?? "";
      }
    })
  }

  pagChange(e) {
    this.pagPage = e;
    this.videoGetAiHistory();
  }

  videoGetAiHistory() {
    Api.videoGetAiHistory({
      appCode: this.projectCode ?? '',
      page: this.pagPage,
      size: this.pagSize,
      channelNo: this.channelNo,
      deviceSn: this.deviceSn,
    }).then(res => {
      console.log('videoGetAiHistory', res);
      if (res.errcode === 0) {
        this.historyData = res.data?.['records'] ?? [];
        this.historyTotal = res.data?.['total'] ?? 0;
      }
    })
  }

  beforeDestroy() {
    this.websocket.onclose(() => {
    });
    this.websocket = null;
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import '../../../styles/antd.less';

.alarm_container {
  height: calc(100% - 55px);
  width: 99%;
  margin: 45px 1% 0 0;
  background-color: rgb(32 36 49);
  .flex-column;

  .alarm_title {
    height: 50px;
    border-bottom: solid 1px grey;

    & > span {
      color: #fff;
      font-size: 16px;
      margin: 2px 15px;
      line-height: 50px;
    }
  }

  .alarm_content {
    .flex;
    flex-direction: row;
    padding: 10px;
    height: 120px;

    .alarm_small_pic {
      width: 60px;
      height: 80px;
      margin: 0 5px;
      border: transparent;
    }

    & > main {
      .flex-column;
      color: #fff;
      .flex-wrap;

      .alarm_detail {
        flex-direction: row;
        width: 100px;
        overflow: visible;
        white-space: nowrap;
      }

      //.flex-space-between;
    }
  }

  .alarm_pagination {
    text-align: center;
    .pagnition-transparent
  }
}
</style>
