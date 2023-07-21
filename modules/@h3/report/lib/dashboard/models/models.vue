<template>
  <div :class="prefixCls">
    <!-- 添加数据源 -->
    <h3-loading v-if="loading"></h3-loading>
    <h3-data-source
      v-else
      :chart="activeChart"
      :data-source="getShowDataSource"
    ></h3-data-source>
    <div :class="[`${prefixCls}__header`]">
      <label>数据来源</label>
      <a v-if="!editDataSourceStatus && getShowDataSource" @click="changeDataSourceStatus">更改</a>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { Select, message } from "@h3/antd-vue";
import { H3Button } from "@h3/awesome-ui";
import H3Draggable from "vuedraggable";
import H3DataSource from "./data-source.vue";
import DataSourceModal from "./data-source-modal";
import confirm from "@h3/report/basics/components/confirm";
import { ReportMutation, ReportAction } from "@h3/report/basics/store/dashboard/types";
import Loading from "@h3/report/basics/components/loading";
import { CreateElement } from "vue";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-models",
  components: {
    ASelect: Select,
    H3Draggable,
    H3Button,
    H3DataSource,
    H3Loading: Loading
  }
})
export default class ReportModels extends Vue {
  @ReportPro.State("activeChart") activeChart!: H3.Report.Chart;
  @ReportPro.State("dataSources") dataSources!: { [dataSourceId: string]: any };
  @ReportPro.Action(ReportAction.GETDATASOURCE) getDataSource!: Function;
  @ReportPro.Action(ReportAction.GETDATASOURCELIST) getDataSources!: Function;
  @Inject() addDataSource!: Function;

  prefixCls = "h3-report-models";
  editDataSourceStatus = false; // 是否编辑源状态
  loading = false;
  getShowDataSource: any = null;
  @Watch("activeChart")
  async watchActiveChart() {
    this.editDataSourceStatus = false;
  }

  @Watch("activeChart.dataSourceId", { immediate: true })
  watchActiveChartDataSourceId() {
    if (this.activeChart.dataSourceId) {
      this.showLoading(true);
      (this.getDataSource(this.activeChart) as Promise).then(res => {
        if (this.activeChart.dataSourceId) {
          this.getShowDataSource = this.dataSources[this.activeChart.dataSourceId];
          this.showLoading(false);
        }
      });
    } else {
      this.getShowDataSource = null;
    }
  }

  /**
   * 改变源编辑状态
   * @param status
   */
  changeDataSourceStatus(status: boolean) {
    confirm({
      title: "数据源选择",
      store: this.$store,
      width: 386,
      wrapClassName: "h3-report-datasource-modal",
      content: (h: CreateElement) =>
        h(DataSourceModal, {
          props: {
            dataSource: {
              objectId: this.activeChart.dataSourceId,
              useType: this.activeChart.useType
            },
            activeChart: this.activeChart,
            addDataSource: this.addDataSource
          }
        }),
      ok: async (e: any) => {
        return await (e.contentVNode as any).check();
      }
    });
  }

  /**
   * 是否显示loading
   */
  showLoading(val) {
    this.loading = val;
  }

  /**
   * 图表改变数据源列表
   * @param dataSourceId
   */
  async getDataSourceList() {
    this.showLoading(true);
    const res = await this.getDataSources();
    if (!(res instanceof Array)) {
      this.editDataSourceStatus = false;
    }
    this.showLoading(false);
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-models {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  width: 200px;
  z-index: 2;
  position: relative;
  overflow: hidden;
  &__header {
    order: -1;
    display: flex;
    flex: 0 0 50px;
    height: 50px;
    padding: 0 12px;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    label {
      font-size: 14px;
      font-weight: 600;
    }
  }
  .scroll + &__header {
    box-shadow: 2px 2px 5px #e0e5f0;
  }
  &__empty-data-source {
    display: flex;
    flex-direction: column;
    flex: 1 1;
    align-items: center;
    justify-content: center;
    img {
      margin-bottom: 29px;
    }
    button {
      width: 136px;
    }
    label {
      color: @report-font-color-dark;
    }
  }
}
</style>
