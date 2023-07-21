<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CreateElement, VNode } from 'vue';

@Component({
  name: 'h3-table-cell'
})
export default class ReportTableCell extends Vue {
  @Prop({ default: () => '' }) data!: any;
  @Prop({ default: () => null }) field!: H3.Report.FieldColumn;
  @Prop({ default: () => 0 }) row!: any;
  @Prop({ default: () => 0 }) rowIndex!: number;
  @Prop({ default: () => 0 }) index!: number;
  @Prop({ default: () => null }) formatter!: Function;

  /**
   * 获取单元格数据集
   */
  getCellData(data: any) {
    return { data, field: this.field, row: this.row, rowIndex: this.rowIndex, index: this.index };
  }
  render(h: CreateElement) {
    let data: any = '';
    // 删除数据前后空格
    if (this.data && typeof this.data === 'string') {
      data = this.data.trim();
    } else {
      data = this.data;
    }
    if (this.formatter) {
      data = this.formatter(this.getCellData(data));
    }
    return h('div', {
      class: {
        cell: true
      },
      domProps: {
        innerText: data === null ? '-' : data
      },
      on: {
        click: () => {
          this.$emit('click', this.getCellData(data));
        }
      }
    });
  }
}
</script>
<style lang="less">
</style>
