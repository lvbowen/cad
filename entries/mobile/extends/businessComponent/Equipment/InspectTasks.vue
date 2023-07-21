<template>
  <div class="inspect-tasks flex flex-column">
    <div class="header flex-center-align">
      <van-icon name="arrow-left" @click="$router.go(-1)"/>
      <div>巡检工单</div>
      <img @click="toForm('device_inspect_task')" :src="addIcon" alt="" />
    </div>
    <div class="tasks-content">
      <div
        v-for="(item,index) in inspectTasks"
        :key="index"
        class="task-card"
        @click="searchDeviceDetail(item.id,`${projectCode}_device_inspect_task`)">
        <div class="task-name">{{ item.name }}</div>
        <div class="flex flex-justify-between task-item">
          <div>工单状态：<span class="state" :style="{backgroundColor:item.color}">{{ item.status }}</span></div>
          <div>创建日期：{{ item.checkTime.substring(0,10) }}</div>
        </div>
        <div class="flex flex-justify-between task-item">
          <div>处理人：{{ item.checker }}</div>
          <div>管理设备：{{ item.deviceName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import { Icon } from 'vant';
import { getInspectTasks } from "../service/device";
import { ProjectConfig,DeviceInspectTasks } from "../../type";
import addIcon from "../../Img/Equipment/添加.png";
import {getFormUrl} from "../../../../portal/extends/service/api";
@Component({
  name: 'InspectTasks',
  components: {
    VanIcon: Icon
  }
})
export default class InspectTasks extends Vue {
  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  inspectTasks: DeviceInspectTasks[] = [];
  addIcon: any = addIcon;
  toForm(bizSchemaCode:string) {
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
  searchDeviceDetail(id: string,schemaCode:string) {
    getFormUrl({
      bizObjectId: id,
      schemaCode: schemaCode
    }).then((res)=> {
      //@ts-ignore
      this.$router.push(res)
    })
  }
  getInspectTasks() {
    getInspectTasks({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      id: this.$route.query.id as string
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.inspectTasks = res.data;
    })
  }
  mounted() {
    this.getInspectTasks();
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.inspect-tasks {
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
  .tasks-content {
    height: inherit;
    background-color: rgba(255,255,255,1);
    .px2rem(padding, @spacing-large);
    flex: 1;
    overflow: auto;
    .px2rem(padding, @spacing-large);
    .task-card {
      .px2rem(padding-left,@spacing-base);
      .px2rem(padding-right,@spacing-base);
      .px2rem(padding-top,@spacing-medium);
      .px2rem(padding-bottom,@spacing-medium);
      .px2rem(margin-bottom,@spacing-medium);
      .px2rem(border-radius,20);
      box-shadow: 0 10px 30px 0 rgba(153, 153, 153, 0.4);
      .px2rem(font-size,@font-size-base);
      .task-name {
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
      .task-item {
        .px2rem(padding-right,@spacing-large);
        >div:first-child {
          white-space: nowrap;
        }
        .state {
          .px2rem(border-radius,20);
          color: white;
          .px2rem(padding,5);
          .px2rem(padding-left,10);
          .px2rem(padding-right,10);
        }
      }
    }
  }
}
</style>
