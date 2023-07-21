<template>
  <div class="emergency-equ-and-mat full-height">
    <commonComponent :reportId="reportId" :title="title"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component } from 'vue-property-decorator';
import commonComponent from '../riskListReport/common.vue';

@Component({
  name: 'EmergencyEquAndMat',
  components: {
    commonComponent
  }
})
export default class EmergencyEquAndMat extends Vue{
  reportId:string = 'yjwztz';
  title:string = '应急装备和物资登记台账'
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
</style>
