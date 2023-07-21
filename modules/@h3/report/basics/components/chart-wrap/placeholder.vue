<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Mixins } from "vue-property-decorator";
import chartMixins from "../../mixins/chart-mixins";
import { judgeMobile } from "../../utils/browser";
import { ResponseCode } from "../../enum/response-code";

@Component({
  name: "h3-report-chart-wrap-placeholder",
  components: {}
})
export default class ReportChartWrap extends Mixins<chartMixins>(chartMixins) {
  @Prop({ default: null }) chart!: H3.Report.Chart;
  @Prop({ default: null }) errorMsg!: string;
  @Prop({ default: "" }) comPrefixCls!: string;
  @Prop({ default: "" }) isLoadData!: string;
  @Prop({ default: null }) data!: any;
  prefixCls = `${this.comPrefixCls}__placeholder`;

  get emptyPic() {
    return judgeMobile() !== "pc"
      ? require(`@h3/report/basics/assets/m-empty.png`)
      : require(`@h3/report/basics/assets/biax-blue.png`);
  }

  /**
   * 标准图表占位图
   */
  chartRender(h: CreateElement) {
    return h("div", {
      class: {
        "empty-img": true
      },
      style: {
        backgroundImage: `url('${this.emptyPic}')`
      }
    });
  }

  /**
   */

  chartLabelRender(h: CreateElement, text: string) {
    return h(
      "div",
      {
        class: {
          [`${this.prefixCls}--label`]: true
        }
      },
      text
    );
  }
  /**
   * 没有图表渲染
   * @param h
   */
  nullChartRender(h: CreateElement) {
    return [
      h("div", {
        class: {
          "empty-img": true
        },
        style: {
          backgroundImage: `url('${this.emptyPic}')`
        }
      }),
      h(
        "div",
        {
          class: {
            [`${this.prefixCls}--label`]: true
          }
        },
        "报表数据有误或已被删除，请重新配置"
      )
    ];
  }

  /**
   * 空图表
   * @param h
   */
  emptyChartRender(h: CreateElement) {
    return [this.chartRender(h), this.chartLabelRender(h, "暂无内容")];
  }

  /**
   * 错误图表
   * @param h
   */
  errChartRender(h: CreateElement) {
    let errText = "";
    switch (this.errorMsg) {
      case ResponseCode.FIELDMISSING:
        errText = "您当前字段缺失，请重新设置后查看";
        break;
      case ResponseCode.DATAOVERFLOW:
        errText = "数据量过大，请重新设置";
        break;
      case ResponseCode.MODELNOTEXIST:
        errText = "指定的模型不存在";
        break;
      case ResponseCode.DATASOURCENOTEXIST:
        errText = "指定的数据源不存在";
        break;
      case ResponseCode.LOGINERROR:
        errText = "当前用户未登录";
        break;
      default:
        break;
    }

    return [this.chartRender(h), this.chartLabelRender(h, errText)];
  }

  /**
   * 空数据图表
   * @param h
   */
  emptyDataChartRender(h: CreateElement) {
    return [this.chartRender(h), this.chartLabelRender(h, "您当前没有数据，请添加数据后查看")];
  }
  render(h: CreateElement) {
    let chartPlaceholder: VNode[] | null = null;
    if (!this.chart) {
      chartPlaceholder = this.nullChartRender(h);
    } else if (!this.checkChart || !this.isLoadData) {
      chartPlaceholder = this.emptyChartRender(h);
    } else if (this.isLoadData && this.errorMsg) {
      chartPlaceholder = this.errChartRender(h);
    } else if (this.isLoadData && (!this.data || !this.data.length)) {
      chartPlaceholder = this.emptyDataChartRender(h);
    }
    return chartPlaceholder
      ? h(
          "div",
          {
            class: {
              [this.prefixCls]: true
            }
          },
          chartPlaceholder
        )
      : null;
  }
}
</script>
