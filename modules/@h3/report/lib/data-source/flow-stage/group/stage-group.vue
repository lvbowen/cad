<template>
  <div :class="prefixCls">
    
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Inject} from 'vue-property-decorator';
  import {namespace} from 'vuex-class';
  import {
    Button,
  } from '@h3/antd-vue';
  import H3Scroll from '@h3/report/basics/components/scroll';

  const ReportDataSource = namespace('dataSource');
  @Component({
    name: 'h3-report-stage-group',
    components: {
      AButton: Button,
      H3Scroll
    },
  })
  export default class ReportStageGroup extends Vue {
    @Prop() source!: H3.Falls.Source;
    @Prop() node!: H3.Falls.Node;
    prefixCls: string = 'h3-report-stage-group';

    
  

    created() {
    }

    mounted() {
    }

    updated() {
    }
  }
</script>
