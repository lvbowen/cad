<template>
  <div :class="prefixCls">
    <multi-group
      v-for="(item, index) in innerFormats"
      :key="index"
      :title="item.name"
    >
      <row-switch
        title="千分符"
        v-model="item.comma"
        @change="changeValue($event, index, 'comma')"
      ></row-switch>
      <row-switch
        title="百分号"
        v-model="item.percent"
        @change="changeValue($event, index, 'percent')"
      ></row-switch>
      <row-number
        title="小数位数"
        :min="0"
        :max="6"
        :precision="0"
        placeholder="请输入正数"
        v-model="item.fraction"
        @change="changeValue($event, index, 'fraction')"
      ></row-number>
      <row-cascade
        v-if="item.options.length > 1"
        :displayRender="displayRender"
        :getPopupContainer="getContainer"
        title="高级计算"
        v-model="item.compute"
        :options="item.options"
        @change="changeComputing($event, index)"
      >
      </row-cascade>
    </multi-group>
  </div>
</template>

<script lang="ts">
import { commaFormat } from "@h3/report/basics/utils/number";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import RowSwitch from "../../component/row-switch";
import RowCascade from "../../component/row-cascade";
import RowNumber from "../../component/row-number";
import MultiGroup from "../../component/multi-group";
import { analysisRatio } from "@h3/report/basics/enum/ratio";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { Message } from "@h3/antd-vue";

const ReportPro = namespace("report");
@Component({
  name: "h3-analysis-number-format",
  components: {
    RowSwitch,
    RowNumber,
    RowCascade,
    MultiGroup
  }
})
export default class NumberFormat extends Vue {
  @Prop() fields!: Array<H3.Report.FieldColumn>;
  @Prop() chart!: H3.Report.Chart;
  prefixCls = "h3-analysis-number-format";
  // 实际值
  innerFields: Array<H3.Report.FieldColumn> = JSON.parse(JSON.stringify(this.fields));
  // 渲染列表
  innerFormats: Array<any> = [];

  /**
   * 联级选择组件挂载容器
   */
  getContainer() {
    return this.$el;
  }
  /**
   * 改变高级计算
   * @param value
   * @param index
   */
  changeComputing(value: string[] | number[], index: number) {
    // 同/环比分析增长率数组
    let ratioList: Array<number> = [2, 4, 6, 8];
    // 清空数据或选择无,百分位及小数位设置重置
    if (!value.length || value[0] === "none") {
      this.$set(this.innerFormats[index], "compute", ["none"]);
      (this.innerFields[index] as any).options.numberFormat.percent = false;
      (this.innerFields[index] as any).options.numberFormat.fraction = 0;
      this.$set(this.innerFormats[index], "percent", false);
      this.$set(this.innerFormats[index], "fraction", 0);
      (this.innerFields[index] as any).options.percent = "DEFAULT";
      (this.innerFields[index] as any).options.ratio = null;
      // 改变为占比时，清空同环比数据，添加百分符和添加两位小数
    } else if (value[0] === "PERCENT") {
      (this.innerFields[index] as any).options.percent = "PERCENT";
      (this.innerFields[index] as any).options.ratio = null;
      (this.innerFields[index] as any).options.numberFormat.percent = true;
      (this.innerFields[index] as any).options.numberFormat.fraction = 2;
      this.$set(this.innerFormats[index], "percent", true);
      this.$set(this.innerFormats[index], "fraction", 2);
      // 选择为同/环比,占比恢复默认，增长率的都添加百分符和添加两位小数
    } else if (value.length === 2) {
      (this.innerFields[index] as any).options.numberFormat.percent = ratioList.includes(
        value[1] as number
      );
      (this.innerFields[index] as any).options.numberFormat.fraction = ratioList.includes(
        value[1] as number
      )
        ? 2
        : 0;
      this.$set(this.innerFormats[index], "percent", ratioList.includes(value[1] as number));
      this.$set(
        this.innerFormats[index],
        "fraction",
        ratioList.includes(value[1] as number) ? 2 : 0
      );
      (this.innerFields[index] as any).options.percent = "DEFAULT";
      (this.innerFields[index] as any).options.ratio = value[1];
    }
    this.$emit("change", this.innerFields);
  }

