<template>
  <table
    border="0"
    cellspacing="0"
    cellpadding="0"
    :class="prefixCls"
    :style="`width: ${tableWidth}`"
  >
    <colgroup>
      <col
        v-for="h in sortColumn"
        :key="h.key"
        :style="`width: ${h.width}px`"
      />
    </colgroup>

    <thead :style="{ color: column.fontColor }">
      <tr v-for="(rowHead, index) in column" :key="index">
        <template v-if="rowHead.length > 0">
          <th
            v-for="c in rowHead"
            :key="c.key"
            :rowspan="c.isLeaf ? column.length - index : 1"
            :colspan="c.isLeaf ? 1 : c.leafNum"
          >
            {{ c.alias || c.name }}
            <div
              v-if="allowDrag && c.allowDrag"
              class="column-resize-area"
              @mousedown="startDrag($event, c)"
              @dblclick="dblclick($event, c)"
            ></div>
          </th>
        </template>
      </tr>
    </thead>
  </table>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";

const prefix = "h3-report";
@Component({
  name: "h3-report-list-table-head",
  components: {}
})
export default class ReportListHead extends Vue {
  // 表格列信息
  @Prop({ default: () => {} }) column!: H3.List.TitleOptions;
  // 原始表头数据 已排序
  @Prop({ default: () => [] }) sortColumn!: Array<any>;
  // 是否允许拖拽
  @Prop({ default: true }) allowDrag!: string;

  prefixCls: string = `${prefix}-list-table-head`;

  get tableWidth(): string {
    return this.sortColumn.length > 0
      ? this.sortColumn.reduce((current, next) => {
          let currentWidth = current.width || current;
          return currentWidth + next.width;
        }) + "px"
      : "100%";
  }

  /**
   * 拖拽
   */
  startDrag(e, row) {
    this.$emit("start-drag", { e, row });
  }
  /**
   * 双击格子自适应
   */
  dblclick(e, row) {
    this.$emit("change-columns", { e, row });
  }
}
</script>

<style lang="less" scoped>
@import "../styles/index.less";
</style>
