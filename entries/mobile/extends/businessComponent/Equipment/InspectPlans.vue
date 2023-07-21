<template>
  <div class="Inspect-plans flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="arrow-left" @click="$router.go(-1)"/>
      <div>巡检计划</div>
      <img @click="addBizForm('device_inspect_plan')" :src="addIcon" alt="" />
    </div>
    <div class="plans-content">
      <div
        v-for="(item,index) in inspectPlans"
        :key="index"
        class="plan-card"
        @click="goInspectTasks(item.id)">
        <img class="type" :src="item.type.includes('周')? week: item.type.includes('月')? month: item.type.includes('年')? year: ''" alt="" />
        <div class="plan-name">{{ item.name }}</div>
        <div class="flex flex-justify-between plan-item">
          <div>待完成次数：{{ item.leftNum }}</div>
          <div>已完成次数：{{ item.completeNum }}</div>
        </div>
        <div class="flex plan-item">
          <div>巡检项：</div>
          <div>{{ item.inspectContent }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import { Icon } from 'vant';
import { getInspectPlans } from "../service/device";
import {ProjectConfig,DeviceInspectPlans} from "../../type";
import week from "../../Img/Equipment/zhou.png";
import month from "../../Img/Equipment/yue.png";
import year from "../../Img/Equipment/nian.png";
import addIcon from "../../Img/Equipment/添加.png";
@Component({
  name: 'InspectPlans',
  components: {
    VanIcon: Icon
  }
})
export default class InspectPlans extends Vue {
  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  week: any = week;
  month: any = month;
  year: any = year;
  addIcon: any = addIcon;
  inspectPlans: DeviceInspectPlans[] = [];
  getInspectPlans() {
    getInspectPlans({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.$route.query.id as string
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.inspectPlans = res.data;
    })
  }
  addBizForm(bizSchemaCode:string) {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_${bizSchemaCode}`,
        sheetCode: `${this.projectCode}_${bizSchemaCode}`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        fieldParam1: this.$route.query.id as string
      },
    });
    this.$router.push(routeData.route.fullPath);
  }
  goInspectTasks(id:string) {
    this.$router.push({
      name: 'InspectTasks',
      query: {
        id: id
      }
    })
  }
  mounted() {
    this.getInspectPlans()
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.Inspect-plans {
  height: inherit;
  text-align: left;
  overflow: hidden;
  .px2rem(font-size,@font-size-base);
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #004898;
    .px2rem(height, 88);
    >img {
      .px2rem(width,40);
      .px2rem(height,40);
    }
    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }
  .plans-content {
    height: inherit;
    background-color: rgba(255,255,255,1);
    .px2rem(padding, @spacing-large);
    flex: 1;
    overflow: auto;
    .plan-card {
      position: relative;
      .px2rem(padding-left,@spacing-base);
      .px2rem(padding-right,@spacing-base);
      .px2rem(padding-top,@spacing-medium);
      .px2rem(padding-bottom,@spacing-medium);
      .px2rem(margin-bottom,@spacing-medium);
      .px2rem(border-radius,20);
      box-shadow: 0 10px 30px 0 rgba(153, 153, 153, 0.4);
      .px2rem(font-size,@font-size-base);
      .plan-name {
        font-weight: bold;
        .px2rem(font-size,@font-size-medium);
        color: #000000b8;
      }
      >div {
        .px2rem(margin-bottom,@spacing-medium);
        color: #bfbfbf;
      }
      >div:last-child {
        .px2rem(margin-bottom,0)
      }
      .plan-item {
        .px2rem(padding-right,@spacing-large);
        >div:first-child {
          white-space: nowrap;
        }
      }
      .type {
        position: absolute;
        top: 0;
        .px2rem(width,50);
        .px2rem(right,20);
      }
    }
  }
}
</style>
