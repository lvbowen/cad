<template>
  <div :class="`${comPrefixCls}__filter`">
    <div 
      :class="`${comPrefixCls}__filter-entry`" 
      @click= "modelShow"
    >
      <i class="h3yun_All filter-o"></i>
      <div :class="`${comPrefixCls}__filter-set`" v-if="isSet"></div>
    </div>
    <filter-model
      v-model="isShowModel"
      @set-filter = "changeFilter"
    ></filter-model>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { H3Button } from '@h3/thinking-ui';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { ElementType } from '@h3/report/basics/enum/chart-type';
import  FilterModel from './filter-model.vue'
const ReportPro = namespace('report');
@Component({
  name: 'h3-report-filter-entry',
  components: {
    FilterModel
  }
})
export default class ReportFilterEntry extends Vue {
  @Prop({
    default: 'h3-report-mobile'
  }) comPrefixCls!: string;
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: any};
  @ReportPro.State('charts') charts!: Array<H3.Report.Chart>;
  isShowModel: boolean = false;
  isSet: boolean =false;
  /**
   *  展示过滤弹窗
   */
  modelShow() {
    this.isShowModel = true;
  }
  /**
   *  改变筛选条件
   *  @param value
   */
  changeFilter(value: boolean) {
    this.isSet = value;
  }
  created() {
  }
  destroyed() {}
}
</script>
<style lang="less">
  @import "../style/index.less";
</style>
