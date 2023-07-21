<template>
  <div class="logContainer">
    <apptitle :title="'巡检汇总'"></apptitle>
    <div class="content">
      <div
        v-for="(v,i) in dataArr"
        :key="i"
        class="cardContainer"
        @click="go2Detail(v)">
        <div class="areaContainer">
          <span>{{ v.area }}</span>
          <!--          <span :style="{'color':v.rate<100?'#FE7654':''}">{{ v.rate }}</span>-->
          <span>{{ v.rate }}</span>
          <!--          <span>%</span>-->
        </div>
        <span>巡检人 : </span>
        <span>{{ v.checkName }}</span>
        <span style="margin-left: 40vw">问题数量</span>

        <!--       <div class="problemContainer">-->
        <!--         <div>-->
        <!--           <p>{{ v.todayProblem }}</p>-->
        <!--           <span>今日问题</span>-->
        <!--          </div>-->
        <!--          <div>-->
        <!--            <p>{{ v.finishProblem }}</p>-->
        <!--            <span>已整改问题</span>-->
        <!--          </div>-->
        <!--          <div>-->
        <!--            <p>{{ v.unfinishProblem }}</p>-->
        <!--            <span>未整改问题</span>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import apptitle from "../components/appTitle.vue";
import {Card} from '@h3/antd-vue';
import * as Api from "../../service/api";

@Component({
  name: 'HiddenDangerSummary',
  components: {apptitle, ACard: Card}
})
export default class HiddenDangerSummary extends Vue {
  @InjectReactive('projectConfig') projectConfig;
  @InjectReactive('project') projectCode;
  dataArr: Array<any> = [];

  mounted() {
    this.getXcxjByDate(this.$route.query);
  }

  getXcxjByDate(v) {
    Api.getXcxjByDate({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      date: v.checkDate as string,
    }).then(res => {
      if (!res.data) return;
      this.dataArr = res.data
    })
  }

  go2Detail(v) {
    this.$router.push({name: 'HiddenDangerDetails', query: v})
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
      height: 110px;
      background-image: url("../../Img/safety/k3.png");
      background-size: 100% 100%;
      text-align: left;
      padding: 15px 25px;

      .areaContainer {
        display: flex;
        flex-direction: row;

        & > span:nth-child(1) {
          width: 75vw;
          height: 34px;
          font-size: 22px;
          font-family: PingFang SC;
          font-weight: bold;
          color: #333333;
          line-height: 34px;
        }

        & > span:nth-child(2) {
          //.px2rem(width, 80px);
          //width: 50px;
          font-weight: 800;
          font-size: 22px;
          color: #05BF28;
          line-height: 34px;
          text-align: center;
        }

        //& > span:nth-child(3) {
        //  //.px2rem(width, 40px);
        //  font-weight: 800;
        //  font-size: 22px;
        //  color: #1F1D41;
        //  line-height: 34px;
        //  text-align: center;
        //}
      }

      & > span {
        font-size: 15px;
        font-family: PingFang SC;
        font-weight: 400;
        color: #999999;
        line-height: 30px;
      }
    }

    .redBack {
      background-image: url("../../Img/safety/k4.png");
      background-size: 100% 100%;
    }

    .problemContainer {
      width: 100%;
      display: flex;
      flex-direction: row;
      margin-top: 3px;

      & > div {
        text-align: center;

        & > p {
          width: 30vw;
          margin: 0;
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
}
</style>
