import { Vue, Component, Prop } from "vue-property-decorator";
import { Modal } from "@h3/antd-vue";
import Sort from "../modules/sort";
import SortList from "../modules/sort/sort-list.vue";
import { dashboardApi } from "@h3/report/basics/service/dashboard";
import exportExcel, { downloadFile } from "@h3/report/basics/utils/export";
import { namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/dashboard/types";
import options from "@h3/report/dist/options";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { ToolsBarType } from "@h3/report/basics/enum/element-tools";
import FullScreen from "../full-screen";
import { closest } from "@h3/report/basics/utils/dom";
const ReportPro = namespace("report");
const message = options.message;

@Component({
  name: "h3-dashboard-element-tools-event-mixins"
})
export default class DashboardElementToolsEventMixin extends Vue {
  @Prop({ default: null }) element!: H3.Report.BaseElement;
  @Prop({ default: -1 }) elementIndex!: number;
  @ReportPro.State("charts") charts!: Array<H3.Report.BaseElement>;
  @ReportPro.State("tableExportData") tableExportData!: Object;
  @ReportPro.Action(ReportAction.SETCHARTLINKAGE) setChartLinkage!: Function;
  @ReportPro.Action(ReportAction.REMOVEFILTERPICKER) removeFilterPicker!: Function;
  @ReportPro.Mutation(ReportMutation.CLEARACTIVECHART) clearActiveChart!: Function;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  @ReportPro.Mutation(ReportMutation.CLEARCHARTRELATION) clearChartRelation!: Function;

  toolsEvent: { [key: string]: Function } = {};

  sortData: any[] = [];

  /**
   * 全屏
   */
  [ToolsBarType.FULLSCREEN]() {
    this.$emit("full-screen", {
      element: this.element,
      elementIndex: this.elementIndex,
      status: true
    });
  }
  /**
   * 取消全屏
   */
  [ToolsBarType.NARROW]() {
    this.$emit("narrow", { element: this.element, elementIndex: this.elementIndex, status: false });
  }
  /**
   * 取消联动
   */
  async [ToolsBarType.LINKAGE]() {
    const res = await this.setChartLinkage({ chart: this.element, mode: "clear" });
    if (res) {
      message.success("联动已取消");
    } else {
      message.warning("当前没有图表与本图表联动");
    }
  }

  /**
   * 排序功能
   */
  [ToolsBarType.SORT]() {
    const self = this;
    const modalConfirm = Modal.confirm({
      class:
        this.element.type !== "list" ? "h3-report-confirm__modal" : "h3-report-confirm__modal-list",
      title: "排序规则设置",
      content: h => {
        const receiveData = {
          chart: self.element,
          chartType: self.element.type
        };
        return h(self.element.type !== "list" ? Sort : SortList, {
          props: receiveData,
          on: {
            changeData(val) {
              if (self.element.type !== "list") {
                val.forEach(item => {
                  delete item.sortType;
                });
              }
              self.sortData = val;
            }
          }
        });
      },
      okText: "确定",
      cancelText: "取消",
      width: self.element.type !== "list" ? 482 : 610,
      destroyOnClose: true,
      centered: true,
      closable: true,
      confirmLoading: true,
      iconType: "noneIcon",
      onOk: e => {
        if (self.element as H3.Report.Chart) {
          (self.element as H3.Report.Chart).data.sort = self.sortData;
        }
        self.resizeChartView({ chart: self.element, type: "data" });
        modalConfirm.destroy();
      }
    } as any);
  }

  /**
   * 删除图表
   */
  [ToolsBarType.REMOVE]() {
    // 弹出确认框
    const self = this;
    let title: any = h => {
      return h("div", {
        domProps: {
          innerHTML: `删除（${(self.element as H3.Report.Chart).title}）图表`
        },
        attrs: {
          title: `删除（${(self.element as H3.Report.Chart).title}）图表`
        },
        style: {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis"
        }
      });
    };
    let content = "删除图表后，将清空该图表的联动关系，确定需要删除吗？";
    if (this.element.type === "longText") {
      title = "删除文本";
      content = "确定需要删除吗？";
    } else if (this.element.type === "filterPicker") {
      title = `删除（${(self.element as H3.Report.Chart).title}）筛选器`;
      content = "确定需要删除吗？";
    }
    const modalConfirm = Modal.confirm({
      class: `h3-dashboard-item__modal`,
      title,
      content,
      okText: "确定",
      cancelText: "取消",
      width: 610,
      destroyOnClose: true,
      centered: true,
      confirmLoading: true,
      iconType: "exclamation-circle-o",
      onOk: () => {
        this.clearActiveChart();
        this.charts.splice(this.elementIndex, 1);
        // 清空清空图表关系
        self.clearChartRelation(self.element);
        // 清空筛选关系
        if (self.element.type === "filterPicker") {
          self.removeFilterPicker(self.element);
        }
        // 销毁
        modalConfirm.destroy();
      }
    } as any);
  }

  /**
   * 导出Excel
   */
  async [ToolsBarType.EXPORT]() {
    // 如果是明细表的话 后台导出
    if (this.element.type === "list") {
      const oChart = JSON.parse(JSON.stringify(this.element)) as H3.Report.Chart;
      const sendChart: H3.ReportAPI.Chart = {
        title: oChart.title,
        authorization: oChart.authorization,
        dataSourceId: oChart.dataSourceId,
        useType: oChart.useType,
        type: oChart.type as any,
        dimension: oChart.data.dimension,
        groupDimension: oChart.data.groupDimension,
        metric: oChart.data.metric,
        filter: oChart.data.filter,
        sort: oChart.data.sort,
        limit: oChart.data.limit,
        pageSize: oChart.pageSize,
        pageIndex: oChart.pageIndex
      };

      if (sendChart.filter) {
        sendChart.filter = sendChart.filter.concat(
          oChart.linkageFilter || [],
          ...Object.values(oChart.filterPicker || {})
        );
        sendChart.filter.forEach((filter: H3.Report.FilterFieldColumn) => {
          filter.text = filter.text.map((item: any) =>
            item instanceof Object ? item.value : item
          );
        });
      }

      const res = await dashboardApi.dataExport(sendChart as any);
      if (res) {
        // let blob = new Blob(res, {type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}); // 得到 blob
        // res.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const url = URL.createObjectURL(
          res.slice(
            0,
            res.size,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
        );
        downloadFile(url, this.element.title);
      }
    } else {
      let uid = "";
      if (this.element.uid.match("full-")) {
        uid = this.element.uid.replace("full-", "");
      } else {
        uid = this.element.uid;
      }
      exportExcel(this.tableExportData[uid]);
    }
  }

  /**
   * 编辑
   */
  [ToolsBarType.EDIT]() {
    if (this.element.type === (ElementType.FILTERPICKER as any)) {
      this.$emit("change-picker", true);
    } else {
      const nChart = Object.assign({}, this.element, {
        edit: !(this.element as H3.Report.Chart).edit
      });
      this.$set(this.charts, this.elementIndex, nChart);
    }
  }
  /**
   * 图表刷新
   */
  [ToolsBarType.REFRESH]() {
    this.resizeChartView({ chart: this.element, type: "data" });
  }
}
