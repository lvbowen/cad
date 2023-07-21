<template>
  <table
    border="0"
    cellspacing="0"
    cellpadding="0"
    :class="prefixCls"
    :style="`width: ${tableWidth}`"
  >
    <!-- Todo 将明细表的数据放在外部处理 done-->
    <colgroup>
      <col
        v-for="h in sortColumn"
        :key="h.key"
        :style="`width: ${h.width}px`"
      />
    </colgroup>
    <tbody>
      <tr
        :data-idx="index + 1"
        v-for="(d, index) in datasource"
        :key="index"
      >
        <template v-for="col in sortColumn">
          <th
            v-if="typeof d[col.key] !== 'object'"
            :key="col.key"
            :data-key="col.key"
            @click="clickField(d)"
          >
            <div :class="`${prefixCls}__cell`">
              <template>
                {{ col.key === "h3-report-list-order" ? prefixSerial + index + 1 : d[col.key] }}
              </template>
            </div>
          </th>
          <th
            v-else
            :key="col.key"
            :data-key="col.key"
            @click="clickField(d)"
          >
            <div class="">
              <div
                v-for="(child, cIndex) in d[col.key]"
                :key="`${index}-${cIndex}-child`"
                :class="`${prefixCls}__cell`"
                :style="calculateCellStyle(index, d[col.key])"
              >
                <template>
                  {{ child }}
                </template>
              </div>
            </div>
          </th>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from "vue-property-decorator";

const prefix = "h3-report";
@Component({
  name: "h3-report-list-table-body",
  components: {}
})
export default class ReportListBody extends Vue {
  // 表格数据
  @Prop({ default: () => [] }) datasource!: any;
  // 格式化后原始表头数据 已排序
  @Prop({ default: () => [] }) sortColumn!: Array<any>;
  // 别名系统
  @Prop({ default: () => {} }) alias!: any;
  // 分页信息
  @Prop({
    default: () => {
      return {
        pageSize: 10, // 页数大小
        pageIndex: 1 // 第几页
      };
    }
  })
  pageParams!: H3.List.pageOptions;

  prefixCls: string = `${prefix}-list-table-body`;

  // 固定的单元格高度
  staticCellHeight: number = 36;

  /**
   * 动态计算表格的宽度
   */
  get tableWidth(): string {
    return this.sortColumn.length > 0
      ? this.sortColumn.reduce((current, next) => {
          let currentWidth = current.width || current;
          return currentWidth + next.width;
        }) + "px"
      : "100%";
  }

  /**
   * 序号前缀
   */
  get prefixSerial() {
    return this.pageParams.pageSize * (this.pageParams.pageIndex - 1);
  }

  /**
   * 动态计算表格每一行的最大行数
   */
  get maxClomns(): Array<number> {
    return this.datasource.map(item => {
      let max: number = 1;
      for (let key in item) {
        if (Array.isArray(item[key]) && item[key].length > max) {
          max = item[key].length;
        }
      }
      return max;
    });
  }

  /**
   * 计算单元格高度和行高
   */
  calculateCellStyle(index, value) {
    // if (value && value.length === this.maxClomns[index]) return
    const height = (this.maxClomns[index] * this.staticCellHeight) / value.length;
    return {
      height: `${height}px`,
      "line-height": `${height - 16}px`
    };
  }
  /**
   * 点击单元格
   */
  clickField(data) {
    if (data.holeInfo) {
      this.$emit("drill-down", data.holeInfo);
    }
  }
  mounted() {
    console.log(this.sortColumn);
  }
}
</script>

<style lang="less" scoped>
@import "../styles/index.less";
</style>
