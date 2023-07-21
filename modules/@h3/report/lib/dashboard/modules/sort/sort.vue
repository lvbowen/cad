<template>
  <div :class="[prefixCls, comPrefixCls]">
    <!-- 排序字段 -->
    <div
      v-for="(item, i) in sortList"
      :key="i"
      :class="[`${prefixCls}__field`]"
    >
      <div :class="[`${prefixCls}__sort-name`]">
        <label
          :title="item.alias ? item.alias : item.name"
          :class="[`${prefixCls}__sort-label`]"
        >
          {{ item.alias ? item.alias : item.name }}
        </label>
        <label>{{ fieldTypeMapping(item.uid, item.sortType) }}</label>
      </div>
      <a-radio-group
        buttonStyle="solid"
        :class="[`${prefixCls}__order`]"
        :defaultValue="item.options.order"
        :value="item.options.order ? item.options.order : ''"
        @change="change($event, i)"
      >
        <a-radio-button :value="''">默认</a-radio-button>
        <a-radio-button :value="'asc'">升序</a-radio-button>
        <a-radio-button :value="'desc'">降序</a-radio-button>
      </a-radio-group>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { Radio } from '@h3/antd-vue';
import enumType from '@h3/report/basics/enum/aggregate-type';

@Component({
  name: 'h3-report-sort-module',
  components: {
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group
  }
})
export default class ReportSortModule extends Vue {
  prefixCls = 'h3-report-sort-module';
  comPrefixCls = 'report-modules';
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => '' }) chartType!: string;
  // 排序列表
  sortList: any[] = [];
  // 深拷贝chart数据
  deepCopyChart:any = JSON.parse(JSON.stringify(this.chart));
  // 修改项数据
  changeData: Array<any> = [];

  /**
   * 字段类型映射
   * @param uid
   * @param type
   */
  fieldTypeMapping(uid: string, type: string) {
    let typeMapping: string = '';
    // 根据维度、分组维度、指标遍历
    for (let i of this.deepCopyChart.data[type]) {
      if (i.uid === uid) {
        for (let k of enumType[i.type]) {
          // 维度 - 日期(format)字段、指标 - 数值(aggregateType)字段
          if (k.value === i.options.format || k.value === i.options.aggregateType) {
            typeMapping = `（${k.label}）`;
            break;
          }
          // 指标 - 字符串、日期字段
          else if (i.options.aggregateType === 'COUNT') {
            typeMapping = '（计数）';
            break;
          }
        }
      }
    }
    return typeMapping;
  }

  /**
   * 透视图排序规则
   * @param i
   */
  tableSortRules(i: number) {
    let dimensionCount = 0;
    let groupDimensionCount = 0;
    let metricCount = 0;
    let dimensionLength = this.chart.data.dimension.length + (this.chart.data.groupDimension as any).length;
    // 计算维度、指标和
    this.sortList.forEach((item) => {
      if (item.sortType === 'dimension' && item.options.order) {
        dimensionCount += 1;
      }
      if (item.sortType === 'groupDimension' && item.options.order) {
        groupDimensionCount += 1;
      }
      if (item.sortType === 'metric' && item.options.order) {
        metricCount += 1;
      }
    })
    // 找到指标第一个值
    const firstMetric = this.sortList.findIndex((item) => item.sortType === 'metric');
    // -1为透视图没有行维度，只有列维度和指标
    if (firstMetric !== -1) {
      // 点击维度
      if (this.sortList[i].sortType !== 'metric') {
        // 点击最后一个行维度
        if ((firstMetric - 1) === i) {
          this.sortList.forEach((item) => {
            // 指标全部恢复默认值
            if (item.sortType === 'metric') delete item.options.order;
          })
        }
      } else {
        this.sortList.forEach((item, index) => {
          // 点击指标，把其他指标恢复默认(指标只能存在一个)，且把行维度最后一个值恢复默认，
          if ((i !== index && item.sortType === 'metric') || ((firstMetric - 1) === index)) {
            delete item.options.order;
          }
        })
      }
    }
  }

  /**
   * 非透视图排序规则
   */
  defaultSortRules(i: number) {
    if (this.sortList[i].sortType === 'dimension') {
      this.sortList.forEach((item) => {
        if (item.sortType === 'metric') {
          delete item.options.order;
        }
      })
    } else {
      // 指标只能选一个
      this.sortList.forEach((item, index) => {
        if (i !== index) {
          delete item.options.order;
        } else {
          if (item.options.order === '') {
            delete item.options.order;
          }
        }
      })
    }
  }

  /**
   * 排序规则
   * @param i
   */
  sortRules(i: number) {
    if (this.chartType === 'table') {
      // 透视图排序规则
      this.tableSortRules(i);
    } else {
      // 非透视图排序规则
      this.defaultSortRules(i);
    }
  }

  /**
   * change事件
   * @param e
   * @param i
   */
  change(e: Event, i: number) {
    // 赋值
    const newOption = this.sortList[i];
    newOption.options.order = (e.target as any).value;
    this.$set(this.sortList, i, newOption);
    // 排序规则
    this.sortRules(i);
    this.emitDate();
  }
  /**
   * 抛出changeDate
   */
  emitDate() {
    // 清空
    this.changeData = [];
    // 抛出修改项
    this.sortList.forEach((item) => {
      if (item.options.order) {
        this.changeData.push(JSON.parse(JSON.stringify(item)));
      }
    });
    this.$emit('changeData', this.changeData);
  }
  /**
   * 添加排序类型字段
   * @param data
   * @param type
   */
  addSortType(data: any, type: string) {
    if (!data) return;
    data.map((item) => item.sortType = type);
  }

  /**
   * 合并维度、指标数据
   */
  combineData() {
    let concatList: Array<any> = [];
    const chartList: Array<string> = ['bar', 'line', 'area', 'pileBar', 'stripe', 'radar', 'biax'];
    // 添加排序类型字段
    this.addSortType(this.deepCopyChart.data.groupDimension, 'groupDimension');
    this.addSortType(this.deepCopyChart.data.dimension, 'dimension');
    // 上述7个图表 + 2维1标，排序只显示维度字段
    if (this.deepCopyChart.data.dimension.length === 2 && chartList.includes(this.deepCopyChart.type)) {
      
      concatList = this.sortList.concat([
        ...this.deepCopyChart.data.groupDimension as any || [],
        ...this.deepCopyChart.data.dimension as any,
      ])
    } else {
      // 新增双轴图的多指标数据
      let biaxMetric: Array<H3.Report.FieldColumn> = []
      if (this.deepCopyChart.type === 'biax' && this.deepCopyChart.data.metricGroup) {
        this.deepCopyChart.data.metricGroup.forEach(m => {
        biaxMetric = [...biaxMetric, ...m]
      });
        this.addSortType(biaxMetric, 'metric');
      }
      // 添加排序类型字段
      this.addSortType(this.deepCopyChart.data.metric, 'metric');
      // 1维1标、1维多标显示全部字段
      concatList = this.sortList.concat([
        ...this.deepCopyChart.data.groupDimension as any || [],
        ...this.deepCopyChart.data.dimension as any,
        ...this.deepCopyChart.data.metric as any,
        ...biaxMetric as any,
      ])
    }
    // 合并维度、指标数组数据（显示规则：列维度、行维度、指标）
    concatList.forEach((item,index:number) => {
      if(item.options && item.options.order) {
        delete concatList[index].options.order
      }
      this.sortList.push(concatList[index]);
      this.deepCopyChart.data.sort.forEach((sort) => {
        if (sort.uid === item.uid) {
          sort.sortType = item.sortType;
          if(sort.options && sort.options.order) {
            this.sortList[index].options.order = sort.options.order;
          }
        }
      });
    });
  }

  /**
   * 透视图筛选排序数据
   */
  filterTableSortData() {
    if (this.chart.type === 'table') {
      // 判断是否存在行维度，如果不存在，则排序数据中不显示指标字段
      const isExistDimension = this.sortList.find((item) => item.sortType === 'dimension');
      if (!isExistDimension) {
        this.sortList.forEach((item, index) => {
          if (item.sortType === 'metric') {
            this.sortList = this.sortList.splice(0, index);
          }
        })
      }
    }
  }

  mounted () {
    // 合并维度、指标数据
    this.combineData();
    // 透视图筛选排序数据
    this.filterTableSortData();
    this.emitDate();
  }
}
</script>
<style lang="less">
  @import "../styles/index";
  .h3-report-sort-module {
    padding: 0 !important;
    &__field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    &__sort-name {
      display: flex;
      label {
        color: #304265;
        font-size:14px;
        margin-bottom: 0;
        font-weight: inherit;
      }
    }
    &__sort-label {
      max-width: 146px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &__order {
      label {
        margin-bottom: 0;
        font-weight: inherit;
      }
    }
  }
</style>
