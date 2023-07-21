<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <a-select
        :class="[`${prefixCls}__field`]"
        :placeholder="'请选择排序字段'"
        :showSearch="false"
        :field="getField"
        :value="selectValue"
        @change="fieldChange"
      >
        <a-select-option
          v-for="(item, i) in sortSchemas"
          :key="i"
          :value="item.uid"
        >
          {{ item.name }}{{ enumMapping(item) }}
        </a-select-option>
      </a-select>
      <a-select
        v-model="order"
        :class="[`${prefixCls}__sort`]"
        :disabled="module.disabled"
        :options="sortType"
        @change="sortChange"
      >
      </a-select>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Select } from "@h3/antd-vue";
import H3ReportFieldSelect from "./field-select.vue";
import enumType from "@h3/report/basics/enum/aggregate-type";

@Component({
  name: "h3-report-easy-sort-module",
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    H3ReportFieldSelect
  }
})
export default class ReportEasySortModule extends Vue {
  prefixCls = "h3-report-easy-sort-module";
  @Prop({ default: () => "" }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Sort;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => ({}) }) data!: Array<H3.Report.FieldColumn>;
  order: "asc" | "desc" = "asc";
  sortType = [
    { label: "升序", value: "asc" },
    { label: "降序", value: "desc" }
  ];
  // select - value(v-model)
  selectValue = null;
  @Watch("data", { immediate: true })
  watchData() {
    if (this.data && this.data.length) {
      this.order = this.data[0].options.order || "asc";
    } else {
      // 删除了对应的字段，select的默认选中值需要清空
      this.selectValue = null;
    }
  }

  /**
   * 排序的字段集合
   */
  get sortSchemas() {
    let columns: Array<H3.Report.FieldColumn> = [];
    if (this.chart.data.dimension.length > 1 && this.chart.type !== "table") {
      // 除了透视表以外的二维一标
      columns = columns.concat([...(this.chart.data.dimension as any)]).filter(item => item.type);
    } else {
      columns = columns
        .concat([
          ...(this.chart.data.dimension as any),
          ...((this.chart.data.groupDimension as any) || []),
          ...(this.chart.data.metric as any)
        ])
        .filter(item => item.type);
    }
    // 每次改变时需要判断是否有以选中的排序值 如果有 但已不可排序 就删除
    if (this.data[0]) {
      const exitField = columns.find(i => i.uid === this.data[0].uid);
      !exitField && this.data.splice(0, 1);
    }
    return columns;
  }

  get getField() {
    return this.data[0] || null;
  }

  /**
   * 字段改变
   * @param uid
   */
  fieldChange(uid: string) {
    const filed: any = this.sortSchemas.find(item => item.uid === uid);
    const enumMappingType = this.enumMapping(filed);
    this.selectValue = filed.name + enumMappingType;
    filed.options.order = this.order;
    this.data.splice(0, 1, filed);
  }

  /**
   * 升降序选择
   */
  sortChange() {
    if (this.data[0]) {
      this.data[0].options.order = this.order;
      this.data.splice(0, 1, this.data[0]);
    }
  }

  /**
   * 枚举映射
   * @param schema
   */
  enumMapping(schema: H3.Report.FieldColumn) {
    let nameLabel: string = "";
    if (schema.options) {
      // 判断options是否为空，不为空则为选中状态
      if (Object.keys(schema.options).length) {
        // 排序 - 指标才需要添加后缀
        if (schema.options.aggregateType) {
          enumType.number.find((item: any) => {
            if (item.value === schema.options.aggregateType) {
              nameLabel = item.label;
            }
          });
          enumType.string.find((item: any) => {
            if (item.value === schema.options.aggregateType) {
              nameLabel = item.label;
            }
          });
          return `（${nameLabel}）`;
        }
      }
      return "";
    }
  }
}
</script>
<style lang="less">
.h3-report-easy-sort-module {
  &__body {
    display: flex;
  }
  &__field {
    flex: 1;
    overflow: hidden;
  }
  &__field + &__sort {
    margin-left: 8px;
  }
  &__sort {
    flex: 0 0 120px;
  }
}
</style>
