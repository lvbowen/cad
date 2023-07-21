<template>
  <div :class="`${prefixCls}`">
    <row-radio
      v-for="(item, index) in sortList"
      v-show="index < limitNum"
      :key="index"
      :title="item.alias ? item.alias : item.name"
      :options="sortRadioOptions"
      :value="item.options && item.options.order ? item.options.order : ''"
      @change="change($event, item, index)"
    ></row-radio>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import RowRadio from "../../component/row-radio";
import MultiGroup from "../../component/multi-group";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import { sortOptions } from "../../config/static-option";
import { getSelectFields } from "../../help/handleLinkage";

const Analysis = namespace("analysisState");
@Component({
  name: "h3-analysis-sort-list",
  components: {
    RowRadio,
    MultiGroup
  }
})
export default class AnalysisSortModel extends Vue {
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => [] }) value!: Array<H3.Report.FieldColumn>; // 默认值
  @Prop({ default: () => 60 }) limit!: number; // 显示

  prefixCls: string = "h3-analysis-sort-list";
  // 排序列表
  innerValue: Array<H3.Report.FieldColumn> = this.value;

  // 是否展开
  isOpen: boolean = false;
  // 修改项数据
  changeData: Array<any> = [];
  //每个排序的配置项
  sortRadioOptions: Array<{ label: string; value: string }> = sortOptions;

  /**
   * 显示限制
   */
  get limitNum() {
    return this.limit ? this.limit : 60;
  }

  /**
   * 排序列表（带默认顺序）
   */
  get sortList() {
    let sortList: Array<H3.Report.FieldColumn> | any = [...this.concatList];
    sortList.forEach((item, index: number) => {
      this.value.forEach(sort => {
        if (
          sort.field === item.field &&
          sort.schemaCode === item.schemaCode &&
          sort.uid === item.uid
        ) {
          if (sort.options && sort.options.order) {
            item.options.order = sort.options.order;
          }
        }
      });
    });
    return sortList;
  }
  /**
   * 可排序字段列表
   */
  get concatList() {
    let selectFields = getSelectFields(this.chart);
    selectFields = JSON.parse(JSON.stringify(selectFields));
    return selectFields;
  }

  /**
   * 排序规则
   * @param field
   */
  sortRules(field: H3.Report.FieldColumn) {
    if (this.chart.type === "table") {
      // 透视图排序规则
      this.tableSortRules(field);
    } else {
      // 非透视图排序规则
      this.defaultSortRules(field);
    }
  }
  /**
   * 字段是否存在
   */
  hasFieldType(field, type) {
    let fields: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.metricGroup && type === "metric") {
      this.chart.data.metricGroup.forEach(m => {
        fields = [...fields, ...m];
      });
    } else {
      fields = this.chart.data[type];
    }
    let hasType = fields.find((item, index) => {
      return (
        item.field === field.field && item.schemaCode === field.schemaCode && item.uid === field.uid
      );
    });
    return !!hasType;
  }

  /**
   * 非透视图排序规则
   */
  defaultSortRules(field) {
    if (this.hasFieldType(field, "dimension")) {
      this.sortList.forEach(item => {
        if (this.hasFieldType(item, "metric")) {
          item.options.order = "";
        }
      });
    } else {
      // 指标只能选一个
      this.sortList.forEach(item => {
        if (
          !(
            item.field === field.field &&
            item.schemaCode === field.schemaCode &&
            item.uid === field.uid
          )
        ) {
          item.options.order = "";
        }
      });
    }
  }
  /**
   * 透视图排序规则
   * @param field
   */
  tableSortRules(field) {
    // 找到指标第一个值
    const hasFirstMetric = this.sortList.findIndex(item => this.hasFieldType(item, "metric"));
    let lastDimension;
    if (this.chart.data.dimension.length) {
      lastDimension = this.chart.data.dimension[this.chart.data.dimension.length - 1];
    }
    const isLastDimension = lastDimension && lastDimension.uid === field.uid;
    // -1为透视图没有行维度，只有列维度和指标
    if (hasFirstMetric !== -1) {
      // 指标全部恢复默认值
      if (!this.hasFieldType(field, "metric")) {
        if (isLastDimension) {
          this.sortList.forEach(item => {
            if (this.hasFieldType(item, "metric")) {
              item.options.order = "";
            }
          });
        }
      } else {
        this.sortList.forEach((item, index) => {
          if (
            (item.uid !== field.uid && this.hasFieldType(item, "metric")) ||
            lastDimension.uid === item.uid
          ) {
            item.options.order = "";
          }
        });
      }
    }
  }
  /**
   * change事件
   * @param value
   * @param field
   * @param index
   */
  change(value: string, field, index: number) {
    console.log("chang");
    this.sortList[index].options.order = value;
    this.sortRules(field);
    // 排序规则
    this.emitDate();
  }
  /**
   * 抛出changeDate
   */
  emitDate() {
    this.innerValue = this.sortList.filter(item => {
      return item.options && item.options.order;
    });
    this.$emit("change-sort", this.innerValue);
  }

  mounted() {}
}
</script>

<style lang="less"></style>
