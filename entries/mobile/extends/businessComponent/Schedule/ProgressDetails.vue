<template>
  <div class="progressDetails">
    <apptitle :title="'填报明细'"></apptitle>
    <div class="content">
      <div
        v-for="(v,i) in dataArr"
        :key="i"
        class="cardContainer"
        :class="v.cumulativeReportRatio<1 ? 'redBack' : ''"
        @click="toRecord(v)"
      >
        <div class="titleContainer">
          <span>{{ v.planDetailName }}</span>
          <span :style="{'color':v.cumulativeReportRatio<1?'#FE7654':''}">{{ (100 * v.cumulativeReportRatio).toFixed(0) }}</span>
          <span>%</span>
        </div>
        <a-divider dashed/>
        <div class="valueContainer">
          <div>
            <p>{{ v.planDetailMoney }}</p>
            <span>计划产值</span>
          </div>
          <a-divider dashed type="vertical"/>
          <div>
            <p>{{ v.reportDetailMoney }}</p>
            <span>完成产值</span>
          </div>
          <a-divider dashed type="vertical"/>
          <div>
            <p>{{ v.surplusMoney }}</p>
            <span>剩余产值</span>
          </div>
          <a-divider dashed type="vertical"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import apptitle from "../components/appTitle.vue";
import {Card, Divider} from '@h3/antd-vue';
import * as Api from "../../service/api";

@Component({
  name: 'ProgressDetails',
  components: {apptitle, ACard: Card, ADivider: Divider}
})
export default class ProgressDetails extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;

  dataArr: Array<any> = [];

  mounted() {
    this.getPageReport(this.$route.query);
  }

  getPageReport(v) {
    Api.getPageReport({
      projectCode: this.projectCode ?? '',
      pageNum: 1,
      pageSize: 9999,
      id: v.id
    }).then(res => {
      if (!res.data) return;
      this.dataArr = (res.data as any).records;
    })
  }

  //跳转填报记录
  toRecord(v) {
    this.$router.push({
      name: "ScheduleRecord",
      query: {
        id: v.id,
      },
    });
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.progressDetails {
  display: flex;
  flex-direction: column;

  .content {
    overflow: auto;
    height: inherit;

    .cardContainer {
      height: 170px;
      background-image: url("../../Img/safety/k3.png");
      background-size: 100% 100%;
      text-align: left;
      .px2rem(padding, @spacing-large);

      .titleContainer {
        display: flex;
        flex-direction: row;

        & > span:nth-child(1) {
          .px2rem(width, 500px);
          height: 34px;
          font-size: 22px;
          font-family: PingFang SC;
          font-weight: bold;
          color: #333333;
          line-height: 34px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        & > span:nth-child(2) {
          width: 50px;
          font-weight: 800;
          font-size: 22px;
          color: #05BF28;
          line-height: 34px;
          text-align: center;
        }

        & > span:nth-child(3) {
          font-weight: 800;
          font-size: 22px;
          color: #1F1D41;
          line-height: 34px;
          text-align: center;
        }
      }
    }

    .redBack {
      background-image: url("../../Img/safety/k4.png");
      background-size: 100% 100%;
    }

    .valueContainer {
      width: 100%;
      display: flex;
      flex-direction: row;
      margin-top: 3px;

      & > div {
        text-align: center;

        & > p {
          width: 30vw;
          //margin: 0;
          margin: 10px 0 0 0;
          font-size: 17px;
          font-family: PingFang SC;
          font-weight: 800;
          color: #1F1D41;
        }

        & > span {
          width: 30vw;
          font-size: 17px;
          font-family: PingFang SC;
          font-weight: bold;
          color: #9392A3;
        }
      }
    }
  }

  .ant-divider-horizontal {
    margin: 7px 0;
  }

  .ant-divider-vertical {
    margin: 0 0;
    top: 18px;
  }
}
</style>
