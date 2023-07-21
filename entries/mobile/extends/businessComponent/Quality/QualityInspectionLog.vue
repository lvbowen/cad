<template>
  <div class="logContainer">
    <apptitle :title="'验收日志'"></apptitle>
    <div class="content">
      <div
        v-for="(v,i) in dataArr"
        :key="i"
        class="cardContainer"
        @click="go2Summary(v)">
        <span>{{ v.checkDate }}</span>
        <span>合格率</span>
        <span>{{ v.rate }}</span>
        <span>%</span>
      </div>
    </div>
    <img
      :src="add"
      class="addPng"
      alt=""
      @click="addList()"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import apptitle from "../components/appTitle.vue";
import Add from '../../../src/assets/images/add.png';
import {Card} from '@h3/antd-vue';
import * as Api from "../../service/api";

@Component({
  name: 'QualityInspectionLog',
  components: {apptitle, ACard: Card}
})
export default class QualityInspectionLog extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;
  dataArr: Array<any> = [];
  add: HTMLImageElement = Add

  mounted() {
    this.getAllZlys();
  }

  getAllZlys() {
    Api.getAllZlys({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (!res.data) return;
      this.dataArr = res.data
    })
  }

  addList() {
    const urlDetail: any = {
      return: `/apps/apps-form-list/${this.projectCode}_zlys&iframeAction=add&projectName=${this.projectConfig?.projectName}&iframeAction=add`,
      schemaCode: `${this.projectCode}_zlys`,
      startWorkflowCode: `${this.projectCode}_zlys`,
      projectName: this.projectConfig?.projectName ?? ''
    };
    this.$router.push({
      // 业务表单
      name: "form-detail",
      query: urlDetail
    })
  }

  go2Summary(v) {
    this.$router.push({name: 'QualityInspectionDetails', query: v})
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.logContainer {
  display: flex;
  flex-direction: column;

  .content {
    overflow: auto;
    height: inherit;

    .cardContainer {
      height: 75px;
      display: flex;
      flex-direction: row;
      background-image: url("../../Img/safety/k1.png");
      background-size: 100% 100%;

      & > span:nth-child(1) {
        width: 55vw;
        .px2rem(padding-left, 50px);
        text-align: left;
        font-size: 20px;
        font-family: PingFang SC;
        color: #333333;
        line-height: 60px;
      }
      & > span:nth-child(2) {
        //.px2rem(width, 130px);
        width: 80px;
        font-size: 15px;
        color: #999999;;
        line-height: 60px;
      }
      & > span:nth-child(3) {
        //.px2rem(width, 80px);
        //width: 50px;
        font-weight: 800;
        font-size: 20px;
        color:#05BF28;
        line-height: 60px;
      }
      & > span:nth-child(4) {
        //.px2rem(width, 40px);
        font-weight: 800;
        font-size: 20px;
        color:#1F1D41;
        line-height: 60px;
      }
    }
    .redBack{
      background-image: url("../../Img/safety/k2.png");
      background-size: 100% 100%;
      & > span:nth-child(3) {
        .px2rem(width, 80px);
        font-weight: 800;
        font-size: 25px;
        color:#FE7654;
        line-height: 60px;
      }
    }
  }

  .addPng {
    .px2rem(width, 100px);
    .px2rem(height, 100px);
    //width: 80px;
    //height: 80px;
    position: fixed;
    .px2rem(bottom, 150px);
    .px2rem(right, @spacing-large);
  }
}
</style>
