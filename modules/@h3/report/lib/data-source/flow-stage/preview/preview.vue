<template>
  <div :class="prefixCls">
    列表预览
  </div>
</template>

<script lang='ts'>
  import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
  import { namespace } from 'vuex-class';
  import {
    Button,
  } from '@h3/antd-vue';
  const ReportDataSource = namespace('dataSource');
  @Component({
    name: 'h3-report-stage-preview',
    components: {
      AButton: Button,
    },
  })
  export default class ReportStagePreview extends Vue {
    @Prop() source!: H3.Falls.Source;
    @Prop() node!: H3.Falls.Node;
    prefixCls:string = 'h3-report-stage-preview';

    created() {
    }
  }
</script>
