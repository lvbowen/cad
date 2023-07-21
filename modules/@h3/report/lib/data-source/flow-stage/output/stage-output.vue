<template>
  <div :class="prefixCls">
    <img :src="require(`@h3/report/basics/assets/data-source/right.png`)" :class="`${prefixCls}__img`"/>
    <div :class="[`${prefixCls}__label`]">
      若设置完成，请保存配置
    </div>
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
    name: 'h3-report-stage-output',
    components: {
      AButton: Button,
    },
  })
  export default class ReportStageOutput extends Vue {
    @Prop() node!: H3.Falls.Node;
    prefixCls:string = 'h3-report-stage-output';

    created() {
    }
  }
</script>
<style lang="less">
  .h3-report-stage-output{
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    &__label{
      padding-top: 24px;
      color: #8893A7;
    }
  } 
</style>
