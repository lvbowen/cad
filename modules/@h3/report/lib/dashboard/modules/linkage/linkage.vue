<!-- 图表联动 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="[`${prefixCls}__body`,`${comPrefixCls}__body`]">
      <a-select
        style="width: 100%"
        mode="multiple"
        placeholder="请选择需要联动的图表"
        notFoundContent="无匹配结果"
        :value="selectValue"
        :filterOption="filterOption"
        @change="handleChange"
      >
        <a-select-option v-for="(item, index) in sameData" :key="item.uid">
          {{ item.title }}
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Select } from '@h3/antd-vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-linkage-module',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class ReportChartLinkage extends Vue {
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.Linkage;
  @ReportPro.State('charts') charts !: Array<H3.Report.Chart>;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls = 'h3-report-linkage-module';
  // 同源数据
  sameData: any[] = [];
  // 指定当前选中的条目
  selectValue: Array<string> = [];

  @Watch('chart', { deep: true })
  watchChart(val) {
    // 处理同源数据
    this.handleSameData();
    // 初始默认的联动图表值
    this.initDefaultData();
  }

  @Watch('selectValue', { deep: true })
  watchSelectValue(val) {
    if (val.length !== 0) {
      // 添加padding-top: 4px;
      (document.getElementsByClassName('ant-select-selection__rendered')[0] as HTMLElement).style.paddingTop = '4px';
    }
  }

  /**
   * onchange事件
   * @param data
   */
  handleChange(data) {
    this.selectValue = data;
    this.chart.styles.linkage = data;
  }

  /**
   * select-过滤方法
   * @param value 搜索输入的值
   * @param option
   */
  filterOption(value: string, option: any) {
    let res;
    for (let i of this.sameData) {
      if (i.uid === option.key) {
        res = i.title.indexOf(value);
        break;
      }
    }
    return res !== -1;
  }

  /**
   * 处理同源数据
   */
  handleSameData() {
    this.sameData = [];
    for (let i of this.charts) {
      if ((i.uid !== this.chart.uid) && (i.dataSourceId === this.chart.dataSourceId) && i.type !== 'card') {
        this.sameData.push(i);
      }
    }
  }

  /**
   * 初始默认的联动图表值
   */
  initDefaultData() {
    if (this.chart.styles.linkage) {
      this.selectValue = this.chart.styles.linkage;
    }
  }

  mounted () {
    // 处理同源数据
    this.handleSameData();
    // 初始默认的联动图表值
    this.initDefaultData();
  }
}
</script>
<style lang='less'>
  .h3-report-linkage-module {
    border-bottom: none !important;
    &__body {
      margin-top: 8px;
    }
    .ant-select-selection--multiple {
      padding-bottom: 0;
    }
    .ant-select-selection--multiple .ant-select-selection__rendered {
      margin: 0 4px;
      padding-top: 0;
      ul {
        .ant-select-search {
          margin-right: 0;
        }
        li {
          margin-right: 4px;
        }
        li:last-child {
          margin-bottom: 4px;
        }
      }
    }
    .ant-select-selection--multiple .ant-select-selection__placeholder {
      margin-left: 8px;
    }
  }
</style>
