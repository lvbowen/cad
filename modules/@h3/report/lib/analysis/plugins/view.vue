<template>
  <div :class="[prefixCls]" v-if="value">
    <h3-view
      :refresh="refresh"
      @add-chart="addChart"
      @edit-chart="editChart"
      @detail-chart="detailChart"
    >
    </h3-view>
  </div>
</template>

<script lang='ts'>
  import { Component, Vue, Watch, Provide,Prop } from 'vue-property-decorator';
  import {State, Action, Mutation, namespace} from 'vuex-class';
  import { ReportMutation, ReportAction } from '@h3/report/basics/store/analysis/types';
  import H3View from '../viewer';
  
  const Analysis = namespace('analysisState');
  @Component({
    name: 'h3-analysis-view-wrap',
    components: {
      H3View
    }
  })
  export default class ViewWrap extends Vue {
    @Prop({ default: false }) value!: boolean;   // 显示隐藏
    @Prop({ default: () => false }) refresh !: boolean;
    @Prop({default: () => {}}) animations!: H3.Report.AnimationGroup;

    prefixCls: string = 'h3-analysis-view-wrap';


    addChart() {
      this.$emit('add-chart')
    }
    editChart() {
      this.$emit('edit-chart')
    }
    detailChart() {
      this.$emit('detail-chart')
    }
    mounted() {
    
    }
    created() {
        
    }
    destroyed() {
       
    }
  }
</script>
<style lang="less">
  @import "../style/index.less";
</style>
