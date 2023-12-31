<template>
  <div class="form-track">
    <div class="header form-header">
      <workflow-track-actions
        :headerAction="headerAction"
        :workflowInstanceId="workflowInstanceId"
        :workItemId="workItemId"
        :currentActivityCode="currentActivityCode"
        :workflowState="workflowState"
        @edit="onEdit"
        @logs="onLogs"
        @loadData="loadData"
      ></workflow-track-actions>
    </div>
    <workflow-track-main
      activeKey="logs"
      :workflowInstanceId="workflowInstanceId"
      :loading="loading"
      :baseInfo="baseInfo"
      :chart="chart"
      :logs="logs"
    ></workflow-track-main>
  </div>
</template>

<script lang="ts">
// 初始化表单组件配置
import "@/config/h3-form";

import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import flow from "@cloudpivot/flow/pc";

import common from "@cloudpivot/common";

import { workflowApi, workflow } from "@cloudpivot/api";

@Component({
  name: "workflow-track",
  components: {
    WorkflowTrackMain: flow.components.WorkflowTrack,
    WorkflowTrackActions: flow.components.WorkflowTrackActions
  }
})
export default class WorkflowTrack extends Vue {
  @Prop({required:true}) workflowInstanceId!:string; // 流程实例Id
  @Prop({required:true}) workItemId!:string; // 流程Id

  baseInfo: workflow.InstanceBaseInfo = {}; // 流程跟踪基础信息

  chart: workflow.Chart = {}; // 流程图

  logs: workflow.WorkflowTrackLog[] = []; // 审批日志

  loading = true;

  /**
   * 获取头部控制
   */
  get headerAction() {
    return this.baseInfo.headerAction ? this.baseInfo.headerAction : [];
  }

  /**
   * 获取异常流程的异常节点，其下一个节点作为当前节点
   */
  get currentActivityCode() {
    const flowStatus: any = this.baseInfo.status;
    if (flowStatus !== "EXCEPTION") {
      return "";
    }
    if (this.chart && Array.isArray(this.chart.activityStatus)) {
      let targetActivityIdx;
      this.chart.activityStatus.some((act: any, idx: number) => {
        if (act.status === 2) {
          targetActivityIdx = idx + 1;
          return true;
        }
        return false;
      });
      if (targetActivityIdx) {
        let targetActivity = this.chart.activityStatus[targetActivityIdx];
        return targetActivity ? targetActivity.activityCode : "";
      }
    }
    return "";
  }

  /**
   * 流程装填
   */
  get workflowState() {
    if (this.baseInfo) {
      return this.baseInfo.status
    }
  }

  /**
   * 跳转日志
   */
  onLogs() {
    this.$router.push({
      name: "flowTrackOperationLogs",
      params: { workflowInstanceId: this.workflowInstanceId }
    }).catch((err: any) => {err});
  }

  /**
   * 编辑事件
   */
  onEdit() {
    this.$router.push({
      name: "form-detail",
      query: {
        workflowInstanceId: this.workflowInstanceId,
        workitemId: this.workItemId,
        edit: "true",
        return: this.$route.query.return
      }
    }).catch((err: any) => {err});
  }

  /**
   * 加载数据
   */
  loadData() {
    this.loading = true;
    const params: workflow.GetWorkflowTrackParams = {
      workflowInstanceId: this.workflowInstanceId
    };

    this.loadBaseInfo(params).then(() => this.loading = false);

    this.loadChart(params);

    this.loadLogs(params);

    // let res: any = {};
    // res = await workflowApi.getWorkflowBaseInfo(workflowInstanceId);
    // common.utils.compatible(res.data || {}, 'workflowName');
    // if (res.data && Array.isArray(res.data.participants)) {
    //   res.data.participants.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.baseInfo = res.data;
    // console.log('-----------', this.baseInfo);
    // res = await workflowApi.getWorkflowChart(workflowInstanceId);
    // if (res.data && Array.isArray(res.data.activities)) {
    //   res.data.activities.forEach((d:any) => {
    //     d = common.utils.compatible(d, 'activityName');
    //   });
    // }
    // this.chart = res.data;
    // res = await workflowApi.getWorkflowLogs(workflowInstanceId);
    // if (res.data && Array.isArray(res.data)) {
    //   res.data.forEach((d:any) => {
    //     common.utils.compatible(d, 'activityName');
    //     // 发起节点接收时间优化-不展示接收时间、耗时
    //     if (d.tokenId === 0) {
    //       d.receiveTime = '--';
    //       d.usedTime = 0;
    //     }
    //   });
    // }
    // this.logs = res.data;
  }

  async loadBaseInfo(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowBaseInfo(params);
    if (res.errcode === 0 && res.data) {
      common.utils.compatible(res.data || {}, "workflowName");
      if (Array.isArray(res.data.participants)) {
        res.data.participants.forEach((d: any) => {
          common.utils.compatible(d, "activityName");
          // 委托数据格式化
          if (Array.isArray(d.participantRelations)) {
            d.participantRelations = d.participantRelations.map((tru:any) => {
              const user = { ...tru.participantVO, workitemId: tru.workitemId, isTrust: tru.isTrust, trustorProcessor: tru.trustorVO };
              return user;
            });
          }
        });
      }
      this.baseInfo = res.data || {};
    }

  }

  async loadChart(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowChart(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data.activities)) {
        res.data.activities.forEach((d: any) => {
          d = common.utils.compatible(d, "activityName");
        });
      }
      this.chart = res.data || {};
    }
  }

  async loadLogs(params: workflow.GetWorkflowTrackParams) {
    const res = await workflowApi.getWorkflowLogs(params);
    if (res.errcode === 0 && res.data) {
      if (Array.isArray(res.data)) {
        res.data.forEach((d: any) => {
          common.utils.compatible(d, "activityName");
          // 发起节点接收时间优化-不展示接收时间、耗时
          if (d.tokenId === 0) {
            d.receiveTime = "--";
            d.usedTime = 0;
          }
        });
      }
      this.logs = res.data || [];
    }
  }

  /**
   * 初始化
   */
  created() {
    // this.workflowInstanceId = (this.$route.params as any).workflowInstanceId;
    // this.workItemId = (this.$route.params as any).workItemId;
    if (this.workItemId) {
      this.loadData();
    }
  }

  @Watch("workItemId")
  workItemIdChanged(newVal){
    this.loadData();
  }
}
</script>

<style lang="less" scoped>
.form-header {
  display: flex;
  justify-content: space-between;
}

.form-track {
  .main {
    display: flex;
    flex-direction: column;
    > .content {
      padding: 60px 0 100px;
      align-self: center;
      height: 2000px;
      width: @layout-min-width !important;
    }
  }
  &__tabs {
    margin-top: @base4-padding-sm;
  }
  .back {
    flex: 0 0 250px !important;
    &::before {
      display: none;
    }
  }
}
</style>
