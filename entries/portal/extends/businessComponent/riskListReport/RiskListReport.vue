<template>
  <div class="risk-list-report full-height">
    <commonComponent :reportId="reportId" :title="title"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component } from 'vue-property-decorator';
import commonComponent from '../riskListReport/common.vue';

@Component({
  name: 'SafetyObjDec',
  components: {
    commonComponent
  }
})
export default class RiskListReport extends Vue{
  reportId:string = 'xmfxk';
  title:string = '风险清单报表'
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
</style>