  /**
   * 改变千分符/百分号/小数位
   */
  changeValue(value: any, index: number, type: string) {
    let val = value;
    switch (type) {
      case "fraction":
        // 最大 6个 小数位
        if (value > 6) {
          Message.warning("小数位最大设置六位");
        }
        val = value ? (value > 6 ? 6 : value) : 0;
        break;
      case "percent":
        if (!value) {
          if ((this.innerFields[index] as any).options.percent === "PERCENT") {
            this.$set(this.innerFormats[index], "compute", ["none"]);
            (this.innerFields[index] as any).options.percent = "DEFAULT";
          }
        }
        break;
      case "comma":
        break;
      default:
    }

    this.$set(this.innerFormats[index], type, val);
    (this.innerFields[index] as any).options.numberFormat[type] = val;
    this.$emit("change", this.innerFields);
  }

  /**
   * 高级计算值映射
   * @param field
   */
  mapComputeValue(field: H3.Report.FieldColumn) {
    let value: Array<number | string> = ["none"];
    if (field.options && field.options.percent === "PERCENT") {
      value = [field.options.percent];
    } else if (field.options && field.options.ratio) {
      value = ["RatioAnalyze", field.options.ratio];
    }
    return value;
  }

  /**
   * 改变展示值
   */
  displayRender({ labels }) {
    return labels[labels.length - 1];
  }
  /**
   * 获取高级计算配置项
   * @param field 字段
   * @param dateFields 维度日期字段
   */
  getOptions(field: H3.Report.FieldColumn, dateFields) {
    let computeOptions = [
      {
        value: "none",
        label: "无"
      }
    ];
    let ratioOption = {
      value: "RatioAnalyze",
      label: "同/环比分析",
      children: []
    };
    // 是否有占比(指标字段只支持总和/计数),散点图
    if (
      this.visibleField(field) &&
      this.chart.type !== ElementType.SCATTER &&
      this.chart.type !== ElementType.PIE
    ) {
      computeOptions.push({
        value: "PERCENT",
        label: "占比"
      });
    }
    // 是否有同/环比（维度中有且只有一个日期字段时才可以使用同/环比分析，指标字段只支持总和/计数）,饼图禁用
    if (
      this.visibleField(field) &&
      dateFields.length === 1 &&
      this.chart.type !== ElementType.PIE
    ) {
      let dateType = dateFields[0].options.format;
      if (analysisRatio[dateType]) {
        ratioOption.children = analysisRatio[dateType];
        computeOptions.push(ratioOption);
      }
    }

    return computeOptions;
  }

  /**
   * 是否显示字段，只支持总和/计数
   */
  visibleField(field: H3.Report.FieldColumn): boolean {
    return (
      field.options &&
      (field.options.aggregateType === "SUM" || field.options.aggregateType === "COUNT")
    );
  }

  /**
   * 获取维度日期字段
   */
  getDateField() {
    let dateFields: Array<any> = [];
    // 维度
    this.chart.data.dimension.forEach(item => {
      if (item.type === "date") {
        dateFields.push(item);
      }
    });
    // 分组维度
    if (this.chart.data.groupDimension) {
      this.chart.data.groupDimension.forEach(item => {
        if (item.type === "date") {
          dateFields.push(item);
        }
      });
    }
    return dateFields;
  }

  /**
   * 初始化数组格式设置,兼容旧数据默认值处理
   */
  initInnerFormats() {
    let dateFields = this.getDateField();
    // 过滤空指标
    this.innerFields = this.innerFields.filter(item => {
      return Object.keys(item).length;
    });
    // 兼容numberFormat不存在
    this.innerFields.forEach((item, index) => {
      if (!item.options.numberFormat) {
        this.innerFields[index].options.numberFormat = {
          comma: false,
          percent: false,
          fraction: 0
        };
      }
    });
    this.innerFormats = this.innerFields.map((field, index) => {
      let options = this.getOptions(field, dateFields);
      let value = this.mapComputeValue(field);
      return Object.assign(
        {
          name: field.alias ? field.alias : field.name,
          compute: value,
          options: options
        },
        field.options.numberFormat
      );
    });
  }
  mounted() {
    this.initInnerFormats();
  }
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/components.less";
.h3-analysis-number-format {
  max-height: 380px;
  .vertical-scrollbar();
  .h3-row__content {
    flex: none;
  }
  .h3-row-switch {
    margin-bottom: 12px;
  }
  .ant-switch-checked {
    background-color: #2565f1;
  }
  .ant-cascader-menu {
    height: auto;
  }
}
</style>
